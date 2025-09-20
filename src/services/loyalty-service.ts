import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { LOYALTY_TIERS } from "@/config/loyalty";
import { LoyaltyCustomer, PointsTransaction } from "@/types/loyalty";

// --- Redis Helpers ---
const CACHE_TTL = 3_600; // 1 hr

const serializeCustomer = (customer: LoyaltyCustomer): string =>
  JSON.stringify(customer);

const deserializeCustomer = (data: string): LoyaltyCustomer =>
  JSON.parse(data) as LoyaltyCustomer;

// --- Core Functions ---
export async function searchCustomers(query: string, limit = 10) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { loyaltyPoints: true },
      take: limit,
    });

    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      loyaltyPoints: customer.loyaltyPoints?.pointsEarned || 0,
      loyaltyTier: calculateLoyaltyTier(
        customer.loyaltyPoints?.pointsEarned || 0
      ),
      lastVisit: customer.lastVisitDate?.toISOString() || null,
      totalSpent: customer.totalSpent || null,
      joinDate: customer.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error(`Error searching customers for "${query}":`, error);
    return [];
  }
}

// Create new customer with loyalty account
export async function createCustomer(
  name: string,
  phone: string,
  organizationId: string,
  email?: string
): Promise<LoyaltyCustomer | null> {
  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone },
    });
    if (existingCustomer) {
      throw new Error(`Customer with phone ${phone} already exists`);
    }

    const welcomeBonus = 5;

    const result = await prisma.$transaction(async (tx) => {
      const newCustomer = await tx.customer.create({
        data: {
          name,
          phone,
          email,
          lastVisitDate: new Date(),
          totalSpent: 0,
          organizationId,
        },
      });

      await tx.loyaltyPoints.create({
        data: { customerId: newCustomer.id, pointsEarned: welcomeBonus },
      });

      await tx.pointsTransaction.create({
        data: {
          // customerId: newCustomer.id,
          loyaltyPoints: { connect: { customerId: newCustomer.id } },
          type: "BONUS",
          description: "Welcome bonus",
          amount: welcomeBonus,
        },
      });

      return newCustomer;
    });

    const loyaltyCustomer: LoyaltyCustomer = {
      id: result.id,
      name: result.name,
      phone: result.phone,
      email: result.email,
      // loyaltyPoints: 100, // Welcome bonus points
      loyaltyPoints: {
        pointsEarned: welcomeBonus,
        pointsRedeemed: 0,
        balance: welcomeBonus,
        history: [
          {
            id: "x",
            amount: 0,
            type: "BONUS",
            createdAt: new Date(),
          },
        ],
      },
      loyaltyTier: calculateLoyaltyTier(100),
      lastVisit: result.lastVisitDate?.toISOString() || null,
      totalSpent: result.totalSpent || null,
      joinDate: result.createdAt.toISOString(),
    };

    await redis.set(
      `customer:${phone}`,
      serializeCustomer(loyaltyCustomer),
      "EX",
      360_0
    );

    return loyaltyCustomer;
  } catch (error) {
    console.error(`Error creating customer ${name} (${phone}):`, error);
    return null;
  }
}

