export type ExpenseCategory =
  | "transport"
  | "utilities"
  | "rent"
  | "equipment_maintenance"
  | "office_supplies"
  | "marketing"
  | "employee_wages"
  | "stock_purchase"
  | "other";

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "mobile_money"
  | "credit_card"
  | "cheque";

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: ExpenseCategory;
  description: string;
  paymentMethod: PaymentMethod;
  reference: string;
  attachmentUrl: string | null;
}
