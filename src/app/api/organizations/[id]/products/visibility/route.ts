import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";
import z from "@/lib/zod";

const updateProductVisibilitySchema = z.object({
  productId: z.string(),
  isPublic: z.boolean().optional(),
  visibleToIds: z.array(z.string()).optional(),
  hiddenFromIds: z.array(z.string()).optional(),
});

// batch update product visibility
const batchUpdateProductVisibilitySchema = z.array(
  updateProductVisibilitySchema
);

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

    const productVisibility = await prisma.productVisibility.findMany(query);

    return NextResponse.json(productVisibility);
  } catch (error) {
    console.error("Error fetching product visibility settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch product visibility settings" },
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
      validatedData = batchUpdateProductVisibilitySchema.parse(body);
    } else {
      validatedData = [updateProductVisibilitySchema.parse(body)];
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
        prisma.productVisibility.upsert({
          where: {
            organizationId_productId: {
              organizationId,
              productId: item.productId,
            },
          },
          update: {
            isPublic: item.isPublic,
            visibleToIds: item.visibleToIds,
            hiddenFromIds: item.hiddenFromIds,
          },
          create: {
            organizationId,
            productId: item.productId,
            isPublic: item.isPublic ?? true,
            visibleToIds: item.visibleToIds ?? [],
            hiddenFromIds: item.hiddenFromIds ?? [],
          },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error updating product visibility:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update product visibility" },
      { status: 500 }
    );
  }
}
