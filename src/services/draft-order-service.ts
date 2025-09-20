import { useCurrency } from "@/hooks/useCurrency";
import { executeGraphQL, executeMutation } from "@/lib/graphql-client";
import {
  DraftOrderCreateDocument,
  DraftOrderUpdateDocument,
  DraftOrderLinesCreateDocument,
  DraftOrderLineDeleteDocument,
  DraftOrderDetailsDocument,
  DraftOrdersDocument,
  OrderCreateFromDraftOrderDocument,
  DraftOrderDeleteDocument,
} from "@/gql/graphql";
import {
  DraftOrderInput,
  DraftOrderItem,
  DraftOrderResult,
} from "@/types/order/draft-order";

/**
 * Creates a new draft order in Saleor
 */
export async function createDraftOrder(
  input: DraftOrderInput
): Promise<DraftOrderResult> {
  try {
    console.log("Creating draft order:", input);

    const lines = input.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const result = await executeMutation(DraftOrderCreateDocument, {
      variables: {
        input: {
          lines,
          channelId:
            process.env.NEXT_PUBLIC_SALEOR_CHANNEL_ID || "Q2hhbm5lbDoz",
          userEmail: input.customerEmail || undefined,
          note: input.note || undefined,
        },
      },
    });

    if (result.draftOrderCreate?.errors?.length) {
      throw new Error(
        `Draft order creation failed: ${JSON.stringify(
          result.draftOrderCreate.errors
        )}`
      );
    }

    const draftOrderId = result.draftOrderCreate?.order?.id;
    const draftOrderToken = result.draftOrderCreate?.order?.token;

    if (!draftOrderId) {
      throw new Error("No draft order ID returned");
    }

    if (input.customerPhone || input.customerName) {
      // TODO: update the draft order with customer metadata
      console.log(
        `//TODO store customer metadata: ${input.customerName}, ${input.customerPhone}`
      );
    }

    return {
      id: draftOrderId,
      token: draftOrderToken || "",
      created: true,
      errors: [],
    };
  } catch (error) {
    console.error("Draft order creation error:", error);
    return {
      id: "",
      token: "",
      created: false,
      errors: [
        { message: error instanceof Error ? error.message : "Unknown error" },
      ],
    };
  }
}

/**
 * Adds items to an existing draft order
 */
export async function addItemsToDraftOrder(
  draftOrderId: string,
  items: DraftOrderItem[]
): Promise<{ success: boolean; errors: any[] }> {
  try {
    console.log(`Adding items to draft order ${draftOrderId}:`, items);

    // Format lines for Saleor
    const lines = items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    // Add lines to the draft order
    const result = await executeMutation(DraftOrderLinesCreateDocument, {
      variables: {
        id: draftOrderId,
        lines,
      },
    });

    if (result.orderLinesCreate?.errors?.length) {
      throw new Error(
        `Failed to add items: ${JSON.stringify(result.orderLinesCreate.errors)}`
      );
    }

    return {
      success: true,
      errors: [],
    };
  } catch (error) {
    console.error("Error adding items to draft order:", error);
    return {
      success: false,
      errors: [
        { message: error instanceof Error ? error.message : "Unknown error" },
      ],
    };
  }
}

/**
 * Removes an item from a draft order
 */
export async function removeItemFromDraftOrder(
  draftOrderId: string,
  lineId: string
): Promise<{ success: boolean; errors: any[] }> {
  try {
    console.log(`Removing line ${lineId} from draft order ${draftOrderId}`);

    const result = await executeMutation(DraftOrderLineDeleteDocument, {
      variables: {
        id: draftOrderId,
        lineId,
      },
    });

    if (result.orderLineDelete?.errors?.length) {
      throw new Error(
        `Failed to remove item: ${JSON.stringify(
          result.orderLineDelete.errors
        )}`
      );
    }

    return {
      success: true,
      errors: [],
    };
  } catch (error) {
    console.error("Error removing item from draft order:", error);
    return {
      success: false,
      errors: [
        { message: error instanceof Error ? error.message : "Unknown error" },
      ],
    };
  }
}

