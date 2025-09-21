import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import z from "@/lib/zod";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

// Schema for driver status update
const statusUpdateSchema = z.object({
  status: z.enum(["AVAILABLE", "ON_DELIVERY", "ON_BREAK", "OFFLINE"]),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
    })
    .optional(),
  notes: z.string().optional(),
});

export async function POST(
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

    const driverId = params.id;
    const body = await req.json();

    // Validate status update data
    const validatedData = statusUpdateSchema.parse(body);

    // Get driver to check organization
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Check if user has access to this organization or is the driver
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: driver.organizationId,
      },
    });

    const isDriver = driver.userId === session.user.id;

    if (!membership && !isDriver && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create check-in record
    const checkIn = await prisma.driverCheckIn.create({
      data: {
        driverId,
        status: validatedData.status,
        location: validatedData.location,
        notes: validatedData.notes,
      },
    });

    // Update driver status
    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        status: validatedData.status,
        currentLocation: validatedData.location,
      },
    });

    return NextResponse.json({
      driver: updatedDriver,
      checkIn,
    });
  } catch (error) {
    console.error("Error updating driver status:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update driver status" },
      { status: 500 }
    );
  }
}
