export interface OrderAssignment {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  role: string;
  assignedAt: Date;
  actions: Array<{
    type: string;
    timestamp: Date;
    notes?: string;
  }>;
  status: string;
}
