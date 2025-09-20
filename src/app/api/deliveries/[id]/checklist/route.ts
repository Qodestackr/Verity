import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import z from "@/lib/zod";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

const updateChecklistItemSchema = z.object({
  id: z.string(),
  isCompleted: z.boolean(),
  notes: z.string().optional(),
});

// Schema for creating a checklist item
const createChecklistItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
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

    const deliveryId = params.id;

    // Get delivery to check organization
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        checklistItems: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this organization or is the assigned driver
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: delivery.organizationId,
      },
    });

    const driver = await prisma.driver.findFirst({
      where: {
        userId: session.user.id,
        id: delivery.driverId || "",
      },
    });

    if (!membership && !driver && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(delivery.checklistItems);
  } catch (error) {
    console.error("Error fetching checklist items:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist items" },
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

    const deliveryId = params.id;
    const body = await req.json();

    // Validate checklist item data
    const validatedData = createChecklistItemSchema.parse(body);

    // Get delivery to check organization
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: delivery.organizationId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create checklist item
    const checklistItem = await prisma.deliveryChecklistItem.create({
      data: {
        deliveryId,
        name: validatedData.name,
      },
    });

    return NextResponse.json(checklistItem, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist item:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create checklist item" },
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

    const deliveryId = params.id;
    const body = await req.json();

    // Validate update data - expect an array of items
    const validatedItems = z.array(updateChecklistItemSchema).parse(body);

    // Get delivery to check organization
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this organization or is the assigned driver
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: delivery.organizationId,
      },
    });

    const driver = await prisma.driver.findFirst({
      where: {
        userId: session.user.id,
        id: delivery.driverId || "",
      },
    });

    if (!membership && !driver && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update checklist items in a transaction
    const updatedItems = await prisma.$transaction(
      validatedItems.map((item) =>
        prisma.deliveryChecklistItem.update({
          where: {
            id: item.id,
            deliveryId, // Ensure the item belongs to this delivery
          },
          data: {
            isCompleted: item.isCompleted,
            notes: item.notes,
            completedAt: item.isCompleted ? new Date() : null,
          },
        })
      )
    );

    return NextResponse.json(updatedItems);
  } catch (error) {
    console.error("Error updating checklist items:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update checklist items" },
      { status: 500 }
    );
  }
}
