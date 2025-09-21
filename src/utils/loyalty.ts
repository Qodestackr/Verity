import { LOYALTY_TIERS } from "@/config/loyalty";
import { LoyaltyCustomer } from "@/types/loyalty";

interface DiscountCalculationParams {
  customer: LoyaltyCustomer;
  orderTotal: number;
  pointsPerKES?: number; // Default: 200/= per 1 point
}

export function calculateDiscountPoints(
  params: DiscountCalculationParams
): number {

  const { customer, orderTotal, pointsPerKES = 200 } = params;

  if (orderTotal <= 0) return 0;

  const tierDiscount = LOYALTY_TIERS[customer.loyaltyTier].discount;
  const discountAmount = orderTotal * (tierDiscount / 100);

  // Calc points needed, rounding up to nearest whole number
  const pointsRequired = Math.ceil(discountAmount * pointsPerKES);

  // Ensure we don't exceed available points
  return Math.min(pointsRequired, customer.loyaltyPoints.balance);
}
