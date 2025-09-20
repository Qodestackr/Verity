export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import { searchEngine } from "@/utils/search-engine";
import { ensureCustomerIndexed } from "@/utils/ensure-customer-indexed";
import type { LoyaltyCustomer } from "@/types/loyalty";
import { redis } from "@/lib/redis";

const CACHE_TTL = 3_600;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 3) {
    return NextResponse.json({ customers: [] });
  }

  try {
    const cacheKey = `${query}`; //customer_ to avoid collisions
    const cachedResults = await redis.get(cacheKey);

    // If we have cached results, return them
    if (cachedResults) {
      console.log(`✅ Cache hit for query: ${query}`);
      return NextResponse.json({
        customers: JSON.parse(cachedResults),
        source: "cache",
      });
    }

    console.log(`⏳ Cache miss for query: ${query}, searching Meilisearch...`);

    // Search Meilisearch
    const hits = await searchEngine({
      index: "alcora_customers",
      searchQuery: query,
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
      limit: 10,
      retries: 2,
    });

    // Transform hits to LoyaltyCustomer objects
    let customers = hits.map((hit: any) => ({
      id: hit.id,
      name: hit.name,
      phone: hit.phone,
      email: hit.email,
      loyaltyPoints: hit.loyaltyPoints || {
        pointsEarned: 0,
        pointsRedeemed: 0,
        balance: 0,
        history: [],
      },
      loyaltyTier: hit.loyaltyTier || "Bronze",
      lastVisit: hit.lastVisit,
      totalSpent: hit.totalSpent || 0,
      joinDate: hit.joinDate,
    }));

    // If no results found in Meilisearch, try to find in database
    if (customers.length === 0) {
      console.log(
        `🔍 No results in Meilisearch for query: ${query}, checking database...`
      );
      const customer = await ensureCustomerIndexed(query);

      if (customer) {
        customers = [customer];
      }
    }

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(customers));

    return NextResponse.json({
      customers,
      source: "meilisearch",
    });
  } catch (error) {
    console.error("Error in customer search API:", error);

    // If search fails, try to find customer in DB
    try {
      const customer = await ensureCustomerIndexed(query);
      if (customer) {
        return NextResponse.json({
          customers: [customer],
          source: "database",
        });
      }
    } catch (dbError) {
      console.error("Database search also failed:", dbError);
    }

    return NextResponse.json(
      {
        customers: [],
        error: "Search failed",
      },
      { status: 500 }
    );
  }
}
