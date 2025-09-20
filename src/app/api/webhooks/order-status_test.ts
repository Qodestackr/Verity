import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { OrderStatus } from "@prisma/client";

// This webhook handles order status updates from Saleor
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature if configured
    const signature = req.headers.get("saleor-signature");
    const webhookSecret = process.env.SALEOR_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const payload = await req.text();
      const hmac = crypto
        .createHmac("sha256", webhookSecret)
        .update(payload)
        .digest("hex");

      if (hmac !== signature) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }

      // Parse the payload again since we consumed it for verification
      const body = JSON.parse(payload);
    } else {
      // If no signature verification, just parse the body
      const body = await req.json();
    }

    const body = await req.json();
    const { event, order } = body;

    if (!order || !order.id) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    // Find our internal order that matches the Saleor order ID
    const internalOrder = await prisma.order.findFirst({
      where: {
        saleorOrderId: order.id,
      },
      include: {
        deliveries: true,
      },
    });

    if (!internalOrder) {
      return NextResponse.json(
        { error: "Order not found in our system" },
        { status: 404 }
      );
    }

    // Handle different event types
    switch (event) {
      case "order_fulfilled":
        // Update our order status
        await prisma.order.update({
          where: { id: internalOrder.id },
          data: {
            status: "COMPLETED",
            fulfillmentStatus: "fulfilled",
            fulfillmentDate: new Date(),
          },
        });

        // If there's a delivery associated with this order, update it too
        if (internalOrder.deliveries.length > 0) {
          await prisma.delivery.update({
            where: { id: internalOrder.deliveries[0].id },
            data: {
              status: "DELIVERED",
              completedAt: new Date(),
            },
          });
        }
        break;

      case "order_cancelled":
        // Update our order status
        await prisma.order.update({
          where: { id: internalOrder.id },
          data: {
            status: "CANCELLED",
          },
        });

        // If there's a delivery associated with this order, update it too
        if (internalOrder.deliveries.length > 0) {
          await prisma.delivery.update({
            where: { id: internalOrder.deliveries[0].id },
            data: {
              status: "FAILED",
              failureReason: "Order cancelled in Saleor",
            },
          });
        }
        break;

      case "order_fully_paid":
        // Update our order payment status
        await prisma.order.update({
          where: { id: internalOrder.id },
          data: {
            paymentStatus: "PAID",
          },
        });
        break;

      case "order_created":
      case "order_updated":
        // Sync order status
        await prisma.order.update({
          where: { id: internalOrder.id },
          data: {
            status: mapSaleorStatus(order.status) as OrderStatus,
            fulfillmentStatus:
              order.fulfillmentStatus || internalOrder.fulfillmentStatus,
          },
        });
        break;

      default:
        // Unhandled event type
        return NextResponse.json(
          { message: `Unhandled event type: ${event}` },
          { status: 200 }
        );
    }

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Saleor webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// Helper function to map Saleor order status to our internal status
// WE WANT TO ENHANCE HOW DRIVERS MAKE ACTIONS WITHOUT COMPLETING THEM REALLY...
function mapSaleorStatus(saleorStatus: string): string {
  switch (saleorStatus.toUpperCase()) {
    case "UNFULFILLED":
      return OrderStatus.PENDING;
    case "PARTIALLY_FULFILLED":
      return OrderStatus.COMPLETED;
    case "FULFILLED":
      return OrderStatus.COMPLETED;
    case "CANCELED":
      return OrderStatus.CANCELLED;
    default:
      return OrderStatus.PENDING;
  }
}
