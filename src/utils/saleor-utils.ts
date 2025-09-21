import { executeMutation, executeGraphQL } from "@/lib/graphql-client";
import {
  CreateProductAttributesDocument,
  CreateProductTypeDocument,
  GetProductTypeBySlugDocument,
  GetAttributeBySlugDocument,
  AttributeTypeEnum,
  AttributeInputTypeEnum,
  ProductTypeKindEnum,
  AttributeEntityTypeEnum,
  GetProductBySlugDocument,
} from "@/gql/graphql";
import { slugify } from "@/utils/url";

// Cache for attribute and product type IDs to avoid repeated queries
const attributeCache: Record<string, string> = {};
const productTypeCache: Record<string, string> = {};
const productCache: Record<string, string> = {};

// Core attribute definitions
const CORE_ATTRIBUTES = {
  VOLUME: {
    name: "Bottle Volume",
    slug: "bottle-volume",
    values: [
      "250ML",
      "275ML",
      "300ML",
      "330ML",
      "350ML",
      "375ML",
      "440ML",
      "500ML",
      "620ML",
      "650ML",
      "700ML",
      "750ML",
      "1L",
      "1.5L",
      "1.75L",
      "2L",
      "5L",
    ],
  },
  ALCOHOL: {
    name: "Alcohol Content",
    slug: "alcohol-content",
    values: ["35%", "37.5%", "40%", "43%", "45%", "47%", "50%", "60%"],
  },
  ORIGIN: {
    name: "Country of Origin",
    slug: "country-of-origin",
    values: [
      "Kenya",
      "Uganda",
      "Tanzania",
      "South Africa",
      "United Kingdom",
      "Scotland",
      "Germany",
      "France",
      "Italy",
      "Ireland",
      "Spain",
      "Netherlands",
      "Belgium",
      "Sweden",
      "Denmark",
      "Poland",
      "Russia",
      "United States",
      "Mexico",
      "Canada",
      "Japan",
      "India",
      "China",
      "Thailand",
      "Australia",
      "New Zealand",
      "Other",
    ],
  },
};

/**
 * Interface for attribute IDs
 */
export interface AttributeIds {
  volumeAttr: string;
  alcoholContentAttr: string;
  originAttr: string;
}

/**
 * Gets or creates product attributes needed for alcoholic products
 */
