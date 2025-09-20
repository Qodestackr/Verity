import {
  CreateProductAttributesDocument,
  CreateProductTypeDocument,
  CreateProductDocument,
  CreateProductVariantDocument,
  PublishProductToChannelDocument,
  AttributeTypeEnum,
  AttributeInputTypeEnum,
  ProductTypeKindEnum,
  AttributeEntityTypeEnum,
} from "@/gql/graphql";
import { useCurrency } from "@/hooks/useCurrency";
import { gqlclient } from "@/lib/graphql";
import { executeGraphQL, executeMutation } from "@/lib/graphql-client";
import { slugify } from "@/utils/url";

const WAREHOUSE_ID =
  process.env.NEXT_PUBLIC_WAREHOUSE_ID ||
  "V2FyZWhvdXNlOjVhZmVlYWJjLWNjODMtNDUzNy1hY2IyLWRkNDRhNjJjOTc2Mg==";
const CHANNEL_ID = process.env.NEXT_PUBLIC_SALEOR_CHANNEL_ID || "Q2hhbm5lbDoz";

export async function createProductAttributes() {
  try {
    const attributes = [
      {
        name: "Volume",
        slug: "volume",
        entityType: AttributeEntityTypeEnum.Product,
        inputType: AttributeInputTypeEnum.Dropdown,
        type: AttributeTypeEnum.ProductType,
        values: ["750ml", "1L", "1.75L", "500ml", "375ml"].map((val) => ({
          name: val,
        })),
      },
      {
        name: "Alcohol Content",
        slug: "alcohol-content",
        entityType: AttributeEntityTypeEnum.Product,
        inputType: AttributeInputTypeEnum.Dropdown,
        type: AttributeTypeEnum.ProductType,
        values: ["40%", "43%", "45%", "37.5%", "35%"].map((val) => ({
          name: val,
        })),
      },
    ];

    const result = await executeMutation(CreateProductAttributesDocument, {
      variables: {
        attributes,
      },
    });

    console.log("Attribute creation result:", result);

    if (result.attributeBulkCreate?.errors?.length) {
      console.warn(
        `Attribute creation had errors: ${JSON.stringify(
          result.attributeBulkCreate.errors
        )}`
      );
    }
    return {
      volumeAttr: "QXR0cmlidXRlOjQ5",
      alcoholContentAttr: "QXR0cmlidXRlOjUw",
    };
  } catch (error) {
    console.error("Error creating attributes:", error);
    // Still return the hardcoded IDs so the flow can continue
    return {
      volumeAttr: "QXR0cmlidXRlOjQ5",
      alcoholContentAttr: "QXR0cmlidXRlOjUw",
    };
  }
}
export async function createOrGetProductType(
  category: string,
  attributeIds: { volumeAttr: string; alcoholContentAttr: string }
) {
  const productTypeSlug = slugify(category);

  try {
    const GET_PRODUCT_TYPE_BY_SLUG = `
      query GetProductTypeBySlug($slug: String!) {
        productType(slug: $slug) {
          id
          name
          slug
        }
      }
    `;

    const existingProductType = await gqlclient
      .query(GET_PRODUCT_TYPE_BY_SLUG, {
        slug: productTypeSlug,
      })
      .toPromise();

    if (existingProductType.data?.productType?.id) {
      return existingProductType.data.productType.id;
    }
  } catch (error) {
    console.log("Error checking for existing product type:", error);
  }
  const result = await executeMutation(CreateProductTypeDocument, {
    variables: {
      name: category,
      slug: productTypeSlug,
      productAttributes: [attributeIds.alcoholContentAttr],
      variantAttributes: [attributeIds.volumeAttr],
      kind: ProductTypeKindEnum.Normal,
      isShippingRequired: true,
    },
  });

  if (result.productTypeCreate?.errors?.length) {
    throw new Error(
      `Failed to create product type: ${result.productTypeCreate.errors[0]}`
    );
  }

  return result?.productTypeCreate?.productType?.id;
}

export async function createProduct(
  name: string,
  productTypeId: string,
  categoryId: string,
  attributeId: string,
  attributeValue: string
) {
  const result = await executeMutation(CreateProductDocument, {
    variables: {
      input: {
        name,
        slug: slugify(name),
        productType: productTypeId,
        category: categoryId,
        attributes: [
          {
            id: attributeId,
            values: [attributeValue],
          },
        ],
      },
    },
  });

  if (result.productCreate?.errors?.length) {
    throw new Error(
      `Failed to create product: ${result.productCreate.errors[0]}`
    );
  }

  return result?.productCreate?.product?.id;
}

export async function createProductVariant(
  productId: string,
  name: string,
  sku: string,
  attributeId: string,
  attributeValue: string,
  quantity: number
) {
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
      `Failed to create variant: ${result.productVariantCreate.errors[0]}`
    );
  }

  return result.productVariantCreate?.productVariant?.id;
}

export async function setVariantPrice(variantId: string, price: string) {
  const SET_VARIANT_PRICE = `
    mutation SetVariantPrice($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
      productVariantChannelListingUpdate(id: $id, input: $input) {
        variant { id }
        errors { message }
      }
    }
  `;

  const result = await gqlclient
    .mutation(SET_VARIANT_PRICE, {
      id: variantId,
      input: [{ channelId: CHANNEL_ID, price }],
    })
    .toPromise();

  if (
    result.error ||
    result.data?.productVariantChannelListingUpdate?.errors?.length
  ) {
    throw new Error(
      `Failed to set variant price: ${
        result.error?.message ||
        result.data?.productVariantChannelListingUpdate?.errors[0].message
      }`
    );
  }

  return result.data.productVariantChannelListingUpdate.variant.id;
}

export async function publishProduct(productId: string) {
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

  return result.productChannelListingUpdate?.product;
}

export async function createCompleteProduct(productData: {
  name: string;
  category: string;
  price: string;
  stock: number;
  description?: string;
  alcoholContent?: string;
  volume?: string;
}) {
  try {
    // 1. Create attributes (or get existing ones)
    const attributeIds = await createProductAttributes();

    // 2. Create product type based on category
    const productTypeId = await createOrGetProductType(
      productData.category,
      attributeIds
    );

    // 3. Create base product
    const productId = await createProduct(
      productData.name,
      productTypeId,
      "Q2F0ZWdvcnk6MQ==", // Default category ID - you should get this dynamically
      attributeIds.alcoholContentAttr,
      productData.alcoholContent || "40%"
    );

    // 4. Create variant
    const sku = `${slugify(productData.name)}-${Date.now()
      .toString()
      .slice(-6)}`;
    const variantId = await createProductVariant(
      productId!,
      productData.volume || "750ml",
      sku,
      attributeIds.volumeAttr,
      productData.volume || "750ml",
      productData.stock
    );

    // 5. Set variant price
    await setVariantPrice(variantId!, productData.price);

    // 6. Publish product
    await publishProduct(productId!);

    return {
      success: true,
      productId,
      variantId,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: (error as any).message,
    };
  }
}
