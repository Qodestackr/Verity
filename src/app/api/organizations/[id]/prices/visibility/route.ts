import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

import z from "@/lib/zod";

const updatePriceVisibilitySchema = z.object({
  productId: z.string(),
  isPublic: z.boolean().optional(),
  customPricing: z
    .record(
      z.string(),
      z.object({
        price: z.number(),
        currency: z.string().default("KES"),
        effectiveFrom: z.string().optional(),
        effectiveTo: z.string().optional(),
        minimumQuantity: z.number().optional(),
      })
    )
    .optional(),
});

// Schema for batch updating price visibility
const batchUpdatePriceVisibilitySchema = z.array(updatePriceVisibilitySchema);

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

    const organizationId = params.id;

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
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    // Build query
    const query: any = {
      where: {
        organizationId,
        ...(productId && { productId }),
      },
    };

    const priceVisibility = await prisma.priceVisibility.findMany(query);

    return NextResponse.json(priceVisibility);
  } catch (error) {
    console.error("Error fetching price visibility settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch price visibility settings" },
      { status: 500 }
    );
  }
}

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

    const organizationId = params.id;
    const body = await req.json();

    // Check if it's a batch update
    const isBatch = Array.isArray(body);

    // Validate data
    let validatedData;
    if (isBatch) {
      validatedData = batchUpdatePriceVisibilitySchema.parse(body);
    } else {
      validatedData = [updatePriceVisibilitySchema.parse(body)];
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

    // Process updates in a transaction
    const results = await prisma.$transaction(
      validatedData.map((item) =>
        prisma.priceVisibility.upsert({
          where: {
            organizationId_productId: {
              organizationId,
              productId: item.productId,
            },
          },
          update: {
            isPublic: item.isPublic,
            customPricing: item.customPricing,
          },
          create: {
            organizationId,
            productId: item.productId,
            isPublic: item.isPublic ?? false,
            customPricing: item.customPricing ?? {},
          },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error updating price visibility:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update price visibility" },
      { status: 500 }
    );
  }
}
