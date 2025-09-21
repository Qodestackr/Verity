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
  ChannelCreateInput,
  type ChannelWarehousesQuery,
  type ChannelUpdateWarehousesMutation,
  ChannelUpdateWarehousesDocument,
  ChannelWarehousesDocument,
} from "@/gql/graphql";
import { executeGraphQL, executeMutation } from "@/lib/graphql-client";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import { slugify } from "@/utils/url";

/**
 * Comprehensive interface for Saleor setup options
 */
export interface SaleorSetupOptions {
  organizationId: string;
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
  sessionId?: string; // Optional: to update session with new resources
}

/**
 * Comprehensive result interface with all created resources
 */
export interface SaleorSetupResult {
  success: boolean;
  channelId: string;
  channelSlug: string;
  warehouseId: string;
  warehouseSlug: string;
  dbChannel: any; // Database record for channel
  dbWarehouse: any; // Database record for warehouse
  shippingZone?: ShippingZoneDetailsFragment;
  error?: string;
}

/**
 * Sets up a complete Saleor environment by creating a channel,
 * warehouse, linking them together, and storing in database.
 *
 * @param options Configuration options for the Saleor setup
 * @returns Promise with all created resources and database records
 */
export async function setupSaleorEnvironment(
  options: SaleorSetupOptions
): Promise<SaleorSetupResult> {
  try {
    console.log("Starting Saleor environment setup...");

    // 1. Create the channel in Saleor
    const channelSlug = slugify(options.channelName);
    const channelResult = await createSaleorChannel({
      name: options.channelName,
      slug: channelSlug,
      currencyCode: options.currencyCode || "KES",
      defaultCountry: CountryCode.Ke,
    });

    if (!channelResult?.channel?.id) {
      throw new Error("Channel creation returned no ID");
    }

    const channelId = channelResult.channel.id;
    console.log(`Channel created in Saleor with ID: ${channelId}`);

    // 2. Store the channel in our database
    const dbChannel = await prisma.saleorChannel.create({
      data: {
        organizationId: options.organizationId,
        saleorChannelId: channelId,
        name: options.channelName,
        slug: channelSlug,
        isActive: true,
      },
    });
    console.log(`Channel stored in database with ID: ${dbChannel.id}`);

    // 3. Create the warehouse in Saleor
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
    console.log(`Warehouse created in Saleor with ID: ${warehouseId}`);

    // 4. Store the warehouse in our database
    const dbWarehouse = await prisma.warehouse.create({
      data: {
        name: options.warehouseName,
        // Removed slug field which doesn't exist in the Warehouse model
        saleorWarehouseId: warehouseId,
        organizationId: options.organizationId,
        isPrimary: true,
        city: options.address.city || "",
        address: options.address.streetAddress1 || "",
        isActive: true,
      },
    });
    console.log(`Warehouse stored in database with ID: ${dbWarehouse.id}`);

    // 5. Link the warehouse to the channel in Saleor
    const linkResult = await linkWarehouseToChannel(channelId, [warehouseId]);

    if (linkResult?.errors?.length) {
      throw new Error(
        `Linking warehouse to channel failed: ${linkResult.errors}`
      );
    }
    console.log("Warehouse linked to channel in Saleor");

    // 6. Create Shipping Zone
    let shippingZone: any = undefined;
    if (options.shippingZoneName || options.shippingCountries?.length) {
      shippingZone = await createShippingZone({
        name: options.shippingZoneName || "Default Shipping Zone",
        countries: options.shippingCountries?.map(
          (country) => CountryCode[country as keyof typeof CountryCode]
        ) || [CountryCode.Ke, CountryCode.Tz],
        addWarehouses: [warehouseId],
        addChannels: [channelId],
      });
      console.log("Shipping zone created in Saleor");
    }

    // 7. Update the session with organization ID if sessionId is provided
    if (options.sessionId) {
      const organization = await prisma.organization.findUnique({
        where: { id: options.organizationId },
      });

      if (organization) {
        await prisma.session.update({
          where: { id: options.sessionId },
          data: {
            activeOrganizationId: options.organizationId,
          },
        });
        console.log(
          `Session ${options.sessionId} updated with organization ID`
        );
      }
    }

    // Return the created resources
    return {
      success: true,
      channelId,
      channelSlug,
      warehouseId,
      warehouseSlug,
      dbChannel,
      dbWarehouse,
      shippingZone,
    };
  } catch (error: any) {
    console.error("Saleor setup failed:", error);
    return {
      success: false,
      error: error.message,
      channelId: "",
      channelSlug: "",
      warehouseId: "",
      warehouseSlug: "",
      dbChannel: null,
      dbWarehouse: null,
    };
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

/**
 * Creates a shipping zone
 */
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

/**
 * Simplified function to create both channel and warehouse for an organization
 * and update the session in one operation
 */
export async function createSaleorResourcesForOrganization(
  organizationId: string,
  email: string,
  sessionId?: string
) {
  try {
    const uniqueId = nanoid();
    const channelName = `chann-${uniqueId}`;
    const warehouseName = `wh-${uniqueId}`;

    // Default address for warehouse
    // TODO: Update with real biz location
    const address = {
      streetAddress1: "Default Address",
      city: "Nairobi",
      country: "KE",
      postalCode: "00100",
      companyName: warehouseName,
    };

    const result = await setupSaleorEnvironment({
      organizationId,
      channelName,
      warehouseName,
      email,
      address,
      currencyCode: "KES",
      sessionId,
    });

    if (!result.success) {
      throw new Error(`Failed to create Saleor resources: ${result.error}`);
    }

    return result;
  } catch (error: any) {
    console.error("Error creating Saleor resources:", error);
    throw error;
  }
}

/**
 * Update the session.create.after hook in auth.ts to use this function
 */
export async function setupSaleorResourcesForNewUser(
  userId: string,
  organizationId: string,
  sessionId: string
) {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) {
      throw new Error("User not found or missing email");
    }

    // Create Saleor resources
    const result = await createSaleorResourcesForOrganization(
      organizationId,
      user.email,
      sessionId
    );

    console.log("Saleor resources created successfully:", {
      channelId: result.channelId,
      warehouseId: result.warehouseId,
    });

    return result;
  } catch (error) {
    console.error("Failed to set up Saleor resources for new user:", error);
    throw error;
  }
}

