import { APP_BASE_API_URL } from "@/config/urls";
import {
  CreateProductAttributesDocument,
  CreateProductTypeDocument,
  CreateProductDocument,
  PublishProductToChannelDocument,
  CreateProductVariantDocument,
  AttributeTypeEnum,
  AttributeInputTypeEnum,
  ProductTypeKindEnum,
  AttributeEntityTypeEnum,
  SetProductVariantPriceDocument,
  GetProductTypeBySlugDocument,
  GetAttributeBySlugDocument,
} from "@/gql/graphql";
import { executeMutation, executeGraphQL } from "@/lib/graphql-client";
import { slugify } from "@/utils/url";

const WAREHOUSE_ID =
  "V2FyZWhvdXNlOjVhZmVlYWJjLWNjODMtNDUzNy1hY2IyLWRkNDRhNjJjOTc2Mg==";
// "V2FyZWhvdXNlOjNlMTUwNDRiLWIyNGUtNDA1Mi1hNWY1LTVhOTI3MTE5M2I5Nw==";
const CHANNEL_ID = process.env.NEXT_PUBLIC_SALEOR_CHANNEL_ID || "Q2hhbm5lbDoz";

// Type for the form data from the dialog
interface ProductFormData {
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
}

interface AttributeIds {
  volumeAttr: string;
  alcoholContentAttr: string;
  originAttr: string;
}

const countries = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "South Africa", // Regional
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
  "Russia", // Europe
  "United States",
  "Mexico",
  "Canada", // North America
  "Japan",
  "India",
  "China",
  "Thailand", // Asia
  "Australia",
  "New Zealand",
  "Other",
];

export const volumes = [
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
];

const CORE_ATTRIBUTES = {
  VOLUME: {
    name: "Bottle Volume",
    slug: "bottle-volume",
    values: volumes,
  },
  ALCOHOL: {
    name: "Alcohol Content",
    slug: "alcohol-content",
    values: ["35%", "37.5%", "40%", "43%", "45%", "47%", "50%", "60%"],
  },
  ORIGIN: {
    name: "Country of Origin",
    slug: "country-of-origin",
    values: countries,
  },
};

export const addProduct = async (
  formData: ProductFormData
): Promise<{ success: boolean; productId?: string; error?: string }> => {
  try {
    console.log("Starting product creation process with data:", formData);

    const result = await createCompleteProduct({
      name: `${formData.name}`, //`${formData.brand} ${formData.name}`
      category: formData.type,
      price: formData.price.toString(),
      stock: formData.stock || 0,
      description: formData.description,
      alcoholContent: formData.alcoholPercentage,
      volume: formData.volume,
      sku: formData.sku,
      origin: formData.origin,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error?.toString() || "Unknown error",
      };
    }

    console.log("Product creation completed successfully:", {
      productId: result.productId,
      variantId: result.variantId,
    });

    return {
      success: true,
      productId: result.productId,
    };
  } catch (error) {
    console.error("Error in product creation process:", error);
    return {
      success: false,
      error: (error as any)?.message || "An unknown error occurred",
    };
  }
};

