import { useCurrency } from "@/hooks/useCurrency";
import type { OrgSettings, UserSettings } from "@/types/app-settings";

export const defaultOrgSettings: OrgSettings = {
  posMode: "onAccount",
  allowDraftSales: true,
  enableReturns: true,
  pricingModel: "retailPrice",
  baridiConfig: {
    enabled: true,
    tone: "salesCoach",
    autoInsights: true,
  },
  features: {
    enableStockReorderSuggestions: true,
    enableInvoicePDF: false,
    enableLoyaltyProgram: false,
  },
  rounding: {
    step: 10,
    direction: "up",
  },
};

export const defaultUserSettings: UserSettings = {
  defaultPOSMode: "retail",
  showSalesDashboard: true,
  darkMode: false,
  language: "en",
  receiveDailySummaries: true,
  overrides: {},
};

export const defaultSettings = {
  org: defaultOrgSettings,
  user: defaultUserSettings,
};