export async function getCustomerByPhone(
  phone: string
): Promise<LoyaltyCustomer | null> {
  const cacheKey = `customer:${phone}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Found customer in cache for phone: ${phone}`);
      return deserializeCustomer(cached);
    }

    let customer = await prisma.customer.findUnique({
      where: { phone },
      include: {
        loyaltyPoints: {
          include: {
            pointsHistory: { orderBy: { createdAt: "desc" }, take: 20 },
          },
        },
      },
    });

    // If not found and phone has + prefix, try without it
    if (!customer && phone.startsWith("+")) {
      const phoneWithoutPlus = phone.substring(1);
      console.log(`Trying without + prefix: ${phoneWithoutPlus}`);
      customer = await prisma.customer.findUnique({
        where: { phone: phoneWithoutPlus },
        include: {
          loyaltyPoints: {
            include: {
              pointsHistory: { orderBy: { createdAt: "desc" }, take: 20 },
            },
          },
        },
      });
    }

    // If not found and phone doesn't have + prefix, try with it
    if (!customer && !phone.startsWith("+")) {
      const phoneWithPlus = "+" + phone;
      console.log(`Trying with + prefix: ${phoneWithPlus}`);
      customer = await prisma.customer.findUnique({
        where: { phone: phoneWithPlus },
        include: {
          loyaltyPoints: {
            include: {
              pointsHistory: { orderBy: { createdAt: "desc" }, take: 20 },
            },
          },
        },
      });
    }

    console.log("Customer found:", customer ? "Yes" : "No");

    if (!customer) return null;

    // Transform Data
    const loyaltyCustomer = transformCustomer(customer);

    // Update Cache
    await redis.set(
      cacheKey,
      serializeCustomer(loyaltyCustomer),
      "EX",
      CACHE_TTL
    );

    // cache with the phone number format that was found in the database
    if (phone !== customer.phone) {
      await redis.set(
        `customer:${customer.phone}`,
        serializeCustomer(loyaltyCustomer),
        "EX",
        CACHE_TTL
      );
    }

    return loyaltyCustomer;
  } catch (error) {
    console.error(`[Loyalty] Error getting customer ${phone}:`, error);
    return null;
  }
}
export async function getCustomerById(
  id: string
): Promise<LoyaltyCustomer | null> {
  const cacheKey = `customer:id:${id}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return deserializeCustomer(cached);

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        loyaltyPoints: {
          include: {
            pointsHistory: { orderBy: { createdAt: "desc" }, take: 20 },
          },
        },
      },
    });

    if (!customer) return null;

    // Transform Data
    const loyaltyCustomer = transformCustomer(customer);

    // Update Cache
    await redis.set(
      cacheKey,
      serializeCustomer(loyaltyCustomer),
      "EX",
      CACHE_TTL
    );

    return loyaltyCustomer;
  } catch (error) {
    console.error(`[Loyalty] Error getting customer with ID ${id}:`, error);
    return null;
  }
}

// --- Transaction Functions ---
export async function addLoyaltyPoints(
  customerId: string,
  points: number,
  type: "EARNED" | "BONUS",
  description: string,
  sourceOrderId?: string
): Promise<boolean> {
  try {
    await prisma.$transaction([
      prisma.loyaltyPoints.update({
        where: { customerId },
        data: { pointsEarned: { increment: points } },
      }),
      prisma.pointsTransaction.create({
        data: {
          loyaltyPoints: { connect: { customerId } },
          amount: points,
          type,
          description,
          sourceOrderId,
        },
      }),
    ]);

    await invalidateCache(customerId);
    return true;
  } catch (error) {
    console.error(`[Loyalty] Error adding points to ${customerId}:`, error);
    return false;
  }
}

export async function redeemLoyaltyPoints(
  customerId: string,
  points: number,
  description: string,
  redeemedFrom: string = "POS"
): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      // Check balance first
      const account = await tx.loyaltyPoints.findUnique({
        where: { customerId },
        select: { pointsEarned: true, pointsRedeemed: true },
      });

      const balance =
        (account?.pointsEarned || 0) - (account?.pointsRedeemed || 0);
      if (balance < points) throw new Error("Insufficient points");

      // Update points
      await tx.loyaltyPoints.update({
        where: { customerId },
        data: { pointsRedeemed: { increment: points } },
      });

      // Create transaction
      await tx.pointsTransaction.create({
        data: {
          loyaltyPoints: { connect: { customerId } },
          amount: -points,
          type: "REDEEMED",
          description,
          redeemedFrom,
        },
      });
    });

    await invalidateCache(customerId);
    return true;
  } catch (error) {
    console.error(
      `[Loyalty] Error redeeming points from ${customerId}:`,
      error
    );
    return false;
  }
}

export async function getCustomerTransactions(
  customerId: string,
  limit = 20
): Promise<PointsTransaction[]> {
  try {
    const transactions = await prisma.pointsTransaction.findMany({
      where: { loyaltyPoints: { customerId } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return transactions.map(transformTransaction);
  } catch (error) {
    console.error(`Error getting transactions for ${customerId}:`, error);
    return [];
  }
}

// --- Helper Functions ---
function transformCustomer(customer: any): LoyaltyCustomer {
  const points = customer.loyaltyPoints;
  const balance = (points?.pointsEarned || 0) - (points?.pointsRedeemed || 0);

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    loyaltyPoints: {
      pointsEarned: points?.pointsEarned || 0,
      pointsRedeemed: points?.pointsRedeemed || 0,
      balance,
      history: points?.pointsHistory.map(transformTransaction) || [],
    },
    loyaltyTier: calculateLoyaltyTier(points?.pointsEarned || 0),
    lastVisit: customer.lastVisitDate?.toISOString() || null,
    totalSpent: customer.totalSpent || null,
    joinDate: customer.createdAt.toISOString(),
  };
}

function transformTransaction(tx: any): PointsTransaction {
  return {
    id: tx.id,
    amount: tx.amount,
    type: tx.type as PointsTransaction["type"],
    description: tx.description || undefined,
    sourceOrderId: tx.sourceOrderId || undefined,
    redeemedFrom: tx.redeemedFrom || undefined,
    createdAt: tx.createdAt,
  };
}

async function invalidateCache(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { phone: true },
  });
  if (customer) await redis.del(`customer:${customer.phone}`);
}

function calculateLoyaltyTier(points: number) {
  if (points >= LOYALTY_TIERS.Platinum.minPoints) return "Platinum";
  if (points >= LOYALTY_TIERS.Gold.minPoints) return "Gold";
  if (points >= LOYALTY_TIERS.Silver.minPoints) return "Silver";
  return "Bronze";
}
