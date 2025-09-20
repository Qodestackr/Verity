# Alcorabooks Evolution: Product & Execution

## Overview

Alcorabooks is a multi-tenant SaaS platform revolutionizing liquor distribution. The product starts as a B2B solution serving distributors and retailers, with a long-term vision to evolve into B2C.

### **Core Tech Stack:**

- **Saleor (Django)** – Commerce engine
- **FastAPI** – Analytics, accounting, and payments
- **Next.js** – UI and Webhooks
- **Custom DB Layer** – Manages relationships and business logic

---

## **Current Flow**

### **1. Core Data Model**

Channel → Warehouse → Product → Product Variant → Assign Stock to Variant

- A **channel** represents a retailer, wholesaler, distributor, or brand owner.
- Products exist within warehouses, with stock assigned to variants.

### **2. User Onboarding & Role-Based Access**

- When a user signs up, they select a role (**retailer, wholesaler, distributor, brand owner**).
- The system creates the user and assigns them a **channel**.
- The channel is attached to the custom DB layer and used in API requests.
- **URQL Configuration:** The client loads `X-Channel-ID` dynamically from the URL params.

### **3. Dynamic Routing & Dashboard Access**

- The dashboard URLs follow a structured format: `/dashboard/[channel]/...`
- Example: POS users with a **sales role** access `pos-*channel` routes.

---

### Product Lifecycle

Alcorabooks follows a structured lifecycle to ensure efficient liquor distribution management, from product setup to inventory tracking and sales. The process is optimized for seamless onboarding and operational scalability.

1. Define Product Attributes (defines product xtics & enable structured filtering)

- Alcohol Content (e.g., 40% ABV)
- Bottle Volume (e.g., 750ml, 1L)
- Country of Origin (e.g., Kenya, Scotland)

2. Create Product Type ("Liquor") - Enables variants for different SKUs (e.g., multiple bottle sizes).

- Establishes a dedicated product category for alcoholic beverages.
- Links predefined attributes to ensure standardized product data.

3. Create Liquor Product (e.g., Nairobi Dry Gin) - Variants auto-generate based on attribute values (e.g., 750ml, 1L).

- Product is created under the Liquor product type.
- Attributes are assigned (e.g., 40% ABV, 750ml, Kenya).

4. Assign Product to Channel

- Makes the product visible and purchasable in a specific channel. E.g POS channe to ensure retailers and sales personell see the right
  inventory

5. Assign Stock to Product Variants

- Stock is allocated per variant (e.g., 200 units of 750ml, 150 units of 1L).
- Warehouses manage inventory distribution based on demand.

6. Verify Stock & Availability

- Query stock levels to ensure accuracy before sales.
- Enables real-time visibility into product availability across warehouses.

This keeps the system scalable while ensuring each user interacts only with relevant data. More updates coming as we refine the flow!
