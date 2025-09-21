import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import z from "@/lib/zod";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

const updateDeliverySchema = z.object({
  driverId: z.string().optional(),
  status: z
    .enum([
      "PENDING",
      "ASSIGNED",
      "IN_TRANSIT",
      "DELIVERED",
      "FAILED",
      "RESCHEDULED",
    ])
    .optional(),
  scheduledFor: z.string().optional(),
  deliveryNotes: z.string().optional(),
  proofOfDelivery: z
    .object({
      images: z.array(z.string()).optional(),
      signature: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  receivedBy: z.string().optional(),
  failureReason: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  completedAt: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deliveryId = params.id;

    // Get delivery with related data
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            rating: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            paymentMethod: true,
            paymentStatus: true,
            items: {
              select: {
                id: true,
                productId: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,
              },
            },
          },
        },
        checklistItems: true,
        issues: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this organization or is the assigned driver
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: delivery.organizationId,
      },
    });

    const driver = await prisma.driver.findFirst({
      where: {
        userId: session.user.id,
        id: delivery.driverId || "",
      },
    });

    if (!membership && !driver && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Error fetching delivery:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deliveryId = params.id;
    const body = await req.json();

    // Validate update data
    const validatedData = updateDeliverySchema.parse(body);

    // Get delivery to check organization and current status
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: true,
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this organization or is the assigned driver
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: delivery.organizationId,
      },
    });

    const driver = await prisma.driver.findFirst({
      where: {
        userId: session.user.id,
        id: delivery.driverId || "",
      },
    });

    if (!membership && !driver && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle status transitions and related actions
    const updateData: any = {
      ...validatedData,
      scheduledFor: validatedData.scheduledFor
        ? new Date(validatedData.scheduledFor)
        : undefined,
      completedAt: validatedData.completedAt
        ? new Date(validatedData.completedAt)
        : undefined,
    };

    // If status is changing to DELIVERED or FAILED, update related records
    if (validatedData.status) {
      if (
        validatedData.status === "DELIVERED" &&
        delivery.status !== "DELIVERED"
      ) {
        // Mark as delivered
        updateData.completedAt = updateData.completedAt || new Date();

        // Update order if it exists
        if (delivery.orderId) {
          await prisma.order.update({
            where: { id: delivery.orderId },
            data: {
              status: "COMPLETED",
              fulfillmentStatus: "fulfilled",
              fulfillmentDate: new Date(),
            },
          });
        }

        // Update driver stats
        if (delivery.driverId) {
          await prisma.driver.update({
            where: { id: delivery.driverId },
            data: {
              totalDeliveries: { increment: 1 },
              successfulDeliveries: { increment: 1 },
            },
          });
        }
      } else if (
        validatedData.status === "FAILED" &&
        delivery.status !== "FAILED"
      ) {
        // Mark as failed
        updateData.completedAt = updateData.completedAt || new Date();

        // Update order if it exists
        if (delivery.orderId) {
          await prisma.order.update({
            where: { id: delivery.orderId },
            data: {
              status: "CANCELLED",
              // Keep fulfillment status as is
            },
          });
        }

        // Update driver stats
        if (delivery.driverId) {
          await prisma.driver.update({
            where: { id: delivery.driverId },
            data: {
              totalDeliveries: { increment: 1 },
              failedDeliveries: { increment: 1 },
            },
          });
        }
      } else if (
        validatedData.status === "IN_TRANSIT" &&
        delivery.status !== "IN_TRANSIT"
      ) {
        // Update order if it exists
        if (delivery.orderId) {
          await prisma.order.update({
            where: { id: delivery.orderId },
            data: {
              status: "PROCESSING",
              fulfillmentStatus: "partially_fulfilled",
            },
          });
        }

        // Update driver status
        if (delivery.driverId) {
          await prisma.driver.update({
            where: { id: delivery.driverId },
            data: {
              status: "ON_DELIVERY",
            },
          });
        }
      } else if (
        validatedData.status === "ASSIGNED" &&
        delivery.status !== "ASSIGNED"
      ) {
        // Update order if it exists
        if (delivery.orderId) {
          await prisma.order.update({
            where: { id: delivery.orderId },
            data: {
              status: "PROCESSING",
              fulfillmentStatus: "unfulfilled",
            },
          });
        }
      }
    }

    // Update delivery
    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        checklistItems: true,
      },
    });

    return NextResponse.json(updatedDelivery);
  } catch (error) {
    console.error("Error updating delivery:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update delivery" },
      { status: 500 }
    );
  }
}
