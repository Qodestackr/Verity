import { useCurrency } from "@/hooks/useCurrency";
import { MEILISEARCH_URL } from "@/config/urls";
import type { LoyaltyCustomer } from "@/types/loyalty";

interface MeilisearchParams {
  index: string;
  searchQuery: string;
  limit?: number;
  attributesToRetrieve?: string[];
  retries?: number;
}

// Enhanced search engine function specifically for customers
export const searchCustomers = async ({
  searchQuery,
  limit = 10,
  retries = 2,
}: Omit<MeilisearchParams, "index" | "attributesToRetrieve">): Promise<
  LoyaltyCustomer[]
> => {
  const baseUrl = MEILISEARCH_URL;
  const apiKey =
    process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY ||
    "dd5e0bfa86569cdab356d3edb21328f233fd00ccda6d8fc555af6714d1e0345c";

  const url = `${baseUrl}/indexes/customers/search`;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      q: searchQuery,
      limit,
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
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const start = performance.now();
      const response = await fetch(url, options);

      if (!response.ok) {
        const error: Error & { status?: number } = new Error(
          `Meilisearch request failed with status ${response.status}`
        );
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      const end = performance.now();
      console.log(
        `🔍 Meilisearch customer search took ${Math.round(end - start)}ms`
      );

      // Transform hits to LoyaltyCustomer objects
      return data.hits.map((hit: any) => ({
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
      }));
    } catch (error) {
      if (attempt === retries - 1) {
        console.error(
          "Meilisearch customer search failed after retries:",
          error
        );
        return [];
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }

  return [];
};
