Sales is modularized as **Sales & Revenue Reporting** under **Books** module.

TO DESIGN THE MOST MODULAR PLATFORM AND EXTRACT THE BEST VALUE IN SALEOR. I NEED TO UNDERSTAND THE ORDERS AND SEE WHAT COULD BE EXTRACTED. SO I DROPPED THIS:

```graphql
query GetOrdersByChannel(
  $channel: String!
  $first: Int
  $filter: OrderFilterInput
) {
  orders(channel: $channel, first: $first, filter: $filter) {
    edges {
      node {
        id
        number
        status
        created
        userEmail
        user {
          id
          email
          firstName
          lastName
        }

        total {
          gross {
            amount
            currency
          }
        }
        discounts {
          name
          reason
          value
          valueType
          amount {
            amount
            currency
            currency
          }
        }
        lines {
          productName
          productSku
          productVariantId
          digitalContentUrl {
            url
            id
          }
          unitDiscount {
            amount
            currency
          }
          taxRate
          totalPrice {
            tax {
              amount
            }
          }
          id
          quantity
          unitPrice {
            gross {
              amount
              currency
            }
          }
          variant {
            pricing {
              onSale
            }
          }
        }

        events {
          type
          id
          invoiceNumber
          paymentId
        }
      }
    }
  }
}
```

WITH VARIABLES:

```json
{
  "channel": "century-consults",
  "first": 2,
  "filter": {
    "status": ["CANCELED"]
  }
}
```

DOING EVERYTHING VIA SALEOR IS CREATING ISSUES. LUCKILY WE HAVE A CHANCE TO USE SSR AND QUERY FROM THEIR. WHY?

1. SECURITY: Exposing sensitive logic (e.g., cost price) or allow query shaping on client

2. Performance: Cache query results by channel, date range, etc. only update via webhooks

3. Smarter Defaults: Normalize data (e.g., convert null variants, handle missing prices)

4. Enables Aggregation: Calculate total revenue, margins, trends server-side

5. Leaner Client Code

6. 🔐 App Token Safety: Only the backend holds the real Saleor token

---

THE BOOKS MODULE:

1. Sales Reporting : Revenue Average order value, best sellers, returns, discounts

- Popular: Sales Volume, Customer Interaction[Views, Carts, Purchases]

2. Inventory & Cost of Goods : Profit margins, cost vs selling price, dead stock

3. Receivables & Payments : Payment gateway data, chargebacks, unpaid orders

4. Invoices & Tax Reports : VAT, KRA compliance, monthly filings

5. Profit & Loss : Combine all above for true P&L visibility

<!--
/books/reports/sales
/dashboard/books/sales-insights

[BOOKS VS BI/INSIGHTS]:
If split product analytics and buyer trends (vs hard books), you could have:
- /analytics: Product trends, category heatmaps, customer behavior
- /books: Revenue, costs, invoices, P&L
-->

For large datasets, compute margins on backend via webhooks that write to order metadata:

```python
# Sample Saleor Webhook
@webhook(...)
def calculate_order_margin(order: Order):
    margin = sum(
        (line.unit_price.gross.amount - line.variant.cost_price.amount) * line.quantity
        for line in order.lines.all()
    )
    order.store_value_in_metadata("margin", margin)
    order.save()
```

1. GIS x POS Analytics:

   - "Thirst Map": Heatmap of "stockouts per sub-location" (e.g., "Kamakis runs out of Tusker Lite by 8pm Fridays")
   - Overlay with MATATU ROUTES (peak sales near termini when buses arrive), IMPACT E.G NEAR CHURCH etc
   - Cultural Pairing Index": "When retailers sell X Scotch, they sell Y meat cuts 78% of the time" (via integration with butcher POS data)
   - "Ghost Shelf Detection": Flag areas where competitor products dominate shelves despite high demand for EABL/KWAL brands (e.g., "Kawangware prefers Kenya King yet 60% of bars stock Uganda Waragi")

**How to Package for Distributors:**

- "Route Optimization as a Service": Auto-generate delivery routes prioritizing: (Retailer Payment Reliability Score) + (Urgency: Days Since Last Restock) + (Seasonality Factor)

- "Shadow Demand Calculator": Estimate unmet demand using: (Historical Sales at Retailer) - (Current Inventory Reported) × (Local Event Density)

- Anti-Commoditization Architecture: elationship-Preserving Features: "Price Invisible Mode": Never show distributor pricing publicly. Instead, use a "Loyalty Tier Unlock" system: "Order 5x/month from KWAL to see reserved offers"

- "Bidirectionally Blind Deals": Let distributors post anonymous bulk discounts: "20% off 100+ cases of Gilbey’s – 3 retailers needed to unlock"

- "Territory Lock": Let distributors geo-fence "their" retailers. If another supplier tries to poach: "Johnny’s Wines has been served by KWAL since 2022. Contact KWAL rep for access."

**Sticky Value for Retailers (KES 400/Mo Justification)**

Non-Obvious Tools:

- "M-Pesa Flow Guardian": Predict cashflow crunches using: (Upcoming License Renewal Dates) + (School Fee Seasons) + (Historic Sales Dips) → Auto-suggest: "Take 10-case loan of Kibao Vodka now, repay post-Christmas"

- "Shelf Whisperer": AR tool where retailers photograph shelves → AI detects: "Your Senator is hidden behind Nile Special – last month this cost you KES 12k loss"

- "Mama Mboga Mode": One-tap "Stock Emergency" button: "Need 5 cases of Tusker by 5pm?" → pings ALL nearby distributors’ riders

**Distributor "Cheat Codes" to Win Their Love**

- Metrics That Matter to EABL/KWAL:
  "Vanishing Point Index": Track how fast their sales reps resolve: (Retailer Complaints) ÷ (Avg. Resolution Time) × (Repeat Order Rate)
  → Identify lazy reps killing margins

- "Soko Squad Builder": Auto-group retailers into "cohorts" for bulk discounts: "6 bars near Kasarani Stadium order 100 cases/month – offer group rate"

- "Duka DNA Profiling": Classify retailers by hidden patterns: "Type C Retailer: Opens at 10am, sells 70% beer to construction workers, pays via M-Pesa 90%"

<!-- THE SIMPLE TIMESTAMP CAN BE A GOLD MINE WHEN TIED TO POS RIGHT ?? -->

- LOGISTICS TOOLS: "War Room Mode": Charge distributors for real-time crisis maps: "Protest on Thika Road → Redirect 3 vans to bypass area"

- Kills Two Birds: Retailers get survival tools, distributors get intel to outmaneuver competitors (not their retailers)

- Untapped Data Layer: Pair POS data with cultural patterns (e.g., "Nyama Choma Fridays drive 40% of Heineken sales")

First Moves:
Build "Thirst Map Lite" for pilot in Ruiru/Kamakis

Partner with 1 mid-tier distributor to test "Vanishing Point Index" (position as "Rep Performance X-ray")

Offer M-Pesa Flow Guardian as loss leader to lock retailers

> > We will sell distribution jihad against ineffiency
