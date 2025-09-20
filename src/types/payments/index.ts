// Promotions
export type PricingTier = {
  min: number;
  max: number | null;
  value: number;
};

export type TransactionType =
  | "SALE"
  | "PURCHASE"
  | "EXPENSE"
  | "INCOME"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "OTHER";

export type PaymentMethod =
  | "CASH"
  | "MPESA"
  | "CARD"
  | "BANK"
  | "CREDIT"
  | "OTHER";
