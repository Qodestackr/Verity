import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import z from "@/lib/zod";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

const createRouteSchema = z.object({
  driverId: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  date: z.string(),
  stops: z.array(z.string()), // Array of delivery IDs
  optimizationScore: z.number().optional(),
  totalDistance: z.number().optional(),
  estimatedDuration: z.number().optional(),
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

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    const driver = await prisma.driver.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    if (!membership && !driver && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const driverId = searchParams.get("driverId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const query: any = {
      where: {
        organizationId,
        ...(driverId && { driverId }),
        ...(date && {
          date: {
            gte: new Date(`${date}T00:00:00Z`),
            lt: new Date(`${date}T23:59:59Z`),
          },
        }),
        ...(status && { status }),
        // If user is a driver, only show their routes
        ...(driver && { driverId: driver.id }),
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    };

    const routes = await prisma.deliveryRoute.findMany(query);

    return NextResponse.json(routes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      { error: "Failed to fetch routes" },
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
    const { organizationId, ...routeData } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const validatedData = createRouteSchema.parse(routeData);

    const driver = await prisma.driver.findFirst({
      where: {
        id: validatedData.driverId,
        organizationId,
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found or does not belong to this organization" },
        { status: 404 }
      );
    }

    const deliveries = await prisma.delivery.findMany({
      where: {
        id: { in: validatedData.stops },
        organizationId,
      },
    });

    if (deliveries.length !== validatedData.stops.length) {
      return NextResponse.json(
        {
          error:
            "One or more deliveries not found or do not belong to this organization",
        },
        { status: 404 }
      );
    }

    const route = await prisma.deliveryRoute.create({
      data: {
        organizationId,
        driverId: validatedData.driverId,
        name: validatedData.name,
        date: new Date(validatedData.date),
        stops: validatedData.stops,
        optimizationScore: validatedData.optimizationScore,
        totalDistance: validatedData.totalDistance,
        estimatedDuration: validatedData.estimatedDuration,
        status: "PLANNED",
      },
    });

    await prisma.delivery.updateMany({
      where: {
        id: { in: validatedData.stops },
      },
      data: {
        driverId: validatedData.driverId,
        status: "ASSIGNED",
      },
    });

    return NextResponse.json(route, { status: 201 });
  } catch (error) {
    console.error("Error creating route:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create route" },
      { status: 500 }
    );
  }
}
