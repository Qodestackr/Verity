import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";
import z from "@/lib/zod";

const updateVisibilitySchema = z.object({
  isDiscoverable: z.boolean().optional(),
  showContactInfo: z.boolean().optional(),
  showProducts: z.boolean().optional(),
  showPricing: z.boolean().optional(),
  defaultNewConnectionPermissions: z
    .object({
      VIEW_PRODUCTS: z.object({
        isGranted: z.boolean(),
        scope: z.enum(["ALL", "SELECTED", "NONE"]),
      }),
      VIEW_PRICES: z.object({
        isGranted: z.boolean(),
        scope: z.enum(["ALL", "SELECTED", "NONE"]),
      }),
      VIEW_INVENTORY: z.object({
        isGranted: z.boolean(),
        scope: z.enum(["ALL", "SELECTED", "NONE"]),
      }),
      PLACE_ORDERS: z.object({
        isGranted: z.boolean(),
        scope: z.enum(["ALL", "SELECTED", "NONE"]),
      }),
      VIEW_ANALYTICS: z.object({
        isGranted: z.boolean(),
        scope: z.enum(["ALL", "SELECTED", "NONE"]),
      }),
      VIEW_PROMOTIONS: z.object({
        isGranted: z.boolean(),
        scope: z.enum(["ALL", "SELECTED", "NONE"]),
      }),
      VIEW_CONTACTS: z.object({
        isGranted: z.boolean(),
        scope: z.enum(["ALL", "SELECTED", "NONE"]),
      }),
    })
    .optional(),
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

    // Get visibility settings
    let settings = await prisma.visibilitySettings.findUnique({
      where: { organizationId },
    });

    // If settings don't exist, create default settings
    if (!settings) {
      settings = await prisma.visibilitySettings.create({
        data: {
          organizationId,
          isDiscoverable: true,
          showContactInfo: true,
          showProducts: true,
          showPricing: false,
          defaultNewConnectionPermissions: {
            VIEW_PRODUCTS: { isGranted: true, scope: "ALL" },
            VIEW_PRICES: { isGranted: false, scope: "NONE" },
            VIEW_INVENTORY: { isGranted: false, scope: "NONE" },
            PLACE_ORDERS: { isGranted: true, scope: "ALL" },
            VIEW_ANALYTICS: { isGranted: false, scope: "NONE" },
            VIEW_PROMOTIONS: { isGranted: true, scope: "ALL" },
            VIEW_CONTACTS: { isGranted: true, scope: "ALL" },
          },
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching visibility settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch visibility settings" },
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

    const organizationId = params.id;
    const body = await req.json();

    // Validate update data
    const validatedData = updateVisibilitySchema.parse(body);

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

    // Update or create visibility settings
    const settings = await prisma.visibilitySettings.upsert({
      where: { organizationId },
      update: validatedData,
      create: {
        organizationId,
        ...validatedData,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating visibility settings:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update visibility settings" },
      { status: 500 }
    );
  }
}