/**
 * Updates a draft order with new info
 */
export async function updateDraftOrder(
  draftOrderId: string,
  input: Partial<DraftOrderInput>
): Promise<{ success: boolean; errors: any[] }> {
  try {
    console.log(`Updating draft order ${draftOrderId}:`, input);

    // Prepare update input
    const updateInput: any = {};

    if (input.customerEmail) updateInput.userEmail = input.customerEmail;
    if (input.note) updateInput.note = input.note;

    const result = await executeMutation(DraftOrderUpdateDocument, {
      variables: {
        id: draftOrderId,
        input: updateInput,
      },
    });

    if (result.draftOrderUpdate?.errors?.length) {
      throw new Error(
        `Failed to update draft order: ${JSON.stringify(
          result.draftOrderUpdate.errors
        )}`
      );
    }

    return {
      success: true,
      errors: [],
    };
  } catch (error) {
    console.error("Error updating draft order:", error);
    return {
      success: false,
      errors: [
        { message: error instanceof Error ? error.message : "Unknown error" },
      ],
    };
  }
}

/**
 * Completes a draft order and converts it to a regular order
 */
export async function completeDraftOrder(
  draftOrderId: string
): Promise<{ success: boolean; orderId?: string; errors: any[] }> {
  try {
    console.log(`Completing draft order ${draftOrderId}`);

    // 1. create an order from the draft order
    const createResult = await executeMutation(
      OrderCreateFromDraftOrderDocument,
      {
        variables: {
          id: draftOrderId,
        },
      }
    );

    if (createResult.draftOrderComplete?.errors?.length) {
      throw new Error(
        `Failed to complete draft order: ${JSON.stringify(
          createResult.draftOrderComplete.errors
        )}`
      );
    }

    const orderId = createResult.draftOrderComplete?.order?.id;
    if (!orderId) {
      throw new Error("No order ID returned after completing draft order");
    }

    return {
      success: true,
      orderId,
      errors: [],
    };
  } catch (error) {
    console.error("Error completing draft order:", error);
    return {
      success: false,
      errors: [
        { message: error instanceof Error ? error.message : "Unknown error" },
      ],
    };
  }
}

/**
 * Fetches a single draft order by ID
 */
export async function getDraftOrder(id: string) {
  try {
    const result = await executeGraphQL(DraftOrderDetailsDocument, {
      variables: { id },
    });

    return {
      success: true,
      draftOrder: result.order,
      errors: [],
    };
  } catch (error) {
    console.error("Error fetching draft order:", error);
    return {
      success: false,
      draftOrder: null,
      errors: [
        { message: error instanceof Error ? error.message : "Unknown error" },
      ],
    };
  }
}

/**
 * Fetches all draft orders
 */
export async function getDraftOrders(first = 20) {
  try {
    const result = await executeGraphQL(DraftOrdersDocument, {
      variables: { first },
    });

    return {
      success: true,
      draftOrders: result.draftOrders?.edges?.map((edge) => edge.node) || [],
      errors: [],
    };
  } catch (error) {
    console.error("Error fetching draft orders:", error);
    return {
      success: false,
      draftOrders: [],
      errors: [
        { message: error instanceof Error ? error.message : "Unknown error" },
      ],
    };
  }
}

/**
 * Deletes a draft order
 */
export async function deleteDraftOrder(id: string) {
  try {
    const result = await executeMutation(DraftOrderDeleteDocument, {
      variables: { id },
    });

    if (result.draftOrderDelete?.errors?.length) {
      throw new Error(
        `Failed to delete draft order: ${JSON.stringify(
          result.draftOrderDelete.errors
        )}`
      );
    }

    return {
      success: true,
      errors: [],
    };
  } catch (error) {
    console.error("Error deleting draft order:", error);
    return {
      success: false,
      errors: [
        { message: error instanceof Error ? error.message : "Unknown error" },
      ],
    };
  }
}