export async function createProductAttributes(): Promise<AttributeIds> {
  try {
    const attributeIds: Partial<AttributeIds> = {};
    const missingAttributes: (typeof CORE_ATTRIBUTES)[keyof typeof CORE_ATTRIBUTES][] =
      [];

    // First: Try to get all existing attributes
    for (const [key, attrDef] of Object.entries(CORE_ATTRIBUTES)) {
      // Check cache first
      if (attributeCache[attrDef.slug]) {
        if (key === "VOLUME")
          attributeIds.volumeAttr = attributeCache[attrDef.slug];
        if (key === "ALCOHOL")
          attributeIds.alcoholContentAttr = attributeCache[attrDef.slug];
        if (key === "ORIGIN")
          attributeIds.originAttr = attributeCache[attrDef.slug];
        continue;
      }

      const result = await executeGraphQL(GetAttributeBySlugDocument, {
        variables: { slug: attrDef.slug },
      });

      const attribute = result?.attributes?.edges?.find(
        (edge) => edge?.node?.slug === attrDef.slug
      )?.node;

      if (attribute?.id) {
        // Cache the ID
        attributeCache[attrDef.slug] = attribute.id;

        if (key === "VOLUME") attributeIds.volumeAttr = attribute.id;
        if (key === "ALCOHOL") attributeIds.alcoholContentAttr = attribute.id;
        if (key === "ORIGIN") attributeIds.originAttr = attribute.id;
      } else {
        missingAttributes.push(attrDef);
      }
    }

    // Then: Try to create missing ones
    if (missingAttributes.length > 0) {
      const attributesToCreate = missingAttributes.map((attrDef) => ({
        name: attrDef?.name,
        slug: attrDef?.slug,
        entityType: AttributeEntityTypeEnum.Product,
        inputType: AttributeInputTypeEnum.Dropdown,
        type: AttributeTypeEnum.ProductType,
        values: attrDef.values.map((value) => ({ name: value })),
      }));

      const createResult: any = await executeMutation(
        CreateProductAttributesDocument,
        {
          variables: { attributes: attributesToCreate },
        }
      );

      if (createResult?.attributeBulkCreate?.errors?.length) {
        throw new Error(
          `Attribute creation failed: ${JSON.stringify(
            createResult.attributeBulkCreate.errors
          )}`
        );
      }

      for (const result of createResult?.attributeBulkCreate?.results || []) {
        const slug = result?.attribute?.slug;
        const id = result?.attribute?.id;

        if (!slug || !id) continue;

        // Cache the ID
        attributeCache[slug] = id;

        if (slug === CORE_ATTRIBUTES.VOLUME.slug) attributeIds.volumeAttr = id;
        if (slug === CORE_ATTRIBUTES.ALCOHOL.slug)
          attributeIds.alcoholContentAttr = id;
        if (slug === CORE_ATTRIBUTES.ORIGIN.slug) attributeIds.originAttr = id;
      }
    }

    // Final check: make sure we have all 3
    if (
      !attributeIds.volumeAttr ||
      !attributeIds.alcoholContentAttr ||
      !attributeIds.originAttr
    ) {
      throw new Error("Missing attribute IDs after create");
    }

    return attributeIds as AttributeIds;
  } catch (error) {
    console.error("Attribute creation error:", error);
    throw new Error(
      `Failed to setup product attributes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Gets or creates a product type by name
 */
export async function createOrGetProductType(
  category: string,
  attributeIds: AttributeIds
): Promise<string> {
  const productTypeSlug = slugify(category);

  // Check cache first
  if (productTypeCache[productTypeSlug]) {
    return productTypeCache[productTypeSlug];
  }

  try {
    // Check existing product type
    const existingType = await executeGraphQL(GetProductTypeBySlugDocument, {
      variables: { slug: productTypeSlug },
    });

    const existingProductTypeId =
      existingType?.productTypes?.edges[0]?.node?.id;
    if (existingProductTypeId) {
      // Cache the ID
      productTypeCache[productTypeSlug] = existingProductTypeId;
      return existingProductTypeId;
    }

    // Create new product type
    const result = await executeMutation(CreateProductTypeDocument, {
      variables: {
        name: category,
        slug: productTypeSlug,
        productAttributes: [
          attributeIds.alcoholContentAttr,
          attributeIds.originAttr,
        ],
        variantAttributes: [attributeIds.volumeAttr],
        kind: ProductTypeKindEnum.Normal,
        isShippingRequired: true,
      },
    });

    if (result.productTypeCreate?.errors?.length) {
      // Handle "already exists" case
      const alreadyExists = result.productTypeCreate.errors.some(
        (err: any) =>
          err.message?.includes("already exists") ||
          err.code === "ALREADY_EXISTS"
      );

      if (alreadyExists) {
        // Retry getting the existing type
        const retryResult = await executeGraphQL(GetProductTypeBySlugDocument, {
          variables: { slug: productTypeSlug },
        });
        const productTypeId = retryResult?.productTypes?.edges[0]?.node?.id;
        if (productTypeId) {
          // Cache the ID
          productTypeCache[productTypeSlug] = productTypeId;
          return productTypeId;
        }
      }

      throw new Error(
        `Product type creation failed: ${JSON.stringify(
          result.productTypeCreate.errors
        )}`
      );
    }

    const productTypeId = result?.productTypeCreate?.productType?.id;
    if (!productTypeId) {
      throw new Error("Product type creation failed: No ID returned");
    }

    // Cache the ID
    productTypeCache[productTypeSlug] = productTypeId;
    return productTypeId;
  } catch (error) {
    console.error(`Error in createOrGetProductType:`, error);
    throw new Error(
      `Failed to get or create product type: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Checks if a product exists by slug and returns its ID if found
 */
export async function getProductBySlug(slug: string): Promise<string | null> {
  // Check cache first
  if (productCache[slug]) {
    return productCache[slug];
  }

  try {
    const result = await executeGraphQL(GetProductBySlugDocument, {
      variables: { slug },
    });

    const productId = result?.product?.id;
    if (productId) {
      // Cache the ID
      productCache[slug] = productId;
      return productId;
    }

    return null;
  } catch (error) {
    console.error(`Error checking if product exists:`, error);
    return null;
  }
}

/**
 * Ensures attribute values exist and are properly formatted
 * This helps avoid duplicate attribute value errors
 */
export async function ensureAttributeValues(
  attributeId: string,
  values: string[]
): Promise<string[]> {
  try {
    // For now, we'll just make the values unique by adding a small random suffix if needed
    // In a production environment, you'd want to query existing values and handle them properly
    const uniqueValues = values.map((value) => {
      // Add a small random suffix to ensure uniqueness
      // temp soln - in prod we'll check if the value exists first
      const randomSuffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `${value}_${randomSuffix}`;
    });

    return uniqueValues;
  } catch (error) {
    console.error("Error ensuring attribute values:", error);
    // Fall back to original values
    return values;
  }
}
