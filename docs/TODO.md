AS SIMPLE AS TICKING THE FOLLOWING ON A WEEKLY BASIS:

1️⃣ AUTHENTICATION 
2️⃣ SUBSCRIPTIONS + PAYMENTS (MPESA & Paystack) ⏳
3️⃣ POSTGRES (Neon) + API-First Data Layer
4️⃣ INVENTORY SUITE + POS (AI TOOL. CSV PRODUCT IMPORTS, MULTI-WAREHOUSES & TRANSFERS)
5️⃣ ORDERING + BOOKS
6️⃣ PROMOTIONS
7️⃣ AUTOMATED COMPLIANCE

TECH DEBT:
- SENTRY SETUP
- POSTHOG SETUP
- OTEL SETUP

<!--
REST OF THE TIME SPENT IMPROVING WEBHOOKS. COZ BRUTAL TRUTH IS, THEY WILL FAIL IN PRODUCTION NO MATTER WHAT, AND MESSAGES WILL ARRIVE OUT OF ORDER AT TIMES/NET ISSUES.


What I would implement:

1. Extract error handling to utilities:
const safelyUpdateInventory = withErrorHandling(
  updateInventoryQuantity,
  'INVENTORY_UPDATE_FAILED'
);

2. Use result types instead of try/catch everywhere:
const result = await updateStock(params);
if (result.success) {
  // happy path
} else {
  logger.warn(result.error);
}

Centralize webhook processing with middleware:
const processWebhook = pipeline([
  validatePayload,
  updateMeiliSearch,
  decrementInventory,
  recordTransaction,
  createAuditLog
]);

MONITORING BULLMQ
-->
