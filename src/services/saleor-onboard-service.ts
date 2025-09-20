import {
  CreateChannelDocument,
  CreateChannelMutation,
  CreateChannelMutationVariables,
  CreateWarehouseDocument,
  CreateWarehouseMutation,
  CreateWarehouseMutationVariables,
  AddWarehousesToChannelDocument,
  AddWarehousesToChannelMutation,
  AddWarehousesToChannelMutationVariables,
  CountryCode,
  AddressInput,
  ShippingZoneCreateMutationVariables,
  ShippingZoneCreateDocument,
  ShippingZoneCreateInput,
  ShippingZoneDetailsFragment,
} from "@/gql/graphql";
import { useCurrency } from "@/hooks/useCurrency";
import { slugify } from "@/utils/url";
import { executeMutation } from "@/lib/graphql-client";

interface SaleorSetupOptions {
  organizationId?: string;
  channelName: string;
  warehouseName: string;
  email: string;
  address: {
    streetAddress1: string;
    city: string;
    country: string;
    postalCode: string;
    companyName?: string;
  };
  currencyCode?: string;
  shippingZoneName?: string;
  shippingCountries?: string[];
}

export interface SaleorSetupResult {
  channelId: string;
  channelSlug: string;
  warehouseId: string;
  warehouseSlug: string;
  shippingZone?: any /**ShippingZoneDetailsFragment */;
}

/**
 * Sets up a new Saleor environment by creating a channel,
 * warehouse, and linking them together in one atomic operation.
 *
 * @param options Configuration options for the Saleor setup
 * @returns Promise with the created channel and warehouse IDs and slugs
 */
export async function setupSaleorEnvironment(
  options: SaleorSetupOptions
): Promise<SaleorSetupResult> {
  try {
    // 1. Create the channel first
    const channelSlug = slugify(options.channelName);
    const channelResult = await createSaleorChannel({
      name: options.channelName,
      slug: channelSlug,
      currencyCode: options.currencyCode || "KES",
      defaultCountry: CountryCode.Ke,
    });

    const channelId = channelResult.channel?.id;

    // 2. Create the warehouse
    const warehouseSlug = slugify(options.warehouseName);
    const warehouseResult = await createSaleorWarehouse({
      name: options.warehouseName,
      slug: warehouseSlug,
      email: options.email,
      address: options.address as AddressInput,
    });

    if (warehouseResult?.errors?.length) {
      throw new Error(
        `Warehouse creation failed: ${warehouseResult.errors[0].message}`
      );
    }

    const warehouseId = warehouseResult?.warehouse?.id;
    if (!warehouseId) {
      throw new Error("Warehouse creation returned no ID");
    }

    // 3. Link the warehouse to the channel
    const linkResult = await linkWarehouseToChannel(channelId, [warehouseId]);

    if (linkResult?.errors?.length) {
      throw new Error(
        `Linking warehouse to channel failed: ${linkResult.errors[0].message}`
      );
    }

    // 4. Create Shipping Zone (if needed)
    const shippingZone = await createShippingZone({
      name: "",
      countries: [CountryCode.Ke, CountryCode.Tz],
      addWarehouses: [warehouseId],
      addChannels: [channelId],
    });

    // Return the created resources
    return {
      channelId,
      channelSlug,
      warehouseId,
      warehouseSlug,
      shippingZone,
    };
  } catch (error) {
    console.error("Saleor setup failed:", error);
    throw error;
  }
}

/**
 * Creates a new Saleor channel
 */
async function createSaleorChannel(
  input: CreateChannelMutationVariables["input"]
) {
  const result = await executeMutation<
    CreateChannelMutation,
    CreateChannelMutationVariables
  >(CreateChannelDocument, { variables: { input } });

  if (!result.channelCreate?.channel) {
    const errors = result.channelCreate?.errors;
    if (errors && errors.length > 0) {
      throw new Error(
        (errors[0] as { message: string }).message || "Channel creation failed"
      );
    }
  }

  if (!result.channelCreate?.channel) {
    throw new Error("Channel creation returned no data");
  }

  return result.channelCreate;
}

/**
 * Creates a new Saleor warehouse
 */
async function createSaleorWarehouse(
  input: CreateWarehouseMutationVariables["input"]
) {
  const result = await executeMutation<
    CreateWarehouseMutation,
    CreateWarehouseMutationVariables
  >(CreateWarehouseDocument, { variables: { input } });

  if (!result.createWarehouse?.warehouse) {
    throw new Error(
      result.createWarehouse?.errors?.[0]?.message ||
        "Warehouse creation failed"
    );
  }

  return result.createWarehouse;
}

/**
 * Links warehouses to a channel
 */
async function linkWarehouseToChannel(
  channelId: string,
  warehouseIds: string[]
) {
  const result = await executeMutation<
    AddWarehousesToChannelMutation,
    AddWarehousesToChannelMutationVariables
  >(AddWarehousesToChannelDocument, {
    variables: {
      channelId,
      warehouseIds,
    },
  });
  return result.channelUpdate;
}

async function createShippingZone(
  input: ShippingZoneCreateMutationVariables["input"]
) {
  const result = await executeMutation(ShippingZoneCreateDocument, {
    variables: { input },
  });

  if (!result.shippingZoneCreate?.shippingZone) {
    const error = result.shippingZoneCreate?.errors?.[0] || undefined;
    throw new Error((error as any)?.message || "Shipping zone creation failed");
  }

  return result.shippingZoneCreate.shippingZone;
}

// TODO: catch & rollback resources: await rollbackResources(channel?.id, warehouse?.id);
