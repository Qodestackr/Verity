export interface DraftOrderItem {
  variantId: string;
  quantity: number;
  name?: string;
  price?: number;
}

export interface DraftOrderInput {
  id?: string; // Only for updates
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  note?: string;
  items: DraftOrderItem[];
}

export interface DraftOrderResult {
  id: string;
  created: boolean;
  token: string;
  errors: any[];
}
