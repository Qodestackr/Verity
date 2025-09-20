import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import z from "@/lib/zod";
import {
  createSaleorWarehouse,
  updateSaleorWarehouse,
} from "@/services/saleor-service";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

// Validation schema for Saleor warehouse link
const saleorWarehouseLinkSchema = z.object({
  saleorChannelId: z.string().min(1, "Saleor channel ID is required"),
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

    const warehouseId = params.id;

    // Parse and validate request body
    const body = await req.json();
    const validatedData = saleorWarehouseLinkSchema.parse(body);

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

    // Verify Saleor channel belongs to organization
    const saleorChannel = await prisma.saleorChannel.findFirst({
      where: {
        saleorChannelId: validatedData.saleorChannelId,
        organizationId,
      },
    });

    if (!saleorChannel) {
      return NextResponse.json(
        { error: "Saleor channel not found" },
        { status: 404 }
      );
    }

    // Check if warehouse is already linked to Saleor
    if (warehouse.saleorWarehouseId) {
      // Update existing Saleor warehouse
      const updatedSaleorWarehouseId = await updateSaleorWarehouse(
        warehouse.saleorWarehouseId,
        {
          name: warehouse.name,
          address: {
            streetAddress1: warehouse.address || "",
            city: warehouse.city || "",
            country: warehouse.country || "KE",
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Saleor warehouse updated",
        saleorWarehouseId: updatedSaleorWarehouseId,
      });
    }

    // Create new Saleor warehouse
    // Note: call the Saleor API here
    const saleorWarehouseId = await createSaleorWarehouse({
      name: warehouse.name,
      channelId: validatedData.saleorChannelId,
      address: {
        streetAddress1: warehouse.address || "",
        city: warehouse.city || "",
        country: warehouse.country || "KE",
      },
    });

    // Update warehouse with Saleor warehouse ID
    const updatedWarehouse = await prisma.warehouse.update({
      where: { id: warehouseId },
      data: { saleorWarehouseId },
    });

    return NextResponse.json({
      success: true,
      warehouse: updatedWarehouse,
    });
  } catch (error) {
    console.error("Error linking warehouse to Saleor:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to link warehouse to Saleor" },
      { status: 500 }
    );
  }
}
