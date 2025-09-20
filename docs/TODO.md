AUTHENTICATION:

- USERS IN SYSTEM: [User/B2C User], ADMIN, BRAND_OWNER, DRIVER, WHOLESALER, RETAILER, DISTRIBUTOR, **MANAGE STAFF**.
- That authenticates Hono [Books, Drivers App] (<!--FUTURE ITERATIONS ++Drizzle ORM-->)

NEEDS:
Auth should understand Global Settings like:

- Wholesaler needs to sell to retailers but also needs to be recognized as retail price
- Wholesaler has the best lowkey distribution esp if they already sell to retailers at scale, having them first is very sticky
- Retailers have different needs of what a POS should be. I wish to focus on Liqour-stores first and not the big hotels
- Balancing between "drafts" and other form of retail is quite complex, they might need to configure things themselves

## MAKING A ROBUST AUTHENTICATION:

Yesterday, I was able to ensure we can save a user from the business type they selected.
TODAY:

- Auth should be able to hold channel
- They must complete onboarding process, we create a warehouse, product type, category, and attach warehouse to channel
- We need to create an org before attaching a channel, this is another being bypassed complexity that needs careful planning
- We will then recreate what redis has and ensure auth does hold this
<!-- WAREHOUSE, CHANNELID AND ENSURING NOTHING EVER GETS DROPS -->
- They will need an Admin Approval. So basic stuff must be working, like uploading files to a storage bucket and attaching back to them.
- Sync to a specific Meilisearch instance for them

<!--
LATER:
- Manage Staff, Business Units
- Relationship Management
- Order Processing: I should click a bizId and search within their instances while the right sell prices show based on qtty changes. Tanstack table should be as robust as it comes to adapt to changing quantities
- Auth needs to
-->

## CONFIGURABLE POINT OF SALE

- Customer retention tools [Robust and Seamless Loyalty Program]

- Make drafts work and adapt for tables, they could also not disrupt those who want to sell instantly

## PRICING AND ORDERS

- WHOLESALERS, DISTRIBUTORS NEED DIFFERENT PRICING STRATEGIES. One needs a wholesale price the other needs promotions based on quantities
- Order Placing is one thing, their is recieving the order and order tracking
- Logistics tools, DRIVER and sticky delivery service (<!--WHATSAPP, PUSH NOTIFS LATER, MAPs-->)
- ...

<!--
- Order Tracking "With urql For flows where users might refresh or share links (e.g., order tracking), don’t keep everything in local state—use query params".
- Optimistic Updates + Rollbacks: Make UI instant by assuming success, then gracefully roll back if needed.If a user removes an item from the cart, hide it instantly, send the API request in the background, and undo if the request fails.

[I HAVE SEEN USERS MAKE ISSUES, IN CURRENT STATE, REFRESHING PAGES WILL LOSE THE UI DATA, THIS IS A FUTURE TODO]

- Pre-Fetch & Pre-Compute to Reduce API Roundtrips: In a checkout flow, don’t wait until the user lands on “Review Order” to check stock availability—do it while they’re still adding to cart.

[WE NEED A VERY GOOD STATE SYNC TO SYNC FROM MEILISEARCH, TO SALEOR INSTANCES]

- Use Fewer but Smarter State Stores: Instead of spreading logic across multiple React states, contexts, and API calls, use a central store like Zustand to keep everything in sync. E.g A POS checkout shouldn’t be juggling local state + Saleor API + client cache separately. Instead, a single store should hold products, cart state, and pending mutations together.
-->

> The few left time goes for Otel, Subscriptions, Sentry/Tracing at Scale, Session Replay.

### FROM 10th to 17th

Its all about basic finetuning, esp book keeping.
If one can create an account in a robust manner, if one can get basic settings, if one can get basic tools to interact with customers,
if one can get

- :Webhooks that Scale for Book-keeping:
- :B2C:
- :Debezium, Clickhouse, Kafka:=> READY TO SERVE PRODUCT ANALYTICS
