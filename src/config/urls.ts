export const APP_BASE_URL = "https://alcorabooks.com";
export const APP_BASE_API_URL = APP_BASE_URL + "/api";
export const APP_MPESA_API_TOKEN_URL = `${APP_BASE_API_URL}/mpesa-token`;
export const APP_COMMERCE_URL = "https://commerce.alcorabooks.com";

export const MEILISEARCH_URL = "https://search.alcorabooks.com";
export const CHAT_APP_URL = "https://chat.alcorabooks.com";
export const POSTHOG_URL = "https://us.i.posthog.com";

export const COMMERCE_TOKEN_ENDPOINT = `${APP_BASE_API_URL}/saleor/token`;

// Loyalty & Accounting
export const LOYALTY = `${APP_BASE_API_URL}/loyalty/points`;
export const ACCOUNTING_URLs = {
  budgets: `${APP_BASE_API_URL}/accounting/budgets`,
  budgetsScenarios: `${APP_BASE_API_URL}/accounting/budgets/scenarios`,
  budgetCompare: `${APP_BASE_API_URL}/accounting/budgets/scenarios/compare`,
};
