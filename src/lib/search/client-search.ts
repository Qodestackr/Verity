const MEILISEARCH_HOST = "https://search.alcorabooks.com";
const MEILISEARCH_ADMIN_KEY =
  "dd5e0bfa86569cdab356d3edb21328f233fd00ccda6d8fc555af6714d1e0345c";

async function searchProducts(query: string) {
  const response = await fetch(`${MEILISEARCH_HOST}/indexes/products/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MEILISEARCH_ADMIN_KEY}`,
    },
    body: JSON.stringify({
      q: query,
      limit: 20,
      attributesToRetrieve: [
        "id",
        "name",
        "slug",
        "skus",
        "stock",
        "saleor_id",
        "variants",
      ],
      attributesToHighlight: [],
    }),
  });

  if (!response.ok) throw new Error("Search failed");
  return response.json();
}
