import { useCurrency } from "@/hooks/useCurrency";
import { Product, ProductVariant } from "@/gql/graphql";
import { meilisearchClient } from "@/lib/search/meilisearch-client";

import {
  type Index,
  MeiliSearchError,
  MeiliSearchApiError,
  MeiliSearchTimeOutError,
  SearchResponse,
} from "meilisearch";

type LiquorProductDocument = {
  id: string;
  name: string;
  category: string;
  variants: ProductVariant[];
  sku: string;
  barcode?: string;
  image: string;
  channel: string;
  stock: number;
  price: PriceRange;
  abv?: number;
  attributes: Record<string, string>;
};

type PriceRange = {
  min: number;
  max: number;
};

type MeilisearchSearchOptions = {
  filter?: string | string[];
  sort?: string[];
  limit?: number;
  offset?: number;
  attributesToRetrieve?: string[];
  facets?: string[];
  showMatchesPosition?: boolean;
};

export class LiquorSearchService {
  private productIndex: Index;

  constructor() {
    this.productIndex = meilisearchClient.getIndex("products");
  }

  async searchProducts(
    query: string,
    channel: string,
    options: MeilisearchSearchOptions = {}
  ): Promise<LiquorProductDocument[]> {
    try {
      const results = await this.productIndex.search(query, {
        ...options,
        filter: [`channel = ${channel}`],
        sort: options.sort ?? ["exactness:desc", "stock:desc"],
        attributesToRetrieve: [
          "id",
          "name",
          "variants",
          "category",
          "image",
          "stock",
          "price",
          "abv",
          "sku",
          "barcode",
        ],
        facets: ["category", "abv", "price"],
      });

      return results.hits as LiquorProductDocument[];
    } catch (error) {
      this.handleSearchError(error);
      return [];
    }
  }

  async indexProduct(product: Product, channel: string): Promise<void> {
    try {
      const document = this.transformToLiquorDocument(product, channel);
      await this.productIndex.addDocuments([document]);
    } catch (error) {
      console.error("Indexing failed:", error);
      throw new Error("Failed to index product");
    }
  }

  async bulkIndexProducts(products: Product[], channel: string): Promise<void> {
    const documents = products.map((p) =>
      this.transformToLiquorDocument(p, channel)
    );

    await this.productIndex.addDocuments(documents);
  }

  private transformToLiquorDocument(
    product: Product,
    channel: string
  ): LiquorProductDocument {
    const variants = product.variants || [];

    return {
      id: product.id,
      name: product.name,
      category: product.category?.name || "Uncategorized",
      variants,
      sku: this.getPrimarySKU(variants),
      barcode: this.getPrimaryBarcode(variants),
      image: product.thumbnail?.url || "/default-bottle.png",
      channel,
      stock: this.calculateTotalStock(variants),
      price: this.getPriceRange(variants),
      abv: this.getAlcoholContent(product),
      attributes: this.extractLiquorAttributes(product),
    };
  }

  private getAlcoholContent(product: Product): any /**number */ {
    return (
      product.attributes.find((a) => a.attribute?.slug === "abv")?.values[0]
        ?.name || 0
    );
  }

  private extractLiquorAttributes(product: Product): Record<string, string> {
    return product.attributes.reduce((acc, attr) => {
      const key = attr.attribute?.slug || "unknown";
      acc[key] = attr.values.map((v) => v.name).join(", ");
      return acc;
    }, {} as Record<string, string>);
  }

  private handleSearchError(error: unknown): void {
    if (error instanceof MeiliSearchApiError) {
      console.error("Search API Error:", error.message);
      throw new Error("Search service unavailable. Please try again later.");
    }

    if (error instanceof MeiliSearchTimeOutError) {
      console.error("Search timeout:", error);
      throw new Error("Search taking too long. Please refine your query.");
    }

    console.error("Unexpected search error:", error);
    throw new Error("Failed to perform search");
  }

  private getPrimarySKU(variants: ProductVariant[]): string {
    return variants[0]?.sku || "";
  }

  private getPrimaryBarcode(variants: ProductVariant[]): string | undefined {
    return variants[0].id; //?.barcode || undefined;
  }

  private calculateTotalStock(variants: ProductVariant[]): number {
    return variants.reduce((sum, v) => sum + (v.stocks?.[0]?.quantity || 0), 0);
  }

  private getPriceRange(variants: ProductVariant[]): PriceRange {
    const prices = variants.map((v) => v.pricing?.price?.gross.amount || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }
}

export async function searchOrCreate<T extends { id: string; name: string }>(
  index: any,
  query: string,
  createFn: () => Promise<T>
): Promise<T> {
  const search = await index.search(query, { limit: 1 });
  if (search.hits.length > 0) {
    return search.hits[0] as T;
  }
  const newItem = await createFn();
  await index.addDocuments([newItem]);
  return newItem;
}
