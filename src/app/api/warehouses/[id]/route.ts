import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import z from "@/lib/zod";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

// Validation schema for warehouse update
const warehouseUpdateSchema = z.object({
  name: z.string().min(2, "Warehouse name is required").optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
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

    const warehouseId = params.id;

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

    // Get warehouse
    const warehouse = await prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        organizationId,
      },
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      warehouse,
    });
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse" },
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

    const warehouseId = params.id;

    // Parse and validate request body
    const body = await req.json();
    const validatedData = warehouseUpdateSchema.parse(body);

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

    // Verify warehouse belongs to organization
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        organizationId,
      },
    });

    if (!existingWarehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    // If making this warehouse default, unset default flag on other warehouses
    if (validatedData.isDefault) {
      await prisma.warehouse.updateMany({
        where: {
          organizationId,
          isDefault: true,
          id: { not: warehouseId },
        },
        data: { isDefault: false },
      });
    }

    // Update the warehouse
    const updatedWarehouse = await prisma.warehouse.update({
      where: { id: warehouseId },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      warehouse: updatedWarehouse,
    });
  } catch (error) {
    console.error("Error updating warehouse:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update warehouse" },
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

    const warehouseId = params.id;

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

    // Verify warehouse belongs to organization
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        organizationId,
      },
    });

    if (!existingWarehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    // Check if this is the default warehouse
    if (existingWarehouse.isDefault) {
      // Find another warehouse to make default
      const anotherWarehouse = await prisma.warehouse.findFirst({
        where: {
          organizationId,
          id: { not: warehouseId },
          isActive: true,
        },
      });

      if (anotherWarehouse) {
        await prisma.warehouse.update({
          where: { id: anotherWarehouse.id },
          data: { isDefault: true },
        });
      }
    }

    // Delete the warehouse
    await prisma.warehouse.delete({
      where: { id: warehouseId },
    });

    return NextResponse.json({
      success: true,
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 }
    );
  }
}
