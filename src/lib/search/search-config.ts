import { useCurrency } from "@/hooks/useCurrency";
import { meilisearchClient } from "@/lib/search/meilisearch-client";

export async function configureSearchIndexes() {
  try {
    const orderIndex = meilisearchClient.getIndex("order");
    await orderIndex.updateSettings({
      searchableAttributes: ["id"],
      filterableAttributes: ["number", "status", "id"],
      sortableAttributes: ["created", "total"],
    });

    const checkoutIndex = meilisearchClient.getIndex("checkout");
    await checkoutIndex.updateSettings({
      searchableAttributes: ["id", "token", "totalPrice"],
      sortableAttributes: ["status", "total"],
    });

    const saleorProduct = meilisearchClient.getIndex("product");
    await saleorProduct.updateSettings({
      searchableAttributes: [
        "attributes",
        "description",
        "variants",
        "channel",
      ],
      filterableAttributes: ["variants", "price", "stock", "sku", "attributes"],
      sortableAttributes: ["price", "stock", "sku"],
      rankingRules: [
        "exactness",
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
      ],
    });

    const categoriesIndex = meilisearchClient.getIndex("categories");

    console.info("Search indexes configured successfully");
  } catch (error) {
    console.error("Failed to configure search indexes:", error);
    process.exit(1);
  }
}
