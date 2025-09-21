import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

import prisma from "@/lib/prisma";

import { redis } from "@/lib/redis";
import { AuditSource } from "@prisma/client";
import { triggerMeiliSync } from "./trigger-sync";

type WebhookHandler = (payload: any) => Promise<void>;

const eventHandlers = new Map<string, WebhookHandler>([
  ["product_created", handleProductCreated],
  ["product_updated", handleProductUpdated],
  ["product_variant_created", handleProductVariantCreated],
  ["product_variant_updated", handleProductVariantUpdated],
  ["order_created", handleOrderCreated],
  ["order_fulfilled", handleOrderFulfilled],
  ["order_cancelled", handleOrderCancelled],
  // order_confirmed, order_paid, order_refunded, customer_created, customer_updated, collection_created, checkout_created, invoice_sent
]);

export async function POST(req: NextRequest) {
  console.log("⭐ Webhook received");
  // ⚡ Immediate fire-and-forget
  triggerMeiliSync();

  const rawSigHeader =
    req.headers.get("saleor-signature") ||
    req.headers.get("x-saleor-signature");
  if (!rawSigHeader) {
    console.error("❌ Missing signature header");
    return NextResponse.json(
      { success: false, error: "Missing signature header" },
      { status: 400 }
    );
  }

  // Get raw request body
  let buffer;
  try {
    buffer = Buffer.from(await req.arrayBuffer());
    console.log(`📦 Raw buffer size: ${buffer.length} bytes`);
    if (buffer.length === 0) {
      console.error("❌ Empty request body");
      return NextResponse.json(
        { success: false, error: "Empty request body" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("❌ Failed to read request body", err);
    return NextResponse.json(
      { success: false, error: "Failed to read request body" },
      { status: 400 }
    );
  }

  // Verify signature
  const incomingSig = rawSigHeader.replace(/^sha256=/i, "");
  const secret = process.env.SALEOR_APP_SECRET!
  const hmac = crypto.createHmac("sha256", secret).update(buffer).digest("hex");

  if (incomingSig !== hmac) {
    console.error("❌ Signature mismatch", { incomingSig, hmac });
    // In production, uncomment:
    // return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
  }

  // Get event type
  const saleorEvent = (
    req.headers.get("saleor-event") ||
    req.headers.get("x-saleor-event") ||
    "unknown"
  ).toLowerCase();
  console.log(`📣 Event type: ${saleorEvent}`);

  // Parse payload
  let payload: any;
  try {
    const rawBody = buffer.toString("utf8");
    console.log(`📄 Raw body: ${rawBody}`);
    payload = JSON.parse(rawBody);
    console.log("✅ Body parsed successfully:", payload);
    console.log("Full payload:\n", JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error("❌ JSON parsing failed:", err);
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  // Dispatch to appropriate handler
  try {
    const handler = eventHandlers.get(saleorEvent);
    if (handler) {
      await handler(payload);
    } else {
      // Log unhandled event types
      console.log(`⚠️ Unhandled event type: ${saleorEvent}`);
      await logUnhandledEvent(saleorEvent, payload);
    }
  } catch (error) {
    console.error(`❌ Error processing webhook: ${error}`);
    return NextResponse.json(
      { success: false, error: "Error processing webhook" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

async function logUnhandledEvent(eventType: string, payload: any) {
  // TODO:Log these into a table (UnhandledEventLog) and/or send them to a Discord dev channel.
  try {
    await prisma.stockAuditLog.create({
      data: {
        sku: "system",
        productName: `Unhandled event: ${eventType}`,
        previousStock: 0,
        quantityChange: 0,
        currentStock: 0,
        unitCost: 0,
        totalCost: 0,
        source: "WEBHOOK",
        reference: `UNHANDLED-${Date.now()}`,
        notes: `Unhandled webhook event: ${eventType}. Payload: ${JSON.stringify(
          payload
        )}`,
        userId: "system",
        warehouseId: "default", // default warehouse ID
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error(`Error logging unhandled event: ${error}`);
  }
}

// TODO: Implement handlers (move these to separate files when code grows)
async function handleProductCreated(payload: any) {
  console.log(
    "📦 Product created:",
    payload.product?.name || "unknown product"
  );
  return processProductUpdate(payload);
}

async function handleProductUpdated(payload: any) {
  console.log(
    "📦 Product updated:",
    payload.product?.name || "unknown product"
  );
  return processProductUpdate(payload);
}

async function handleProductVariantCreated(payload: any) {
  console.log("📦 Product variant created");
  return processProductUpdate(payload);
}

async function handleProductVariantUpdated(payload: any) {
  console.log("📦 Product variant updated");
  return processProductUpdate(payload);
}

async function handleOrderCreated(payload: any) {
  console.log("🛒 Order created:", payload.order?.id || "unknown order");
  // Implement order creation logic
}

async function handleOrderFulfilled(payload: any) {
  console.log("🛒 Order fulfilled:", payload.order?.id || "unknown order");
  // Implementation for order fulfillment - decrease stock, create audit logs

  // Example (implement based on payload structure):
  if (payload.order && Array.isArray(payload.order.lines)) {
    for (const line of payload.order.lines) {
      const { variant, quantity } = line;
      if (variant && variant.sku) {
        await createStockDecrementAuditLog(
          variant.sku,
          variant.product?.name || "Unknown product",
          variant.name || "Unknown variant",
          quantity,
          "ORDER_FULFILLED",
          payload.order.id
        );
      }
    }
  }
}

async function handleOrderCancelled(payload: any) {
  console.log("🛒 Order cancelled:", payload.order?.id || "unknown order");
  // Implementation for order cancellation - restore stock, create audit logs
}

// Reuse your existing processProductUpdate function
async function processProductUpdate(payload: any) {
  if (!payload.product) {
    console.error("Missing product data in payload");
    return;
  }

  const product = payload.product;
  console.log(`Processing product update for: ${product.name}`);

  // Process each variant
  for (const variant of product.variants) {
    // Process each stock entry for the variant
    for (const stock of variant.stocks) {
      const warehouseId = stock.warehouse.id;
      const currentQuantity = stock.quantity;

      try {
        // Get the last audit log for this SKU and warehouse
        const lastAuditLog = await prisma.stockAuditLog.findFirst({
          where: {
            sku: variant.sku,
            warehouseId: warehouseId,
          },
          orderBy: {
            timestamp: "desc",
          },
        });

        // If this is the first time we're seeing this product
        if (!lastAuditLog) {
          console.log(
            `First time seeing product ${product.name} (${variant.sku}), creating initial audit log`
          );

          // Create an initial audit log
          await prisma.stockAuditLog.create({
            data: {
              sku: variant.sku,
              productName: product.name,
              variantName: variant.name,
              previousStock: 0,
              quantityChange: currentQuantity,
              currentStock: currentQuantity,
              unitCost: 0, // We don't have cost info from webhook
              totalCost: 0,
              source: "WEBHOOK",
              reference: `INIT-${variant.sku}`,
              notes: "Initial stock record from Saleor webhook",
              userId: "system", // Use a system user ID
              warehouseId: warehouseId,
              saleorVariantId: variant.id,
              saleorProductId: product.id,
            },
          });

          // Update Redis cache
          await updateRedisCache(
            variant.sku,
            product.name,
            variant.name,
            product.category?.name
          );

          continue;
        }

        // If quantity hasn't changed, no need to create a new audit log
        if (lastAuditLog.currentStock === currentQuantity) {
          console.log(
            `No quantity change for ${product.name} (${variant.sku}), skipping audit log`
          );
          continue;
        }

        // Calc the qty change
        const quantityChange = currentQuantity - lastAuditLog.currentStock;

        // Determine the appropriate audit source based on the change
        let auditSource = "WEBHOOK";
        let notes = "Stock updated via Saleor webhook";

        if (quantityChange > 0) {
          auditSource = "RECEIVE";
          notes = "Stock increased via Saleor webhook";
        } else if (quantityChange < 0) {
          auditSource = "ADJUSTMENT";
          notes = "Stock decreased via Saleor webhook";
        }

        const prevUnitCostNum = lastAuditLog.unitCost.toNumber();

        // new audit log entry
        await prisma.stockAuditLog.create({
          data: {
            sku: variant.sku,
            productName: product.name,
            variantName: variant.name,
            previousStock: lastAuditLog.currentStock,
            quantityChange: quantityChange,
            currentStock: currentQuantity,
            unitCost: lastAuditLog.unitCost || 0, // Use previous cost if available
            totalCost: prevUnitCostNum * Math.abs(quantityChange),
            source: AuditSource.WEBHOOK,
            reference: `WEBHOOK-${Date.now()}`,
            notes: notes,
            userId: "system", // Use a system user ID
            warehouseId: warehouseId,
            saleorVariantId: variant.id,
            saleorProductId: product.id,
          },
        });

        console.log(
          `Created audit log for ${product.name} (${variant.sku}): ${quantityChange} units`
        );

        // Update Redis cache
        await updateRedisCache(
          variant.sku,
          product.name,
          variant.name,
          product.category?.name
        );
      } catch (error) {
        console.error(
          `Error processing stock update for ${variant.sku}:`,
          error
        );
      }
    }
  }
}

async function createStockDecrementAuditLog(
  sku: string,
  productName: string,
  variantName: string,
  quantity: number,
  source: string,
  reference: string
) {
  try {
    // Find the current stock for this SKU
    const lastAuditLog = await prisma.stockAuditLog.findFirst({
      where: { sku },
      orderBy: { timestamp: "desc" },
    });

    if (!lastAuditLog) {
      console.error(
        `Cannot decrement stock for ${sku}: no existing stock record found`
      );
      return;
    }

    const currentStock = lastAuditLog.currentStock;
    const newStock = Math.max(0, currentStock - quantity);

    const prevUnitCostNum = lastAuditLog.unitCost.toNumber();

    // Create audit log entry for this stock movement
    await prisma.stockAuditLog.create({
      data: {
        sku,
        productName,
        variantName,
        previousStock: currentStock,
        quantityChange: -quantity, // negative bcz it's a decrement
        currentStock: newStock,
        unitCost: lastAuditLog.unitCost || 0,
        totalCost: prevUnitCostNum * quantity, // we need to multiply by qty change
        source: AuditSource.WEBHOOK, // POS or whatever.. we need to scale it
        reference,
        notes: `Stock decreased due to ${source.toLowerCase()}`,
        userId: "system",
        warehouseId: lastAuditLog.warehouseId,
      },
    });

    console.log(`Stock audit log created for ${sku}: -${quantity} units`);

    await updateRedisCache(sku, productName, variantName);
  } catch (error) {
    console.error(
      `Error creating stock decrement audit log for ${sku}:`,
      error
    );
  }
}

async function updateRedisCache(
  sku: string,
  productName: string,
  variantName: string | null,
  category: string | null = null
): Promise<void> {
  try {
    // cache key based on SKU
    const cacheKey = `product:${sku}`;

    // Store product data in Redis
    await redis.hset(cacheKey, {
      sku,
      productName,
      variantName: variantName || "",
      category: category || "Uncategorized",
      lastUpdated: new Date().toISOString(),
    });

    await redis.expire(cacheKey, 60 * 60 * 24 * 14); //TTL 14 days

    // Update RedisCacheEntry in db
    await prisma.redisCacheEntry.upsert({
      where: { sku },
      update: {
        productName,
        variantName,
        category,
        lastUpdated: new Date(),
      },
      create: {
        sku,
        productName,
        variantName,
        category,
        ttl: 60 * 60 * 24 * 14, // 14 days in seconds
      },
    });

    console.log(`📥✅ Redis cache updated for ${sku}`);
  } catch (error) {
    console.error(`Error updating Redis cache for ${sku}:`, error);
  }
}
