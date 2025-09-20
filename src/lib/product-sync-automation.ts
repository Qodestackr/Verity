import pLimit from "p-limit";
import { useCurrency } from "@/hooks/useCurrency";
import { redis } from "@/lib/redis";
import { executeMutation } from "@/lib/graphql-client";
import {
  CreateProductDocument,
  CreateProductVariantDocument,
  PublishProductToChannelDocument,
  SetProductVariantPriceDocument,
} from "@/gql/graphql";
import { slugify } from "@/utils/url";
import {
  createProductAttributes,
  createOrGetProductType,
  getProductBySlug,
} from "@/utils/saleor-utils";

// Configuration
const REDIS_PRODUCTS_KEY = "admin:products";
const WAREHOUSE_ID =
  "V2FyZWhvdXNlOjVhZmVlYWJjLWNjODMtNDUzNy1hY2IyLWRkNDRhNjJjOTc2Mg==";
//   process.env.NEXT_PUBLIC_WAREHOUSE_ID ||
//   "V2FyZWhvdXNlOjNlMTUwNDRiLWIyNGUtNDA1Mi1hNWY1LTVhOTI3MTE5M2I5Nw==";
const DEFAULT_CHANNEL_ID = "Q2hhbm5lbDoz";
//   process.env.NEXT_PUBLIC_SALEOR_CHANNEL_ID || "";

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
  skippedCount: number;
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
  skipExisting?: boolean;
  updateExisting?: boolean;
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
    skipExisting = true,
    updateExisting = false,
  } = options;

  // Create a concurrency limiter
  const limit = pLimit(concurrency);

  try {
    // Get all products from Redis
    const productsJson = await redis.get(REDIS_PRODUCTS_KEY);
    if (!productsJson) {
      throw new Error("No products found in Redis");
    }

    const products: ProductData[] = JSON.parse(productsJson);
    const total = products.length;

    console.log(`Starting sync of ${total} products to channel ${channelId}`);

    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const failedProducts: Array<{ name: string; error: string }> = [];

    // Create an array of promises for each product
    const syncPromises = products.map((product, index) => {
      return limit(async () => {
        try {
          // Create or update the product in Saleor
          const result = await createOrUpdateProductInSaleor(
            product,
            channelId,
            {
              skipExisting,
              updateExisting,
            }
          );

          if (result.skipped) {
            skippedCount++;
            console.log(`Skipped existing product: ${product.name}`);
          } else {
            successCount++;
            console.log(
              `Successfully ${
                result.updated ? "updated" : "created"
              } product: ${product.name}`
            );
          }

          // Call progress callback if provided
          if (onProgress) {
            onProgress(index + 1, total);
          }

          return { success: true, product, ...result };
        } catch (error) {
          failedCount++;
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          failedProducts.push({ name: product.name, error: errorMessage });

          console.error(`Failed to sync product ${product.name}:`, error);

          // Call progress callback even for failures
          if (onProgress) {
            onProgress(index + 1, total);
          }

          return { success: false, product, error };
        }
      });
    });

    // Wait for all product sync operations to complete
    await Promise.all(syncPromises);

    return {
      success: failedCount === 0,
      totalProducts: total,
      successCount,
      failedCount,
      skippedCount,
      failedProducts,
      channelId,
    };
  } catch (error) {
    console.error("Product sync failed:", error);
    throw error;
  }
}

/**
 * Creates or updates a single product in Saleor
 */
async function createOrUpdateProductInSaleor(
  product: ProductData,
  channelId: string,
  options: { skipExisting: boolean; updateExisting: boolean }
): Promise<{ productId: string; skipped: boolean; updated: boolean }> {
  try {
    // Generate the slug for this product
    const productSlug = slugify(`${product.brand}-${product.name}`);

    // Check if product already exists
    const existingProductId = await getProductBySlug(productSlug);

    if (existingProductId) {
      // Product exists
      if (options.skipExisting) {
        // Skip this product
        return { productId: existingProductId, skipped: true, updated: false };
      } else if (options.updateExisting) {
        // Update the existing product
        // For now, we'll just ensure it's published to the channel
        await ensureProductPublishedToChannel(existingProductId, channelId);
        return { productId: existingProductId, skipped: false, updated: true };
      }
    }

    // Product doesn't exist or we're not skipping/updating - create a new one
    // 1. Get or create required attributes
    const attributeIds = await createProductAttributes();

    // 2. Get or create product type
    const productTypeName = product.type || "Alcoholic";
    const productTypeId = await createOrGetProductType(
      productTypeName,
      attributeIds
    );

    // 3. Create the base product
    const createProductResult = await executeMutation(CreateProductDocument, {
      variables: {
        input: {
          name: `${product.name}`,
          slug: productSlug,
          productType: productTypeId,
          category: "Q2F0ZWdvcnk6Mg==", // Default category ID
          attributes: [
            {
              id: attributeIds.alcoholContentAttr,
              values: [product.alcoholPercentage],
            },
            {
              id: attributeIds.originAttr,
              values: [product.origin || "Kenya"],
            },
          ],
        },
      },
    });

    if (createProductResult.productCreate?.errors?.length) {
      // Check if this is a duplicate slug error
      const isDuplicateSlug = createProductResult.productCreate.errors.some(
        (err: any) => err.code === "UNIQUE" && err.field === "slug"
      );

      if (isDuplicateSlug) {
        // Try to get the product again (it might have been created in a race condition)
        const retryProductId = await getProductBySlug(productSlug);
        if (retryProductId) {
          // Ensure it's published to the channel
          await ensureProductPublishedToChannel(retryProductId, channelId);
          return { productId: retryProductId, skipped: false, updated: true };
        }
      }

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
                id: attributeIds.volumeAttr,
                values: [product.volume],
              },
            ],
            stocks: [
              {
                warehouse: WAREHOUSE_ID,
                quantity: product.stock || 0,
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
    await publishProductToChannel(productId, channelId);

    // 6. Set the variant price
    await executeMutation(SetProductVariantPriceDocument, {
      variables: {
        id: variantId,
        input: [{ channelId, price: product.price.toString() }],
      },
    });

    return { productId, skipped: false, updated: false };
  } catch (error) {
    console.error(`Failed to create/update product ${product.name}:`, error);
    throw error;
  }
}

/**
 * Ensures a product is published to a specific channel
 */
async function ensureProductPublishedToChannel(
  productId: string,
  channelId: string
): Promise<void> {
  try {
    await publishProductToChannel(productId, channelId);
  } catch (error) {
    console.error(`Failed to publish product ${productId} to channel:`, error);
    throw error;
  }
}

/**
 * Publishes a product to a specific channel
 */
async function publishProductToChannel(
  productId: string,
  channelId: string
): Promise<void> {
  await executeMutation(PublishProductToChannelDocument, {
    variables: {
      productId,
      channelId,
    },
  });
}

/**
 * Gets product type and attribute mappings for a channel
 */
export async function getChannelMappings(channelId: string): Promise<{
  productTypeMapping: Record<string, string>;
  attributeMapping: Record<string, string>;
}> {
  // fetch mappings from db
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
