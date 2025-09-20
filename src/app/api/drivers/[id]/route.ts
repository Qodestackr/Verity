import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import z from "@/lib/zod";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

const updateDriverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .optional(),
  email: z.string().email("Invalid email address").optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  licenseExpiry: z.string().optional().nullable(),
  vehicleType: z.enum(["PERSONAL", "VAN", "TRUCK", "MOTORBIKE"]).optional(),
  vehicleDetails: z
    .object({
      registration: z.string().optional(),
      model: z.string().optional(),
      color: z.string().optional(),
      year: z.number().optional(),
    })
    .optional(),
  status: z
    .enum(["AVAILABLE", "ON_DELIVERY", "ON_BREAK", "OFFLINE"])
    .optional(),
  isActive: z.boolean().optional(),
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

    const driverId = params.id;

    // Get driver with delivery stats
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        _count: {
          select: {
            deliveries: true,
          },
        },
        deliveries: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            scheduledFor: true,
            customerName: true,
            customerAddress: true,
          },
        },
        checkIns: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: driver.organizationId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error("Error fetching driver:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver" },
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

    const driverId = params.id;
    const body = await req.json();

    // Validate update data
    const validatedData = updateDriverSchema.parse(body);

    // Get driver to check organization
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: driver.organizationId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update driver
    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        ...validatedData,
        licenseExpiry: validatedData.licenseExpiry
          ? new Date(validatedData.licenseExpiry)
          : undefined,
      },
    });

    return NextResponse.json(updatedDriver);
  } catch (error) {
    console.error("Error updating driver:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update driver" },
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

    const driverId = params.id;

    // Get driver to check organization
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: driver.organizationId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Instead of hard delete, set as inactive
    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: { isActive: false },
    });

    return NextResponse.json(updatedDriver);
  } catch (error) {
    console.error("Error deactivating driver:", error);
    return NextResponse.json(
      { error: "Failed to deactivate driver" },
      { status: 500 }
    );
  }
}