/**
 * Rollback resources in case of failure
 * This can be used to clean up if part of the process fails
 */
export async function rollbackSaleorResources(
  channelId?: string,
  warehouseId?: string,
  dbChannelId?: string,
  dbWarehouseId?: string
) {
  // TODO: rollback logic to delete resources from Saleor and database
  console.log("Rolling back resources:", {
    channelId,
    warehouseId,
    dbChannelId,
    dbWarehouseId,
  });
}

export async function ensureWarehouseLinkedToChannel(
  channelId: string,
  warehouseId: string
): Promise<boolean> {
  try {
    // 1. Fetch current warehouses on channel
    const data = await executeGraphQL(ChannelWarehousesDocument, {
      variables: {
        channelId,
      },
    });

    const existing = data?.channel?.warehouses?.map((w) => w.id) || [];

    // 2. If already linked, just return true
    if (existing.includes(warehouseId)) {
      console.log(
        `Warehouse ${warehouseId} already linked to channel ${channelId}`
      );
      return true;
    }

    // 3. Otherwise, link it using the correct mutation
    console.log(`Linking warehouse ${warehouseId} to channel ${channelId}...`);
    const upd = await executeMutation(ChannelUpdateWarehousesDocument, {
      variables: {
        channelId,
        warehouseIds: [warehouseId],
      },
    });

    // 4. Check for errors
    const errs = upd?.channelUpdate?.errors;
    if (errs && errs.length) {
      console.error("Failed linking warehouse:", errs);
      return false;
    }

    // 5. Verify the warehouse was actually linked
    const wasLinked = upd?.channelUpdate?.channel?.warehouses?.some(
      (w) => w.id === warehouseId
    );
    return !!wasLinked;
  } catch (error) {
    console.error("Error in ensureWarehouseLinkedToChannel:", error);
    return false;
  }
}
