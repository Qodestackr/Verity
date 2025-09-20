Adding warehouse mapping to custom backend since my onboarding flow collects w/h info (w/h name, location, etc)...

<!-- YOU COULD CACHE THEM IN REDIS! MAKING SHIT SNAPPY ASF -->

But I should go further:

- A retailer could have multiple retails, collect biz name and create w/h with same name if wholesaler is selected, we will figure out in future how to track e.g they might have multiple retails but use coordinated central warehouse... esp wholesalers with retail stores. WE CHARGE KES. 400 per retail store + 200 on every other store you own.

- Warehouse mapping ensures feature limits at distributors level on the subscription plan[3 WAREHOUSES ON BASIC. 5 ON STANDARD. 10...]. To enforce these limits without making API calls to Saleor each time, having local records helps.

- Also having quick access to warehouse info without hitting Saleor's API for common operations e.g step 1 of creating a product wants to confirm we have channel-warehouse mapping.

Performance - Quick access to warehouse info without hitting Saleor's API for common operations

```prisma
// Instead of duplicating warehouse data, just store references
model SaleorWarehouseReference {
  id              String   @id @default(cuid())
  organizationId  String
  saleorWarehouseId String // The ID in Saleor
  isPrimary       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```