export async function createCompleteProduct(productData: {
  name: string;
  category: string;
  price: string;
  stock: number;
  description?: string;
  alcoholContent?: string;
  volume?: string;
  sku?: string;
  origin?: string;
}) {
  try {
    // 1. Create attributes (or get existing ones)
    const attributeIds = await createProductAttributes();

    // 2. Create product type based on category
    const productTypeId = await createOrGetProductType(
      productData.category,
      attributeIds
    );

    if (!productTypeId) {
      throw new Error("Failed to get or create product type");
    }

    // 3. Create base product (and check for duplicate slug)
    const productId = await createProduct(
      productData.name,
      productTypeId,
      "UHJvZHVjdDoxNjQ=", // Default category ID [SANDBOX: Q2F0ZWdvcnk6MQ==][SELF HOSTED:UHJvZHVjdDoxNjQ=]
      attributeIds.alcoholContentAttr,
      productData.alcoholContent || "40%",
      attributeIds.originAttr,
      productData.origin || "Kenya"
    );

    if (!productId) {
      throw new Error("Failed to create product");
    }

    // 4. Create variant
    const sku =
      productData.sku ||
      `${slugify(productData.name)}-${Date.now().toString().slice(-6)}`;
    const variantId = await createProductVariant(
      productId,
      productData.volume || "750ML",
      sku,
      attributeIds.volumeAttr,
      productData.volume || "750ML",
      productData.stock
    );

    if (!variantId) {
      throw new Error("Failed to create product variant");
    }

    // 5. Publish product
    // Publishing first makes sure the product (and its variant) is available in channels.
    await publishProduct(productId);

    // 6. Set variant price
    // Now that the product is published, update the variant's price.
    await setVariantPrice(variantId, productData.price);

    return {
      success: true,
      productId,
      variantId,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createProductAttributes(): Promise<AttributeIds> {
  try {
    const attributeIds: Partial<AttributeIds> = {};
    const missingAttributes: (typeof CORE_ATTRIBUTES)[keyof typeof CORE_ATTRIBUTES][] =
      [];

    // First: Try to get all existing attributes
    for (const [key, attrDef] of Object.entries(CORE_ATTRIBUTES)) {
      const result = await executeGraphQL(GetAttributeBySlugDocument, {
        variables: { slug: attrDef.slug },
      });

      const attribute = result?.attributes?.edges?.find(
        (edge) => edge?.node?.slug === attrDef.slug
      )?.node;

      if (attribute?.id) {
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
        { variables: { attributes: attributesToCreate } }
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
      `Failed to setup product attributes: ${error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function createOrGetProductType(
  category: string,
  attributeIds: AttributeIds
): Promise<string> {
  const productTypeSlug = slugify(category);
  const redisKey = `product-type:${productTypeSlug}`;

  try {
    const cacheResponse = await fetch(
      `${APP_BASE_API_URL}/cache-product-type?key=${encodeURIComponent(redisKey)}`
    );

    if (cacheResponse.ok) {
      const cacheData = await cacheResponse.json();
      if (cacheData.value) {
        return cacheData.value;
      }
    }

    // Check existing product type
    const existingType = await executeGraphQL(GetProductTypeBySlugDocument, {
      variables: { slug: productTypeSlug },
    });

    const existingProductTypeId =
      existingType?.productTypes?.edges[0]?.node?.id;
    if (existingProductTypeId) {
      await cacheProductType(redisKey, existingProductTypeId);
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
          await cacheProductType(redisKey, productTypeId);
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

    await cacheProductType(redisKey, productTypeId);
    return productTypeId;
  } catch (error) {
    console.error(`Error in createOrGetProductType:`, error);
    throw new Error(
      `Failed to get or create product type: ${error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function cacheProductType(key: string, value: string): Promise<void> {
  try {
    await fetch(`${APP_BASE_API_URL}/cache-product-type`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        value,
        ttl: 86400, // 1 day in seconds
      }),
    });
  } catch (error) {
    console.error("Failed to cache product type:", error);
  }
}

export async function createProduct(
  name: string,
  productTypeId: string,
  categoryId: string,
  alcoholContentAttrId: string,
  alcoholContentValue: string,
  originAttrId: string,
  originValue: string
): Promise<string> {
  const result = await executeMutation(CreateProductDocument, {
    variables: {
      input: {
        name,
        slug: slugify(name),
        productType: productTypeId,
        category: categoryId,
        attributes: [
          {
            id: alcoholContentAttrId,
            values: [alcoholContentValue],
          },
          {
            id: originAttrId,
            values: [originValue],
          },
        ],
      },
    },
  });

  if (result.productCreate?.errors?.length) {
    throw new Error(
      `Failed to create product: ${JSON.stringify(result.productCreate.errors)}`
    );
  }

  if (!result?.productCreate?.product?.id) {
    throw new Error("Product creation failed: No ID returned");
  }

  return result.productCreate.product.id;
}

export async function createProductVariant(
  productId: string,
  name: string,
  sku: string,
  attributeId: string,
  attributeValue: string,
  quantity: number
): Promise<string> {
  const result = await executeMutation(CreateProductVariantDocument, {
    variables: {
      input: {
        product: productId,
        sku,
        name,
        trackInventory: true,
        attributes: [
          {
            id: attributeId,
            values: [attributeValue],
          },
        ],
        stocks: [
          {
            warehouse: WAREHOUSE_ID,
            quantity,
          },
        ],
      },
    },
  });

  if (result.productVariantCreate?.errors?.length) {
    throw new Error(
      `Failed to create variant: ${JSON.stringify(
        result.productVariantCreate.errors
      )}`
    );
  }

  if (!result?.productVariantCreate?.productVariant?.id) {
    throw new Error("Variant creation failed: No ID returned");
  }

  return result.productVariantCreate.productVariant.id;
}

export async function setVariantPrice(
  variantId: string,
  price: string
): Promise<string> {
  const result = await executeMutation(SetProductVariantPriceDocument, {
    variables: {
      id: variantId,
      input: [{ channelId: CHANNEL_ID, price }],
    },
  });

  if (result.productVariantChannelListingUpdate?.errors?.length) {
    throw new Error(
      `Failed to set variant price: ${result.productVariantChannelListingUpdate.errors[0].message}`
    );
  }

  if (!result?.productVariantChannelListingUpdate?.variant?.id) {
    throw new Error("Price setting failed: No variant ID returned");
  }

  return result.productVariantChannelListingUpdate.variant.id;
}

export async function publishProduct(productId: string): Promise<string> {
  const result = await executeMutation(PublishProductToChannelDocument, {
    variables: {
      productId,
      channelId: CHANNEL_ID,
    },
  });

  if (result.productChannelListingUpdate?.errors?.length) {
    throw new Error(
      `Failed to publish product: ${result.productChannelListingUpdate.errors[0].message}`
    );
  }

  if (!result?.productChannelListingUpdate?.product?.id) {
    throw new Error("Product publishing failed: No ID returned");
  }

  return result.productChannelListingUpdate.product.id;
}
