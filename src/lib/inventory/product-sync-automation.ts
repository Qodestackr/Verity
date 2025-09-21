import pLimit from "p-limit";

import { redis } from "@/lib/redis";
import { executeMutation } from "@/lib/graphql-client";
import {
  CreateProductDocument,
  CreateProductVariantDocument,
  PublishProductToChannelDocument,
  SetProductVariantPriceDocument,
} from "@/gql/graphql";
import { slugify } from "@/utils/url";

// Configuration
const REDIS_PRODUCTS_KEY = "admin:products";
const WAREHOUSE_ID =
  process.env.NEXT_PUBLIC_WAREHOUSE_ID ||
  "V2FyZWhvdXNlOjNlMTUwNDRiLWIyNGUtNDA1Mi1hNWY1LTVhOTI3MTE5M2I5Nw==";
const DEFAULT_CHANNEL_ID =
  process.env.NEXT_PUBLIC_SALEOR_CHANNEL_ID || "Q2hhbm5lbDoz";

// Types
interface ProductData {
  id: string;
  name: string;
  brand: string;
  type: string;
  category: string;
  volume: string;
  price: number;
  sku: string;
  alcoholPercentage: string;
  origin?: string;
  stock: number;
  description?: string;
  createdAt: string;
}

interface SyncResult {
  success: boolean;
  totalProducts: number;
  successCount: number;
  failedCount: number;
  failedProducts: Array<{
    name: string;
    error: string;
  }>;
  channelId: string;
}

interface SyncOptions {
  channelId?: string;
  concurrency?: number;
  onProgress?: (current: number, total: number) => void;
  productTypeMapping?: Record<string, string>;
  attributeMapping?: Record<string, string>;
}

/**
 * Synchronizes all products from Redis to a specific channel
 */
export async function syncProductsToChannel(
  options: SyncOptions = {}
): Promise<SyncResult> {
  const {
    channelId = DEFAULT_CHANNEL_ID,
    concurrency = 5,
    onProgress,
    productTypeMapping = {},
    attributeMapping = {},
  } = options;

  const limit = pLimit(concurrency);

  try {
    const productsJson = await redis.get(REDIS_PRODUCTS_KEY);
    if (!productsJson) {
      throw new Error("No products found in Redis");
    }

    const products: ProductData[] = JSON.parse(productsJson);
    const total = products.length;

    console.log(`Starting sync of ${total} products to channel ${channelId}`);

    let successCount = 0;
    let failedCount = 0;
    const failedProducts: Array<{ name: string; error: string }> = [];

    const syncPromises = products.map((product, index) => {
      return limit(async () => {
        try {
          await createProductInSaleor(
            product,
            channelId,
            productTypeMapping,
            attributeMapping
          );

          successCount++;

          // Call progress callback if provided
          if (onProgress) {
            onProgress(index + 1, total);
          }

          return { success: true, product };
        } catch (error) {
          failedCount++;
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          failedProducts.push({ name: product.name, error: errorMessage });

          console.error(`Failed to sync product ${product.name}:`, error);

          if (onProgress) {
            onProgress(index + 1, total);
          }

          return { success: false, product, error };
        }
      });
    });

    await Promise.all(syncPromises);

    return {
      success: failedCount === 0,
      totalProducts: total,
      successCount,
      failedCount,
      failedProducts,
      channelId,
    };
  } catch (error) {
    console.error("Product sync failed:", error);
    throw error;
  }
}

/**
 * Creates a single product in Saleor
 */
async function createProductInSaleor(
  product: ProductData,
  channelId: string,
  productTypeMapping: Record<string, string>,
  attributeMapping: Record<string, string>
): Promise<string> {
  // 1. Get product type ID (using mapping or default)
  const productTypeId =
    productTypeMapping[product.type] ||
    productTypeMapping.default ||
    "UHJvZHVjdFR5cGU6MQ=="; // Default product type ID

  // 2. Get attribute IDs (using mapping or defaults)
  const volumeAttrId = attributeMapping.volume || "QXR0cmlidXRlOjE=";
  const alcoholContentAttrId =
    attributeMapping.alcoholContent || "QXR0cmlidXRlOjI=";
  const originAttrId = attributeMapping.origin || "QXR0cmlidXRlOjM=";

  // 3. Create the base product
  const createProductResult = await executeMutation(CreateProductDocument, {
    variables: {
      input: {
        name: `${product.brand} ${product.name}`,
        slug: slugify(`${product.brand}-${product.name}`),
        productType: productTypeId,
        category: "Q2F0ZWdvcnk6MQ==", // Default category ID
        attributes: [
          {
            id: alcoholContentAttrId,
            values: [product.alcoholPercentage],
          },
          {
            id: originAttrId,
            values: [product.origin || "Kenya"],
          },
        ],
      },
    },
  });

  if (createProductResult.productCreate?.errors?.length) {
    throw new Error(
      `Failed to create product: ${JSON.stringify(
        createProductResult.productCreate.errors
      )}`
    );
  }

  const productId = createProductResult.productCreate?.product?.id;
  if (!productId) {
    throw new Error("Product creation failed: No ID returned");
  }

  // 4. Create the product variant
  const createVariantResult = await executeMutation(
    CreateProductVariantDocument,
    {
      variables: {
        input: {
          product: productId,
          sku: product.sku,
          name: product.volume,
          trackInventory: true,
          attributes: [
            {
              id: volumeAttrId,
              values: [product.volume],
            },
          ],
          stocks: [
            {
              warehouse: WAREHOUSE_ID,
              quantity: 0, // Default to 0 stock for new vendors
            },
          ],
        },
      },
    }
  );

  if (createVariantResult.productVariantCreate?.errors?.length) {
    throw new Error(
      `Failed to create variant: ${JSON.stringify(
        createVariantResult.productVariantCreate.errors
      )}`
    );
  }

  const variantId =
    createVariantResult.productVariantCreate?.productVariant?.id;
  if (!variantId) {
    throw new Error("Variant creation failed: No ID returned");
  }

  // 5. Publish the product to the channel
  await executeMutation(PublishProductToChannelDocument, {
    variables: {
      productId,
      channelId,
    },
  });

  // 6. Set the variant price
  await executeMutation(SetProductVariantPriceDocument, {
    variables: {
      id: variantId,
      input: [{ channelId, price: product.price.toString() }],
    },
  });

  return productId;
}

/**
 * Gets product type and attribute mappings for a channel
 */
export async function getChannelMappings(channelId: string): Promise<{
  productTypeMapping: Record<string, string>;
  attributeMapping: Record<string, string>;
}> {
  // fetch these mappings from db
  // For now, we'll return default mappings
  return {
    productTypeMapping: {
      Alcoholic: "UHJvZHVjdFR5cGU6MQ==",
      "Non-Alcoholic": "UHJvZHVjdFR5cGU6Mg==",
      default: "UHJvZHVjdFR5cGU6MQ==",
    },
    attributeMapping: {
      volume: "QXR0cmlidXRlOjE=",
      alcoholContent: "QXR0cmlidXRlOjI=",
      origin: "QXR0cmlidXRlOjM=",
    },
  };
}
