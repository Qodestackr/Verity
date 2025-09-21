import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import z from "@/lib/zod";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

// Schema for creating a delivery
const createDeliverySchema = z.object({
  orderId: z.string().optional(),
  driverId: z.string().optional(),
  scheduledFor: z.string(),
  customerName: z
    .string()
    .min(2, "Customer name must be at least 2 characters"),
  customerPhone: z
    .string()
    .min(10, "Customer phone must be at least 10 characters"),
  customerAddress: z
    .string()
    .min(5, "Customer address must be at least 5 characters"),
  deliveryNotes: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  checklistItems: z
    .array(
      z.object({
        name: z.string(),
      })
    )
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get organization ID from session or query params
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    // Check if user is a driver for this organization
    const driver = await prisma.driver.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    if (!membership && !driver && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optional filters
    const status = searchParams.get("status");
    const driverId = searchParams.get("driverId");
    const date = searchParams.get("date");
    const search = searchParams.get("search");

    // Build query
    const query: any = {
      where: {
        organizationId,
        ...(status && { status }),
        ...(driverId && { driverId }),
        ...(date && {
          scheduledFor: {
            gte: new Date(`${date}T00:00:00Z`),
            lt: new Date(`${date}T23:59:59Z`),
          },
        }),
        ...(search && {
          OR: [
            { customerName: { contains: search, mode: "insensitive" } },
            { customerPhone: { contains: search, mode: "insensitive" } },
            { customerAddress: { contains: search, mode: "insensitive" } },
          ],
        }),
        // If user is a driver, only show their deliveries
        ...(driver && { driverId: driver.id }),
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
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
      },
      orderBy: {
        scheduledFor: "asc",
      },
    };

    const deliveries = await prisma.delivery.findMany(query);

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { organizationId, checklistItems, ...deliveryData } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate delivery data
    const validatedData = createDeliverySchema.parse({
      ...deliveryData,
      checklistItems,
    });

    // If order ID is provided, check if it exists and update its status
    if (validatedData.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: validatedData.orderId },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Update order status to indicate it's being prepared for delivery
      await prisma.order.update({
        where: { id: validatedData.orderId },
        data: {
          status: "PROCESSING",
          fulfillmentStatus: "unfulfilled",
        },
      });
    }

    // Create delivery with checklist items in a transaction
    const delivery = await prisma.$transaction(async (tx) => {
      // Create the delivery - FIX: Remove checklistItems from direct insertion
      const { checklistItems: itemsToCreate, ...deliveryDataToCreate } =
        validatedData;

      const newDelivery = await tx.delivery.create({
        data: {
          ...deliveryDataToCreate,
          organizationId,
          scheduledFor: new Date(validatedData.scheduledFor),
          status: "PENDING",
          orderId: validatedData.orderId || "", // Ensure orderId is a string even if undefined
        },
      });

      // Create checklist items if provided
      if (itemsToCreate && itemsToCreate.length > 0) {
        await Promise.all(
          itemsToCreate.map((item) =>
            tx.deliveryChecklistItem.create({
              data: {
                deliveryId: newDelivery.id,
                name: item.name,
              },
            })
          )
        );
      }

      return newDelivery;
    });

    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    console.error("Error creating delivery:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create delivery" },
      { status: 500 }
    );
  }
}
