export interface LoyaltyCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  loyaltyPoints: {
    pointsEarned: number;
    pointsRedeemed: number;
    balance: number;
    history: PointsTransaction[];
  };
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  lastVisit?: string | null;
  totalSpent?: number | null;
  joinDate?: string | null;
}

export interface PointsTransaction {
  id: string;
  amount: number;
  type: "EARNED" | "REDEEMED" | "BONUS";
  description?: string;
  sourceOrderId?: string;
  redeemedFrom?: string;
  createdAt: Date;
}

export type NewCustomerPayload = {
  name: string;
  phone: string;
  organizationId: string;
};
