export type POSMode =
  | "retail"
  | "wholesale"
  | "onAccount"
  | "tables"
  | "takeawayOnly";

// SHITS, TILL [Open, Close Shift]

export interface BaridiConfig {
  enabled: boolean;
  tone: "formal" | "banter" | "salesCoach";
  autoInsights: boolean;
}

export interface OrgSettings {
  posMode: POSMode;
  allowDraftSales: boolean;
  enableReturns: boolean;
  pricingModel: "retailPrice" | "wholesaleTiered" | "customPerCustomer";
  baridiConfig: BaridiConfig;
  features: {
    enableStockReorderSuggestions: boolean;
    enableInvoicePDF: boolean;
    enableLoyaltyProgram: boolean;
  };
  rounding: {
    step: number;
    direction: "up"
  }
}

export interface UserSettings {
  defaultPOSMode?: POSMode;
  showSalesDashboard: boolean;
  darkMode: boolean;
  language: "en" | "sw" | "fr";
  receiveDailySummaries: boolean;
  overrides?: Partial<OrgSettings>; // e.g. override pricingModel
}
