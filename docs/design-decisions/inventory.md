## STOCK, INVENTORY, AND WAREHOUSE AND CRITICAL DECISIONS MADE ALONG THE WAY

Our Inventory system is not just a store of quantities — it's a living ledger (Event driven). Every bottle matters. We prioritize:

- Speed (via Redis & Drizzle)
- Traceability (via our Audit layer)
- Non-duplication (Saleor owns truth; we own experience)

We let Saleor manage:

- Stock quantity per variant per warehouse
- Order creation, fulfillment
- Channel/warehouse structure

We extend with:

- Local fast-access stock state (Redis)
- Business logic around how stock moved
- Full audit trails for ops, cashiers, and accountants
- Aggregated reports for retailers and distributors

### ⚙️ Functional Areas

**📥 Add / Receive Stock**

<!--
Adding a product in Saleor is incredibly difficult: Names, Categories, Attributes & Variants (percentage, bottle volume, taste, barcode/sku, price per variants) and so forth. Our aim is to let admin add products under /admin/product-management to reduce the complexity involved.
This lets us scope and abstract this complexity and only load products from redis to recreate their catalog.
-->

**_Reality_**: Product creation in Saleor is complex, error-prone, and misaligned with liquor workflows.

**_Decision_**: We preload 99% of SKU catalog. Onboarding skips product creation. Retailers only tweak:

- Prices
- Opening stock
- This ensures speed, simplicity, and alignment to the Kenyan B2B liquor market.

**🔍 Audit (Stock Movement History)** (Story Teller)
“What changed? Who did it? Why?”
This is a ledger-like history of every movement.

Tracked Events:

- SALE (e.g at POS)
- RECEIVE (new stock)
- RETURN (accepted unopened bottle or fulfillment cancel)
- TRANSFER (between warehouses)
- ADJUSTMENT (manual fix, e.g. broken bottle)
- LOSS (shrinkage, damage, theft)

<!--TODO: Isolate Saleor to see how it behaves-->

Design Choices:

- Immutable audit table
- Reference variant_id, warehouse, user, and origin (webhook, UI, system)
- Full before/after snapshots
- Powered by webhooks + internal events

> Saleor doesn’t expose the reason — we must infer or record it ourselves. All stock ins & outs, Who made the change (user, webhook, system).Before/after values and Linked entity: sale, supplier, adjustment reason.

**📊 Report (Live Inventory Status)**
“What’s the stock right now? What should I restock?”
Not redundant to Audit. It’s a state view, not a history.

Features:

- Current quantity per variant & warehouse
- Filters by category, outlet, brand, etc.
- Stock value in KES (uses last purchase price or average cost)
- Low stock & overstock alerts
- Dead stock detection (no movement for 30+ days)
- Live stock levels per SKU, outlet, or product type

Design Choices:

- Powered by Redis or derived from Saleor snapshot + our audit layer
- Rebuildable if data is lost (Replay audit ledger)
- Can power dashboards, Excel exports, BI tools

## 🔄 Events & Webhooks

Saleor Events Used:

- `ORDER_CREATED`/ `FULFILLED` → → `SALE`
- `FULFILLMENT_CANCELED` → → `RETURN`
- `STOCK_UPDATED` → ambiguous, handled carefully
- `VARIANT_UPDATED` → update Redis cache
- Internal `POST` / `PATCH` on our `/receive`, `/adjust`, `/transfer` endpoints create others

> 🧩 Thin product references (SKU, variant_id) — all other data is inferred from Redis or Meilisearch. Immutable audit trail — no deletes, only append. Soft real-time — events are processed async, no need for blocking logic. Local-first reads, Saleor-validated writes

## 🛠️ WIP

- `/returns` interface for accepted product returns
- `/transfer(s)` between warehouses with full traceability
- Extend `/report` with average cost, aging [crucial].
- Trigger low-stock alerts based on POS velocity + thresholds

<!--
TODO AI: https://v0.dev/chat/stock-audit-design-OFutBcd2iUN
-->
