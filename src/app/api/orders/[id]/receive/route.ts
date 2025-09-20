import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";
import z from "@/lib/zod";

// Schema for receiving an order
const receiveOrderSchema = z.object({
  organizationId: z.string(),
  items: z.array(
    z.object({
      orderItemId: z.string(),
      productId: z.string(),
      receivedQuantity: z.number().min(0),
      notes: z.string().optional(),
    })
  ),
  notes: z.string().optional(),
  isPartial: z.boolean().optional(),
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

    const orderId = params.id;
    const body = await req.json();

    // Validate request body
    const validatedData = receiveOrderSchema.parse(body);

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

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.organizationId !== validatedData.organizationId) {
      return NextResponse.json(
        { error: "This order does not belong to your organization" },
        { status: 403 }
      );
    }

    // Check if order is in a state that can be received [SHIPPED, DELIVERED]
    if (
      order.status !== OrderStatus.COMPLETED &&
      order.status !== OrderStatus.CANCELLED
    ) {
      return NextResponse.json(
        { error: "Order cannot be received in its current state" },
        { status: 400 }
      );
    }

    // Process the receipt in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          fulfillmentStatus: validatedData.isPartial
            ? "partially_fulfilled"
            : "fulfilled",
          fulfillmentDate: new Date(),
        },
      });

      // Create a stock audit batch for this receipt
      const auditBatch = await tx.stockAuditBatch.create({
        data: {
          source: "RECEIVE",
          reference: order.orderNumber,
          notes: validatedData.notes,
          userId: session.user.id,
          supplierId: order.customerId, // In B2B, the customerId is the supplier's ID
          receiptNumber: `RCV-${Date.now().toString().slice(-6)}`,
          deliveryDate: new Date(),
          paymentStatus: order.paymentStatus,
          orderNumber: order.orderNumber,
        },
      });

      // Process each received item
      for (const item of validatedData.items) {
        if (item.receivedQuantity > 0) {
          // Get the warehouse ID (assuming the first warehouse for simplicity)
          const warehouse = await tx.warehouse.findFirst({
            where: {
              organizationId: validatedData.organizationId,
              isActive: true,
            },
          });

          if (!warehouse) {
            throw new Error("No active warehouse found for this organization");
          }

          // Get current inventory level
          const inventoryItem = await tx.inventoryItem.findFirst({
            where: {
              warehouseId: warehouse.id,
              productId: item.productId,
            },
          });

          const previousStock = inventoryItem?.quantity || 0;
          const newStock = previousStock + item.receivedQuantity;

          // Update or create inventory item
          if (inventoryItem) {
            await tx.inventoryItem.update({
              where: { id: inventoryItem.id },
              data: {
                quantity: newStock,
                lastStockCheck: new Date(),
              },
            });
          } else {
            // Get product details from order item
            const orderItem = order.items.find(
              (oi) => oi.id === item.orderItemId
            );

            if (!orderItem) {
              throw new Error(`Order item ${item.orderItemId} not found`);
            }

            await tx.inventoryItem.create({
              data: {
                warehouseId: warehouse.id,
                productId: item.productId,
                quantity: item.receivedQuantity,
                costPrice: orderItem.unitPrice,
                sellingPrice: orderItem.unitPrice * 1.2, // Default markup
                lastStockCheck: new Date(),
              },
            });
          }

          // Create audit log entry
          await tx.stockAuditLog.create({
            data: {
              sku: item.productId, // Using productId as SKU for simplicity
              previousStock,
              quantityChange: item.receivedQuantity,
              currentStock: newStock,
              unitCost:
                order.items.find((oi) => oi.id === item.orderItemId)
                  ?.unitPrice || 0,
              totalCost:
                (order.items.find((oi) => oi.id === item.orderItemId)
                  ?.unitPrice || 0) * item.receivedQuantity,
              source: "RECEIVE",
              reference: order.orderNumber,
              notes: item.notes,
              userId: session.user.id,
              warehouseId: warehouse.id,
              supplierId: order.customerId,
              batchId: auditBatch.id,
              status: "COMPLETED",
            },
          });
        }
      }

      return {
        order: updatedOrder,
        auditBatch,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error receiving order:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to process order receipt" },
      { status: 500 }
    );
  }
}
