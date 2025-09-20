/**
 * This service handles interactions with Redis/Upstash
 * Note: This is a mock implementation for demonstration purposes
 */

import { redis } from "@/lib/redis";

export async function storeProductsInRedis(
  userId: string,
  products: any[]
): Promise<void> {
  console.log(
    `Storing ${products.length} products in Redis for user ${userId}`
  );

  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log(`Successfully stored ${products.length} products in Redis`);
}

// Mock function to retrieve products from Redis
export async function getProductsFromRedis(userId: string): Promise<any[]> {
  console.log(`Retrieving products from Redis for user ${userId}`);

  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      id: "UHJvZHVjdDox",
      name: "Tusker Lager",
      sku: "TUSKER-001",
      barcode: "5901234123457",
      variantId: "UHJvZHVjdFZhcmlhbnQ6MQ==",
      category: "Beer",
      price: 1,
      quantity: 0,
    },
    {
      id: "UHJvZHVjdDoy",
      name: "Tusker Malt",
      sku: "TUSKER-002",
      barcode: "5901234123458",
      variantId: "UHJvZHVjdFZhcmlhbnQ6Mg==",
      category: "Beer",
      price: 1,
      quantity: 0,
    },
    {
      id: "UHJvZHVjdDoz",
      name: "Johnnie Walker Black Label",
      sku: "JW-BLACK-001",
      barcode: "5901234123459",
      variantId: "UHJvZHVjdFZhcmlhbnQ6Mw==",
      category: "Whisky",
      price: 1,
      quantity: 0,
    },
    // Add more mock products as needed
  ];
}

// New function to get all standard products from Redis
// Add this function to retrieve all standard products from Redis
export async function getAllStandardProducts() {
  try {
    const productsStr = await redis.get("admin:products");
    return productsStr ? JSON.parse(productsStr) : [];
  } catch (error) {
    console.error("Error fetching products from Redis:", error);
    return [];
  }
}
