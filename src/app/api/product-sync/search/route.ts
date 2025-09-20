export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import {
  GetProductsForMeiliSearchDocument,
  GetProductsForMeiliSearchQueryVariables,
} from "@/gql/graphql";
import { useCurrency } from "@/hooks/useCurrency";
import { gqlclient } from "@/lib/graphql";

const MEILISEARCH_HOST = "https://search.alcorabooks.com";
const MEILISEARCH_API_KEY =
  "dd5e0bfa86569cdab356d3edb21328f233fd00ccda6d8fc555af6714d1e0345c";
const INDEX_NAME = "test_products"; //"products";

// Transform Saleor's base64 ID to MeiliSearch compatible ID
function transformId(saleorId: string): string {
  try {
    const decoded = atob(saleorId).split(":")[1];
    return decoded.replace(/\D/g, ""); // Extract numeric part only
  } catch {
    return saleorId.replace(/[^a-zA-Z0-9-]/g, "_").substring(0, 511);
  }
}

async function meiliRequest(endpoint: string, method: string, body?: any) {
  const response = await fetch(`${MEILISEARCH_HOST}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`MeiliSearch Error: ${await response.text()}`);
  }
  return response.json();
}

export async function GET() {
  try {
    // 1. Delete existing index if it exists
    try {
      await meiliRequest(`/indexes/${INDEX_NAME}`, "DELETE");
    } catch {} // Ignore if index doesn't exist

    // 2. Create new index with explicit primary key
    await meiliRequest("/indexes", "POST", {
      uid: INDEX_NAME,
      primaryKey: "id",
    });

    // 3. Fetch all products from Saleor
    const allProducts = [];
    let after = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const result = await gqlclient.query(GetProductsForMeiliSearchDocument, {
        first: 100,
        after,
        channel: "alcora-admin", //"century-consults",
      });

      if (!result.data?.products?.edges) break;

      const products = result.data.products.edges.map(({ node }) => ({
        id: transformId(node.id),
        saleor_id: node.id, // Original ID for reference
        variants: node.variants?.map((v) => ({
          variantId: v.id, // Ensure the variant ID is captured here
          sku: v.sku,
          name: v.name,
          stock: v.quantityAvailable || 0,
          price: v.pricing?.priceRange?.start?.gross?.amount ?? 0,
          cost_price: v.channelListings?.[0]?.costPrice?.amount ?? 0,
        })),
        name: node.name,
        slug: node.slug,
        skus: node.variants?.map((v) => v.sku).join(" ") || "",
        stock: node.variants?.reduce(
          (sum, v) => sum + (v.quantityAvailable || 0),
          0
        ),
        price: node.pricing?.priceRange?.start?.gross?.amount ?? 0,
        cost_price:
          node.variants?.[0]?.channelListings?.[0]?.costPrice?.amount ?? 0,
      }));

      allProducts.push(...products);
      hasNextPage = result.data.products.pageInfo.hasNextPage;
      after = result.data.products.pageInfo.endCursor;
    }

    // 4. Add documents to MeiliSearch
    const { taskUid } = await meiliRequest(
      `/indexes/${INDEX_NAME}/documents`,
      "POST",
      allProducts
    );

    // 5. Verify task completion
    let task;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      task = await meiliRequest(`/tasks/${taskUid}`, "GET");
    } while (task.status !== "succeeded");

    // 6. Final verification
    const stats = await meiliRequest(`/indexes/${INDEX_NAME}/stats`, "GET");

    return NextResponse.json({
      success: true,
      productsIndexed: stats.numberOfDocuments,
      sampleDocument: allProducts[0],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
