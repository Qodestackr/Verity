1. CENTURY CONSULTS CHANNEL INSTANCE \*\*\*\*
2. ORG ISSUES, WEBHOOKS, SALES/SALES SUMMARY \*\*\*\*
<!--WE STILL NEED TO LINK CRITICAL STUFF TO AN ORG... HOW ABOUT A SHOP THAT SELLS TO END USER? WE DONT NEED TO BLOAT THE CODES-->
3. MAKE THE CORE AND CRITICAL STUFF AS DYNAMIC AS THEY COME
4. SMART INVENTORY ESP REPORTS AND AUDITING NEEDS TO BE AS ROBUST AS IT COMES \*\*\*\*
5.

TRANS-NIGHT: [SALES, ROBUST RE-DEPLOYMENT]\*\*\*\*

THINGS TO DO ASAP TO NOT FAIL THE TEAM:

<!-- 1. ENSURE PAULA DOES NOT LOOSE ENTIRE CATALOG + PRICES, QUANTITY
2. SEAMLESSLY EXPOSE EVERY FEATURE TO THE END USER IN A NICE AND USABLE MANNER
3. COMPLETE THE CORE AUTH[NEXTJS, SALEOR, AND ISOLATION]
4. SALES & POS -->

1. Accounting Module

- Budgets, Scenarios
- Reconciliaion
- Customers
- Invoices
- Expenses

2. Point of Sale

- Drafts & Normal Model & Tables [On Account].

3. Authentication Module
<!-- https://claude.ai/chat/b9fd218f-27fc-4f05-86ba-2a7c31f22276 -->

- Relationship Management
- SUBSCRIPTIONS & PAYMENTS & PRICING PLANS

4. Inventory Module

5. Orders

- Place Orders online
- Recieve Orders (PURCHASE, RECIEVE DELIVERY<Auto>)

> This shows why inventory audit must be done ahead e.g at POS actually as grounded as from initial setup! Webhooks must be working from the ground. How do I hold the metadata of inventory change at large level and granular(e.g seeding vs one product move)

## TECHNICAL DEBT

- Files to watch out for before they baloon:
  **lib**
  **types**
  **schemas**
  **services**
  **components**
  **hooks**
  **stores**

8. DRIVER & LOGISITCS [ABIT AHEAD OF B2C DUE TO PAYMENT ISSUES ... LOGISTICS BUILT FOR B2B vs B2C]

(EMAILS & PUSH NOTIFICATIONS OFTEN GET FORGOTTEN)

THINGS I WONT TOUCH: (CONVERSATIONAL COMMERCE WITH BARIDI AI + WHATSAPP)
MICRO MARKETING TOOLS: (MAKE THE DESCRIPTION STICKY BUT WHY IT MISSES THE MARKS ANYWAY)

> Go scale the product and let me know. Simple!

<!--
TECH DEBT: SENTRY, OPEN REPLAY, ROBUST CDC & TOOLING, POSTHOG(Baked into product esp dynamic pricing 2wks free tria, extend free trial, 2 months, 90 days vs 3 months naming Churn as much!)
TAKE TIME TO LEARN: DRIZZLE ORM, SQL, KYSLEY, CDC + POSTGRES, NATs or Kafka, WHATSAPP APIs. ***CLICK-HOUSE***
NEXT LEARNING ITERATION: MORE OF REACT, NEXTJS(Performance-wise), HONO, FASTAPI
NEXT LEARNING ITERATION: DATA ENGINEERING, STREAMING ARCHITECTURES, ELECTRIC-SQL, OFFLINE-FIRST, ZERO/REPLICACHE
-->

<!--
DESCRIBING WHAT NEEDS TO BE DONE IN MY SYSTEM WILL ENABLE ME TO ACTUALLY DO IT. WHAT HAPPENS WHEN I COMPLETE THE HARDPARTS IN SALEOR
WHILE HAVING CRITICAL PROGRESS IN THE OTHER AREAS? GRIND AND COMPLETE THE PROJECT RIGHT? WHAT WILL MIKE SAY WHEN WE FINALLY ARRIVE WITH
A COMPLETE PRODUCT?

[LOGISTICS DONE, AND EVERYTHING IN BETWEEN... ONLY WHATSAPP AND MICRO MARKETING TOOLS AND SALES ASSISTANT TOOLS THIS CAN GO PAST MVP STAGES]
[HMMM... BUT THE PRODUCT LACKS CRITICAL AREAS


We need a robust search....
SEARCHING HOW WE ACCESS CHANNEL SLUGS, IDs or anything of any sort like WarehouseId

TODO: MAP WHAT NEEDS TO BE ACCESSED OFTEN FROM THE CODEBASE:
- WHAT NEEDS TO BE ACCESSED VIA STATE?
- WHAT NEEDS TO BE ACCESSED VIA COOKIES?
-


WHAT IS HARDCODED BUT SHOULD NOT?
- OrganizationId


//src/utils/checkout.ts

>> I BELIEVE
// src/utils/ensure-customer-indexed.ts
Meilisearch indexes e.g const INDEX_NAME = "alcora_customers"; MEANS THAT

// src/utils/search-engine-customers.ts
const url = `${baseUrl}/indexes/customers/search`;

// src/utils/search-engine.ts
const url = `${baseUrl}/indexes/${index}/search`;
-->

## <!--

TECHNICAL DEBT:

- Sentry
- OpenReplay
- PostHog
- OpenTelemetry
- Object Storage/S3 Uploads
- Emails, Push Notifications
- Offline-first is still a huge issue
- The most underrated is database design as tech debt coz it forces massive refactoring! Breaking down Prisma into small chunks
- I need to study how dub.co serves advanced analytics at scale and more and more OSS work is it CDC? Is it Webhooks + Queues to update other data services or what?

---

DOING THE BORING WORK AS TECHNICAL DEBT PAYMENT:

1. EXTRACT TYPES AND UTILS IN SUCH A NICE MANNER, EVEN IF IT MEANS USING AI ONE MORE TIME
2. FIND DUPLICATED EFFORT ESPECIALLY LOGICAL PIECES, LONG COMPONENTS AND MIS-ALIGNED CODEBASE THAT SIMPLY WONT SCALE
3. GRIND THROUGH THE AUTHENTICATION HARDWORK, SHARING OF AUTH STUFF, EXTENDING/Infer sessions as needed
4. Leave complex unused codebase to add complexity in there, scare them anyway

---

> WHOLESALER & RETAILER DONE
> [MANAGE USERS & STAFF AND WHATNOTS] > [DISTRIBUTOR ?? BRAND_OWNER <<>> ADMIN] >>> WE NEED TO GROUP USERS IN THAT MANNER
> -->

### FRIDAY TO SATOO GRIND

- Webhooks functionalities & E-mail & Invite Team Member (Everything Org context)
  We will need to refactor the pieces that API Routes interact with as well withAuth etc etc..
- Interactive Previews : [HOME PAGE, FOR_BRANDS]
  The For_Brands should be a single fire screenshot or something
  The other one is quite complex as it swaps btw retailers, and wholesalers mostly

- One should be able to handle expenses, make a sale at POS, and see the impact in books. On the other hand They should be able to place orders at every levels

-> Head Over and Blame Payment as the major delay to B2C module mostly.
