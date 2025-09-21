import type { LoyaltyCustomer } from "@/types/loyalty";
import { LOYALTY_TIERS } from "@/config/loyalty";
import prisma from "@/lib/prisma";

const MEILISEARCH_HOST =
  process.env.NEXT_PUBLIC_MEILISEARCH_URL || "https://search.getverity.com";
const MEILISEARCH_API_KEY =
  process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY ||
  "dd5e0bfa86569cdab356d3edb21328f233fd00ccda6d8fc555af6714d1e0345c";
const INDEX_NAME = "verity_customers";

/**
 * Ensures a customer is indexed in Meilisearch
 * If customer is not found in Meilisearch, it fetches from DB and adds to index
 *
 * @param searchQuery - Phone number or name to search for
 * @returns The customer if found or added, null otherwise
 */
export async function ensureCustomerIndexed(
  searchQuery: string
): Promise<LoyaltyCustomer | null> {
  try {
    // 1. First try to find in Meilisearch
    const meiliCustomer = await findCustomerInMeilisearch(searchQuery);
    if (meiliCustomer) {
      console.log("✅ Customer found in Meilisearch:", meiliCustomer.name);
      return meiliCustomer;
    }

    // 2. If not found, try to find in database
    console.log("🔍 Customer not found in Meilisearch, checking database...");
    const dbCustomer = await findCustomerInDatabase(searchQuery);
    if (!dbCustomer) {
      console.log("❌ Customer not found in database");
      return null;
    }

    // 3. If found in database, add to Meilisearch
    console.log(
      "✅ Customer found in database, adding to Meilisearch:",
      dbCustomer.name
    );
    await addCustomerToMeilisearch(dbCustomer);
    return dbCustomer;
  } catch (error) {
    console.error("Error ensuring customer is indexed:", error);
    return null;
  }
}

/**
 * Find a customer in Meilisearch by phone or name
 */
async function findCustomerInMeilisearch(
  searchQuery: string
): Promise<LoyaltyCustomer | null> {
  try {
    const url = `${MEILISEARCH_HOST}/indexes/${INDEX_NAME}/search`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
      },
      body: JSON.stringify({
        q: searchQuery,
        limit: 1,
        attributesToRetrieve: [
          "id",
          "name",
          "phone",
          "email",
          "loyaltyPoints",
          "loyaltyTier",
          "lastVisit",
          "totalSpent",
          "joinDate",
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Meilisearch request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (data.hits && data.hits.length > 0) {
      const hit = data.hits[0];
      return {
        id: hit.id,
        name: hit.name,
        phone: hit.phone,
        email: hit.email || null,
        loyaltyPoints: hit.loyaltyPoints || {
          pointsEarned: 0,
          pointsRedeemed: 0,
          balance: 0,
          history: [],
        },
        loyaltyTier: hit.loyaltyTier || "Bronze",
        lastVisit: hit.lastVisit || null,
        totalSpent: hit.totalSpent || 0,
        joinDate: hit.joinDate || null,
      };
    }

    return null;
  } catch (error) {
    console.error("Error finding customer in Meilisearch:", error);
    return null;
  }
}

/**
 * Find a customer in the database by phone or name
 */
async function findCustomerInDatabase(
  searchQuery: string
): Promise<LoyaltyCustomer | null> {
  try {
    // Check if searchQuery is a phone number
    const isPhone = /^\+?\d+$/.test(searchQuery.replace(/\s/g, ""));

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          isPhone
            ? { phone: { contains: searchQuery.replace(/\s/g, "") } }
            : {},
          { name: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      include: {
        loyaltyPoints: {
          include: {
            pointsHistory: {
              orderBy: {
                createdAt: "desc",
              },
              take: 10,
            },
          },
        },
      },
    });

    if (!customer) return null;

    // Transform to LoyaltyCustomer format
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      loyaltyPoints: {
        pointsEarned: customer.loyaltyPoints?.pointsEarned || 0,
        pointsRedeemed: customer.loyaltyPoints?.pointsRedeemed || 0,
        balance: customer.loyaltyPoints?.currentBalance || 0,
        history:
          customer.loyaltyPoints?.pointsHistory.map((transaction: any) => ({
            id: transaction.id,
            amount: transaction.amount,
            type: transaction.type as any,
            description: transaction.description || undefined,
            redeemedFrom: transaction.redeemedFrom || undefined,
            createdAt: transaction.createdAt,
          })) || [],
      },
      loyaltyTier: calculateLoyaltyTier(
        customer.loyaltyPoints?.currentBalance || 0
      ),
      lastVisit: customer.lastVisitDate?.toISOString() || null,
      totalSpent: customer.totalSpent || 0,
      joinDate: customer.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Error finding customer in database:", error);
    return null;
  }
}

/**
 * Add a customer to Meilisearch index
 */
async function addCustomerToMeilisearch(
  customer: LoyaltyCustomer
): Promise<boolean> {
  try {
    const url = `${MEILISEARCH_HOST}/indexes/${INDEX_NAME}/documents`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
      },
      body: JSON.stringify([customer]),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to add customer to Meilisearch: ${await response.text()}`
      );
    }

    const result = await response.json();
    console.log(`✅ Customer added to Meilisearch, task ID: ${result.taskUid}`);
    return true;
  } catch (error) {
    console.error("Error adding customer to Meilisearch:", error);
    return false;
  }
}

/**
 * Calc loyalty tier based on points
 */
function calculateLoyaltyTier(
  points: number
): "Bronze" | "Silver" | "Gold" | "Platinum" {
  const tiers = Object.entries(LOYALTY_TIERS);
  for (const [tier, { minPoints }] of tiers) {
    if (points >= minPoints) {
      return tier as "Bronze" | "Silver" | "Gold" | "Platinum";
    }
  }
  return "Bronze";
}
