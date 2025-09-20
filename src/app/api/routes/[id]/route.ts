import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import z from "@/lib/zod";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

const updateRouteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  status: z
    .enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
  stops: z.array(z.string()).optional(), // Array of delivery IDs
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  actualDuration: z.number().optional(),
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
    const routeId = params.id;

    // Get route with related data
    const route = await prisma.deliveryRoute.findUnique({
      where: { id: routeId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            currentLocation: true,
          },
        },
      },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Check if user has access to this organization or is the assigned driver
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: route.organizationId,
      },
    });

    const driver = await prisma.driver.findFirst({
      where: {
        userId: session.user.id,
        id: route.driverId,
      },
    });

    if (!membership && !driver && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get deliveries for this route
    const deliveries = await prisma.delivery.findMany({
      where: {
        id: { in: route.stops as string[] },
      },
      include: {
        checklistItems: true,
      },
    });

    return NextResponse.json({
      ...route,
      deliveries,
    });
  } catch (error) {
    console.error("Error fetching route:", error);
    return NextResponse.json(
      { error: "Failed to fetch route" },
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

    const routeId = params.id;
    const body = await req.json();

    // Validate update data
    const validatedData = updateRouteSchema.parse(body);

    // Get route to check organization
    const route = await prisma.deliveryRoute.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Check if user has access to this organization or is the assigned driver
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: route.organizationId,
      },
    });

    const driver = await prisma.driver.findFirst({
      where: {
        userId: session.user.id,
        id: route.driverId,
      },
    });

    if (!membership && !driver && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle status transitions and related actions
    const updateData: any = {
      ...validatedData,
      startedAt: validatedData.startedAt
        ? new Date(validatedData.startedAt)
        : undefined,
      completedAt: validatedData.completedAt
        ? new Date(validatedData.completedAt)
        : undefined,
    };

    // If status is changing to IN_PROGRESS, update driver status
    if (
      validatedData.status === "IN_PROGRESS" &&
      route.status !== "IN_PROGRESS"
    ) {
      updateData.startedAt = updateData.startedAt || new Date();

      // Update driver status
      await prisma.driver.update({
        where: { id: route.driverId },
        data: {
          status: "ON_DELIVERY",
        },
      });
    }
    // If status is changing to COMPLETED, update driver status and deliveries
    else if (
      validatedData.status === "COMPLETED" &&
      route.status !== "COMPLETED"
    ) {
      updateData.completedAt = updateData.completedAt || new Date();

      // Update driver status
      await prisma.driver.update({
        where: { id: route.driverId },
        data: {
          status: "AVAILABLE",
        },
      });

      // Check if all deliveries are completed
      const deliveries = await prisma.delivery.findMany({
        where: {
          id: { in: route.stops as string[] },
        },
      });

      const pendingDeliveries = deliveries.filter(
        (d) => d.status !== "DELIVERED" && d.status !== "FAILED"
      );

      if (pendingDeliveries.length > 0) {
        return NextResponse.json(
          { error: "Cannot complete route with pending deliveries" },
          { status: 400 }
        );
      }
    }

    // Update route
    const updatedRoute = await prisma.deliveryRoute.update({
      where: { id: routeId },
      data: updateData,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRoute);
  } catch (error) {
    console.error("Error updating route:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update route" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const routeId = params.id;

    // Get route to check organization
    const route = await prisma.deliveryRoute.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: route.organizationId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow deletion of PLANNED routes
    if (route.status !== "PLANNED") {
      return NextResponse.json(
        { error: "Only planned routes can be deleted" },
        { status: 400 }
      );
    }

    await prisma.delivery.updateMany({
      where: {
        id: { in: route.stops as string[] },
        status: "ASSIGNED", // Only update if still in ASSIGNED status
      },
      data: {
        driverId: null,
        status: "PENDING",
      },
    });

    await prisma.deliveryRoute.delete({
      where: { id: routeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting route:", error);
    return NextResponse.json(
      { error: "Failed to delete route" },
      { status: 500 }
    );
  }
}
