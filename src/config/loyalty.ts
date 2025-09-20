export const LOYALTY_TIERS = {
  Bronze: {
    discount: 2,
    minPoints: 0,
    maxPoints: 499,
  },
  Silver: {
    discount: 5,
    minPoints: 500,
    maxPoints: 999,
  },
  Gold: {
    discount: 8,
    minPoints: 1000,
    maxPoints: 1999,
  },
  Platinum: {
    discount: 12,
    minPoints: 2000,
    maxPoints: Number.POSITIVE_INFINITY,
  },
};
