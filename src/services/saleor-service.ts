/**
 * This service handles interactions with the Saleor API
 * Note: This is a mock implementation for demonstration purposes
 */

// Mock function to fetch products from Saleor
export async function fetchProductsFromSaleor(
  channelId: string
): Promise<any[]> {
  console.log(`Fetching products from Saleor for channel ${channelId}`);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock products
  return [
    {
      id: "UHJvZHVjdDox",
      name: "Tusker Lager",
      sku: "TUSKER-001",
      barcode: "5901234123457",
      variantId: "UHJvZHVjdFZhcmlhbnQ6MQ==",
      category: "Beer",
      description: "Kenya's most popular beer",
      images: ["https://example.com/tusker.jpg"],
    },
    {
      id: "UHJvZHVjdDoy",
      name: "Tusker Malt",
      sku: "TUSKER-002",
      barcode: "5901234123458",
      variantId: "UHJvZHVjdFZhcmlhbnQ6Mg==",
      category: "Beer",
      description: "Premium malt lager",
      images: ["https://example.com/tusker-malt.jpg"],
    },
    {
      id: "UHJvZHVjdDoz",
      name: "Johnnie Walker Black Label",
      sku: "JW-BLACK-001",
      barcode: "5901234123459",
      variantId: "UHJvZHVjdFZhcmlhbnQ6Mw==",
      category: "Whisky",
      description: "Premium blended Scotch whisky",
      images: ["https://example.com/jw-black.jpg"],
    },
    // Add more mock products as needed
  ];
}

// Function to create a product in Saleor from Redis data
export async function createProductInSaleor(productData: {
  name: string;
  brand: string;
  category: string;
  type: string;
  volume: string;
  price: string;
  sku: string;
  alcoholPercentage: string;
  origin: string;
  stock: number;
  description: string;
  channelId: string;
  warehouseId: string;
}): Promise<{ productId: string; variantId: string }> {
  console.log(`Creating product in Saleor: ${productData.name}`);

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate mock IDs
  const productId = `UHJvZHVjdDoke(${Math.floor(Math.random() * 1000)})`;
  const variantId = `UHJvZHVjdFZhcmlhbnQ6ke(${Math.floor(
    Math.random() * 1000
  )})`;

  console.log(
    `Created product ${productData.name} with ID ${productId} and variant ${variantId}`
  );

  return {
    productId,
    variantId,
  };
}

// Mock function to create a warehouse in Saleor
export async function createSaleorWarehouse(data: {
  name: string;
  channelId: string;
  address: {
    streetAddress1: string;
    city: string;
    country: string;
  };
}): Promise<string> {
  console.log(`Creating Saleor warehouse: ${data.name}`);

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock warehouse ID
  return "V2FyZWhvdXNlOjE=";
}

// Mock function to update a warehouse in Saleor
export async function updateSaleorWarehouse(
  warehouseId: string,
  data: {
    name: string;
    address: {
      streetAddress1: string;
      city: string;
      country: string;
    };
  }
): Promise<string> {
  console.log(`Updating Saleor warehouse ${warehouseId}: ${data.name}`);

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return the same warehouse ID
  return warehouseId;
}
