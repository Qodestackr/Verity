/**
 * Utility functions for product management
 * These functions help extract information from product names and apply smart defaults
 */

/**
 * Extract volume information from a product name
 * Examples:
 * - "Tusker Lager 500ML" -> "500ML"
 * - "Kenya Cane 750ml" -> "750ml"
 * - "Coca-Cola 1L" -> "1L"
 * - "Ugali 1/4kg" -> "1/4kg"
 */
export function extractVolumeFromName(name: string): string {

  // Match common volume patterns
  const volumeRegex =
    /\b(\d+(\.\d+)?)\s*(ml|ML|l|L|kg|KG)\b|\b(\d+\/\d+)\s*(kg|KG)\b/i;
  const match = name.match(volumeRegex);
  return match ? match[0] : "";
}

/**
 * Extract brand information from a product name
 * This is a simple heuristic that will be enhanced with AI in the future
 * Examples:
 * - "Tusker Lager 500ML" -> "Tusker"
 * - "Kenya Cane 750ML" -> "Kenya Cane"
 * - "Johnnie Walker Black Label 750ML" -> "Johnnie Walker"
 * - "General Meakins" wont give us London distillers
 */
export function extractBrandFromName(name: string): string {
  // TODO: Enhance with AI to recognize actual brands
  // For now, use a simple heuristic: first word or first two words
  const words = name.split(" ");

  // Common brand patterns
  if (words.length >= 2) {
    // Check for common two-word brands
    const twoWordBrands = [
      "Kenya Cane",
      "Johnnie Walker",
      "Jack Daniel",
      "Minute Maid",
    ];
    const firstTwoWords = `${words[0]} ${words[1]}`;

    if (twoWordBrands.some((brand) => firstTwoWords.includes(brand))) {
      return firstTwoWords;
    }
  }

  // Default to first word
  return words[0] || "Unknown";
}

/**
 * Get a default category based on product type
 */
export function getCategoryFromType(type: string): string {
  // Simple mapping from type to default category
  switch (type) {
    case "Alcoholic":
      return "Spirits"; // Default category for alcoholic
    case "Non-Alcoholic":
      return "Soft Drinks"; // Default category for non-alcoholic
    case "Food":
      return "Meals"; // Default category for food
    default:
      return "Miscellaneous";
  }
}

/**
 * Process a product with smart defaults
 * This function takes the minimal product data entered by the user
 * and enhances it with smart defaults and extracted information
 */
export function processProductWithDefaults(productData: any) {
  return {
    ...productData,
    // Extract volume from product name if possible
    volume: extractVolumeFromName(productData.name),

    // Apply smart defaults for fields we don't ask for
    brand: extractBrandFromName(productData.name),
    alcoholPercentage: productData.type === "Alcoholic" ? "40%" : "",
    origin: "Kenya", // Default country of origin
    category: getCategoryFromType(productData.type),
  };
}
