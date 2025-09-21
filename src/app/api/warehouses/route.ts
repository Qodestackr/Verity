import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

import z from "@/lib/zod";

// Validation schema for warehouse data
const warehouseSchema = z.object({
  name: z.string().min(2, "Warehouse name is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional().default("Kenya"),
  isDefault: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = warehouseSchema.parse(body);

    // Get user's organization
    const userId = session.user.id;
    const userWithOrg = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizationMembers: { include: { organization: true } } },
    });

    if (!userWithOrg || userWithOrg.organizationMembers.length === 0) {
      return NextResponse.json(
        { error: "User does not have an organization" },
        { status: 400 }
      );
    }

    const organizationId = userWithOrg.organizationMembers[0].organizationId;

    // If this is the first warehouse, make it default
    const existingWarehouses = await prisma.warehouse.findMany({
      where: { organizationId },
    });

    const isFirstWarehouse = existingWarehouses.length === 0;
    const isDefault = isFirstWarehouse || validatedData.isDefault;

    // If making this warehouse default, unset default flag on other warehouses
    if (isDefault && !isFirstWarehouse) {
      await prisma.warehouse.updateMany({
        where: {
          organizationId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Create the warehouse
    const warehouse = await prisma.warehouse.create({
      data: {
        organizationId,
        name: validatedData.name,
        description: validatedData.description,
        address: validatedData.address,
        city: validatedData.city,
        region: validatedData.region,
        country: validatedData.country,
        isDefault,
        isActive: true,
      },
    });

    // If this is from onboarding, update the onboarding preference
    const onboardingPreference = await prisma.onboardingPreference.findUnique({
      where: { organizationId },
    });

    if (onboardingPreference && onboardingPreference.warehouseName) {
      await prisma.onboardingPreference.update({
        where: { organizationId },
        data: { warehouseName: null }, // Clear the warehouse name as it's now created
      });
    }

    return NextResponse.json({
      success: true,
      warehouse,
    });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create warehouse" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const userId = session.user.id;
    const userWithOrg = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizationMembers: { include: { organization: true } } },
    });

    if (!userWithOrg || userWithOrg.organizationMembers.length === 0) {
      return NextResponse.json(
        { error: "User does not have an organization" },
        { status: 400 }
      );
    }

    const organizationId = userWithOrg.organizationMembers[0].organizationId;

    // Get warehouses for the organization
    const warehouses = await prisma.warehouse.findMany({
      where: { organizationId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      warehouses,
    });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}
