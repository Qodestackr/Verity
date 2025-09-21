
import { MEILISEARCH_URL } from "@/config/urls";
import { MeiliSearch, Index } from "meilisearch";

class MeilisearchClient {
  private static instance: MeilisearchClient;
  private client: MeiliSearch;

  private constructor() {
    const host = MEILISEARCH_URL;
    const apiKey =
      "dd5e0bfa86569cdab356d3edb21328f233fd00ccda6d8fc555af6714d1e0345c";

    if (!host || !apiKey) {
      throw new Error("Missing MEILISEARCH configs");
    }

    this.client = new MeiliSearch({ host, apiKey });
  }

  public static getInstance(): MeilisearchClient {
    if (!MeilisearchClient.instance) {
      MeilisearchClient.instance = new MeilisearchClient();
    }
    return MeilisearchClient.instance;
  }

  public getIndex(index: string): Index {
    return this.client.index(index);
  }

  /**
   * index settings (e.g., ranking rules, searchable attributes, sortable attributes)
   * @param {string} indexName - The name of the index to update
   */
  public async updateIndexSettings(indexName: string) {
    const index = this.getIndex(indexName);

    try {
      await index.updateRankingRules([
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
        "created:desc",
      ]);

      // searchable attributes (fields to search on)
      await index.updateSearchableAttributes([
        "category",
        "variants.sku",
        "barcode",
        "abv",
        "attributes.*",
        "variants",
        "price",
        "stock:desc",
        "sku",
        "attributes",
        "description",
        "channel",
        "name",
      ]);

      // sortable attributes (fields to sort on)
      await index.updateSortableAttributes([
        "price",
        "stock",
        "sku",
        "updatedAt:desc",
      ]);

      console.log("index settings updated");
    } catch (error) {
      console.error("Failed to update Meilisearch index settings:", error);
      throw error;
    }
  }

  /**
   * Add or update documents in the index
   * @param {string} indexName - The name of the index
   * @param {any[]} documents - The documents to add or update
   */
  public async indexDocuments(indexName: string, documents: any[]) {
    const index = this.getIndex(indexName);
    await index.addDocuments(documents);
    console.log("Documents indexed successfully!");
  }

  /**
   * Delete documents from the index
   * @param {string} indexName - The name of the index
   * @param {string[]} documentIds - The IDs of the documents to delete
   */
  public async deleteDocuments(indexName: string, documentIds: string[]) {
    const index = this.getIndex(indexName);
    await index.deleteDocuments(documentIds);
    console.log("Documents deleted successfully!");
  }
}

export const meilisearchClient = MeilisearchClient.getInstance();
