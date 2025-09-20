interface MeilisearchParams {
  index: string;
  searchQuery: string;
  limit?: number;
  attributesToRetrieve?: string[];
  retries?: number;
}

interface MeilisearchError extends Error {
  status?: number;
}

export const searchEngine = async ({
  index,
  searchQuery,
  limit = 5,
  attributesToRetrieve = ["id", "name", "slug", "price"],
  retries = 1,
}: MeilisearchParams): Promise<any[]> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_MEILISEARCH_URL || "https://search.alcorabooks.com";
  const apiKey =
    "dd5e0bfa86569cdab356d3edb21328f233fd00ccda6d8fc555af6714d1e0345c";

  const url = `${baseUrl}/indexes/${index}/search`;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      q: searchQuery,
      limit,
      attributesToRetrieve,
    }),
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const start = performance.now();
      const response = await fetch(url, options);

      if (!response.ok) {
        const error: MeilisearchError = new Error(
          `Meilisearch request failed with status ${response.status}`
        );
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      const end = performance.now();
      console.log(
        `🔍 Meilisearch search on ${index} took ${Math.round(end - start)}ms`
      );

      return data.hits;
    } catch (error) {
      if (attempt === retries - 1) {
        console.error("Meilisearch search failed after retries:", error);
        throw new Error(
          error instanceof Error ? error.message : "Unknown search error"
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }

  return [];
};

export interface MeilisearchHit {
  id: string;
  saleor_id?: string;
  variants?: string[];
  name: string;
  slug: string;
  skus?: string[];
  stock?: number;
  price: number;
  cost_price?: number;
  [key: string]: any;
}

export interface MeilisearchResponse {
  hits: MeilisearchHit[];
  processingTimeMs: number;
  query: string;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}
