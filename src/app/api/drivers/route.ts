import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import z from "@/lib/zod";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

// Schema for creating a driver
const createDriverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  email: z.string().email("Invalid email address").optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  licenseExpiry: z.string().optional().nullable(),
  vehicleType: z.enum(["PERSONAL", "VAN", "TRUCK", "MOTORBIKE"]),
  vehicleDetails: z
    .object({
      registration: z.string().optional(),
      model: z.string().optional(),
      color: z.string().optional(),
      year: z.number().optional(),
    })
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

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optional filters
    const status = searchParams.get("status");
    const isActive = searchParams.get("isActive") === "true";
    const search = searchParams.get("search");

    // Build query
    const query: any = {
      where: {
        organizationId,
        ...(status && { status }),
        ...(searchParams.has("isActive") && { isActive }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    const drivers = await prisma.driver.findMany(query);

    return NextResponse.json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
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
    const { organizationId, ...driverData } = body;

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

    // Validate driver data
    const validatedData = createDriverSchema.parse(driverData);

    // Check if driver with same phone already exists
    const existingDriver = await prisma.driver.findFirst({
      where: {
        organizationId,
        phone: validatedData.phone,
      },
    });

    if (existingDriver) {
      return NextResponse.json(
        { error: "Driver with this phone number already exists" },
        { status: 400 }
      );
    }

    // Create driver
    const driver = await prisma.driver.create({
      data: {
        ...validatedData,
        organizationId,
        licenseExpiry: validatedData.licenseExpiry
          ? new Date(validatedData.licenseExpiry)
          : undefined,
      },
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    console.error("Error creating driver:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create driver" },
      { status: 500 }
    );
  }
}
