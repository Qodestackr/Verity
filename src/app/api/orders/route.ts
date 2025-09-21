import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";
import z from "@/lib/zod";

const createOrderSchema = z.object({
  organizationId: z.string(),
  supplierId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      notes: z.string().optional(),
    })
  ),
  notes: z.string().optional(),
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

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const status = searchParams.get("status");
    const supplierId = searchParams.get("supplierId");

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

    // Build query
    const where: any = {
      organizationId,
      ...(status && { status }),
      ...(supplierId && { supplierId }),
    };

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        orderDate: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
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

    // Validate request body
    const validatedData = createOrderSchema.parse(body);

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: validatedData.organizationId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if there's an active relationship with the supplier
    const relationship = await prisma.businessRelationship.findFirst({
      where: {
        OR: [
          {
            requesterId: validatedData.organizationId,
            targetId: validatedData.supplierId,
          },
          {
            requesterId: validatedData.supplierId,
            targetId: validatedData.organizationId,
          },
        ],
        status: "ACTIVE",
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "No active relationship with this supplier" },
        { status: 403 }
      );
    }

    // Check if the relationship has PLACE_ORDERS permission
    const orderPermission = await prisma.relationshipPermission.findFirst({
      where: {
        relationshipId: relationship.id,
        permissionType: "PLACE_ORDERS",
        isGranted: true,
      },
    });

    if (!orderPermission) {
      return NextResponse.json(
        {
          error: "You don't have permission to place orders with this supplier",
        },
        { status: 403 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 1000
    )}`;

    // Calculate total amount
    const totalAmount = validatedData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          organizationId: validatedData.organizationId,
          customerId: validatedData.supplierId, // In B2B, BAD::the supplier is the "customer"
          orderNumber,
          status: "PENDING",
          totalAmount,
          discountAmount: 0,
          taxAmount: 0,
          shippingAmount: 0,
          finalAmount: totalAmount,
          paymentMethod: "MPESA", // Default payment method
          paymentStatus: "PENDING",
          notes: validatedData.notes,
          orderDate: new Date(),
        },
      });

      // Create order items
      await Promise.all(
        validatedData.items.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              notes: item.notes,
            },
          })
        )
      );

      // Create relationship interaction
      await tx.relationshipInteraction.create({
        data: {
          relationshipId: relationship.id,
          type: "ORDER_PLACED",
          initiatedById: validatedData.organizationId,
          metadata: {
            orderId: newOrder.id,
            orderNumber,
            totalAmount,
          },
        },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
