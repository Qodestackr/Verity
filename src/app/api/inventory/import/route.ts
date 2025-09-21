import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";
import prisma from "@/lib/prisma";
import z from "@/lib/zod";
import { fetchProductsFromSaleor } from "@/services/saleor-service";
import { storeProductsInRedis } from "@/services/redis-service";

const importSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  saleorChannelId: z.string().min(1, "Saleor channel ID is required"),
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

    const body = await req.json();
    const validatedData = importSchema.parse(body);

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
        id: validatedData.warehouseId,
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

    // Fetch products from Saleor
    const saleorProducts = await fetchProductsFromSaleor(
      validatedData.saleorChannelId
    );

    const transformedProducts = saleorProducts.map((product) => ({
      ...product,
      price: 1,
      quantity: 0,
    }));

    // Store in Redis/Upstash for quick access
    await storeProductsInRedis(userId, transformedProducts);

    // Create inventory items in database
    const inventoryItems = await Promise.all(
      transformedProducts.map(async (product) => {
        // Check if inventory item already exists
        const existingItem = await prisma.inventoryItem.findFirst({
          where: {
            warehouseId: validatedData.warehouseId,
            saleorProductId: product.id,
          },
        });

        if (existingItem) {
          // Update existing item
          return prisma.inventoryItem.update({
            where: { id: existingItem.id },
            data: {
              sku: product.sku,
              barcode: product.barcode,
              sellingPrice: product.price,
              quantity: product.quantity,
              isActive: true,
            },
          });
        } else {
          // why duplicates? ... for CDC in external sys
          return prisma.inventoryItem.create({
            data: {
              warehouseId: validatedData.warehouseId,
              productId: product.id, // Using Saleor product ID as product ID
              saleorProductId: product.id,
              saleorVariantId: product.variantId,
              sku: product.sku,
              barcode: product.barcode,
              sellingPrice: product.price,
              quantity: product.quantity,
              isActive: true,
            },
          });
        }
      })
    );

    return NextResponse.json({
      success: true,
      message: `Imported ${inventoryItems.length} products`,
      count: inventoryItems.length,
    });
  } catch (error) {
    console.error("Error importing inventory:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to import inventory" },
      { status: 500 }
    );
  }
}
