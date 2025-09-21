
import { executeGraphQL, executeMutation } from "@/lib/graphql-client";

import {
  CheckoutCreateDocument,
  CheckoutShippingAddressUpdateDocument,
  CheckoutDeliveryMethodUpdateDocument,
  CheckoutBillingAddressUpdateDocument,
  CheckoutCompleteDocument,
  CountryCode,
  LanguageCodeEnum,
  OrderFulfillInput,
  FulfillOrderDocument,
  ConfirmOrderDocument,
  GetOrderFulfillmentDocument,
} from "@/gql/graphql";

import {
  getOrderLineId,
  waitForOrderToExist,
} from "@/utils/checkout-browser-only";

const WAREHOUSE_ID =
  "V2FyZWhvdXNlOjVhZmVlYWJjLWNjODMtNDUzNy1hY2IyLWRkNDRhNjJjOTc2Mg==";
//"V2FyZWhvdXNlOjNlMTUwNDRiLWIyNGUtNDA1Mi1hNWY1LTVhOTI3MTE5M2I5Nw==";

interface CartItem {
  variantId: string;
  quantity: number;
  name: string;
  price: number;
}

// Checkout Create → Address Updates → Delivery Method → Checkout Complete → Order Confirm → Order Fulfill

export async function createPOSOrder(
  items: CartItem[],
  customerPhone?: string
) {
  try {
    console.log(`🛒 Starting POS order creation for ${items.length} items`);

    // Step 1: Create checkout
    const checkoutResult = await executeMutation(CheckoutCreateDocument, {
      variables: {
        channel: "verity-admin",
        email: customerPhone
          ? `${customerPhone}@pos.customer`
          : "pos-customer@example.com",
        lines: items.map((item) => ({
          quantity: item.quantity,
          variantId: item.variantId,
        })),
      },
    });

    if (checkoutResult.checkoutCreate?.errors?.length) {
      throw new Error(
        `Checkout creation failed: ${JSON.stringify(
          checkoutResult.checkoutCreate.errors
        )}`
      );
    }

    const checkoutId = checkoutResult.checkoutCreate?.checkout?.id;
    if (!checkoutId) throw new Error("No checkout ID returned");
    console.log(`✅ Checkout created: ${checkoutId}`);

    // Step 2: Add shipping address (required)
    const addressResult = await executeMutation(
      CheckoutShippingAddressUpdateDocument,
      {
        variables: {
          checkoutId,
          shippingAddress: {
            firstName: "POS",
            lastName: customerPhone || "Customer",
            streetAddress1: "Store Location",
            city: "Nairobi",
            postalCode: "00100",
            country: CountryCode.Ke,
          },
          languageCode: LanguageCodeEnum.En,
        },
      }
    );

    if (addressResult.checkoutShippingAddressUpdate?.errors?.length) {
      throw new Error(
        `Shipping address update failed: ${JSON.stringify(
          addressResult.checkoutShippingAddressUpdate.errors
        )}`
      );
    }

    // Step 3: Add billing address
    const billingResult = await executeMutation(
      CheckoutBillingAddressUpdateDocument,
      {
        variables: {
          checkoutId,
          billingAddress: {
            firstName: "POS",
            lastName: customerPhone || "Customer",
            streetAddress1: "Store Location",
            city: "Nairobi",
            postalCode: "00100",
            country: CountryCode.Ke,
          },
          languageCode: LanguageCodeEnum.En,
        },
      }
    );

    if (billingResult.checkoutBillingAddressUpdate?.errors?.length) {
      throw new Error(
        `Billing address update failed: ${JSON.stringify(
          billingResult.checkoutBillingAddressUpdate.errors
        )}`
      );
    }

    // Step 4: Set delivery method (to warehouse/pickup point)
    const deliveryResult = await executeMutation(
      CheckoutDeliveryMethodUpdateDocument,
      {
        variables: {
          checkoutId,
          deliveryMethodId: WAREHOUSE_ID,
          languageCode: LanguageCodeEnum.En,
        },
      }
    );

    if (deliveryResult.checkoutDeliveryMethodUpdate?.errors?.length) {
      throw new Error(
        `Delivery method update failed: ${JSON.stringify(
          deliveryResult.checkoutDeliveryMethodUpdate.errors
        )}`
      );
    }

    // Step 5: Complete checkout (creates order)
    const completeResult = await executeMutation(CheckoutCompleteDocument, {
      variables: {
        checkoutId,
      },
    });

    if (completeResult.checkoutComplete?.errors?.length) {
      throw new Error(
        `Checkout completion failed: ${JSON.stringify(
          completeResult.checkoutComplete.errors
        )}`
      );
    }

    if (completeResult.checkoutComplete?.errors?.length) {
      throw new Error(
        `Checkout completion failed: ${JSON.stringify(
          completeResult.checkoutComplete.errors
        )}`
      );
    }

    const orderId = completeResult.checkoutComplete?.order?.id;
    if (!orderId) throw new Error("No order ID returned");
    console.log(`✅ Checkout completed, order created: ${orderId}`);

    // Step 6: Confirm the order
    let confirmAttempt = 0;
    const maxConfirmAttempts = 3;
    let confirmSuccess = false;

    while (confirmAttempt < maxConfirmAttempts && !confirmSuccess) {
      confirmAttempt++;
      try {
        console.log(
          `🔄 Order confirmation attempt ${confirmAttempt}: ${orderId}`
        );

        const confirmResult = await executeMutation(ConfirmOrderDocument, {
          variables: {
            id: orderId,
            languageCode: LanguageCodeEnum.En,
          },
        });

        if (confirmResult.orderConfirm?.errors?.length) {
          throw new Error(
            `Order confirmation failed: ${JSON.stringify(
              confirmResult.orderConfirm.errors
            )}`
          );
        }

        console.log(`✅ Order confirmed in ${confirmAttempt} attempts`);
        confirmSuccess = true;
      } catch (error) {
        console.error(
          `❌ Confirmation attempt ${confirmAttempt} failed:`,
          error
        );
        if (confirmAttempt >= maxConfirmAttempts) throw error;
        await new Promise((r) => setTimeout(r, 1000 * confirmAttempt));
      }
    }

    // Critical: Add a delay after confirmation to ensure order synchronization
    console.log(`⏱️ Waiting for order synchronization...`);
    await new Promise((r) => setTimeout(r, 2000));

    // Step 7: Verify order exists before fulfillment
    console.log(`orderId:: so bro exists? ${orderId}`);
    const orderExists = await waitForOrderToExist(orderId);

    if (!orderExists) {
      throw new Error(
        "Order wasn't found after multiple verification attempts"
      );
    }

    // Step 8: Fulfill the order using our improved fulfillment function
    const fulfillResult = await fulfillOrder(orderId, items);

    if (!fulfillResult.success) {
      throw new Error(
        `Fulfillment failed: ${fulfillResult.errors
          ?.map((e) => `${e.field || "unknown"}: ${e.message}`)
          .join(", ")}`
      );
    }

    // Final verification
    const data = await executeGraphQL(GetOrderFulfillmentDocument, {
      variables: { id: orderId },
      // context: { requestPolicy: "network-only" },
    });

    if (!data?.order) {
      throw new Error(`Order ${orderId} not found in final verification`);
    }

    // Return order details
    return {
      success: true,
      orderId: orderId,
      fulfillmentId: fulfillResult.result?.orderFulfill?.fulfillments?.[0]?.id,
    };
  } catch (error) {
    console.error("POS order creation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Modified fulfillOrder function with more robust ordering and error handling

const fulfillOrder = async (orderId: string, items: CartItem[]) => {
  let attempts = 0;
  const maxAttempts = 5;

  // Important: Wait for order to exist BEFORE creating fulfillment lines
  console.log(`⏱️ Ensuring order exists before fulfillment: ${orderId}`);
  const orderExists = await waitForOrderToExist(orderId);

  if (!orderExists) {
    throw new Error(
      `Order ${orderId} does not exist after multiple verification attempts`
    );
  }

  // Only proceed with fulfillment after order is verified to exist
  console.log(`📦 Preparing fulfillment for order: ${orderId}`);

  // Generate fulfillment lines AFTER order confirmation
  let fulfillmentLines;
  try {
    // This is now a separate try/catch to isolate line retrieval errors
    fulfillmentLines = await Promise.all(
      items.map(async (item) => {
        const orderLineId = await getOrderLineId(orderId, item.variantId);
        console.log(
          `📊 Mapped variant ${item.variantId} to order line ${orderLineId}`
        );
        return {
          orderLineId,
          stocks: [
            {
              quantity: item.quantity,
              warehouse: WAREHOUSE_ID,
            },
          ],
        };
      })
    );
    console.log(
      `✅ Successfully prepared ${fulfillmentLines.length} lines for fulfillment`
    );
  } catch (error) {
    console.error("❌ Failed to prepare fulfillment lines:", error);
    throw new Error(`Failed to prepare fulfillment: ${(error as any).message}`);
  }

  // Now proceed with fulfillment attempts
  while (attempts < maxAttempts) {
    attempts++;
    try {
      console.log(`💥 Fulfillment attempt ${attempts} for order ${orderId}`);

      // Double-check order existence on each attempt
      const orderData = await executeGraphQL(GetOrderFulfillmentDocument, {
        variables: { id: orderId },
      });

      if (!orderData?.order) {
        console.log(`👻 Ghost order detected (attempt ${attempts})`);
        await new Promise((r) => setTimeout(r, 1000 * attempts));
        continue;
      }

      console.log(`📦 Order verified, proceeding with fulfillment`);
      console.log(
        `📊 Using ${fulfillmentLines.length} prepared lines for fulfillment`
      );

      // Execute fulfillment with prepared lines
      const result = await executeMutation(FulfillOrderDocument, {
        variables: {
          order: orderId,
          input: {
            lines: fulfillmentLines,
            notifyCustomer: false,
            allowStockToBeExceeded: false,
          },
        },
      });

      // Check for errors
      if (result.orderFulfill?.errors?.length) {
        const errorDetails = result.orderFulfill.errors
          .map((e) => `${e.field || "unknown"}: ${e.message}`)
          .join(" | ");

        console.log(`🤬 Fulfillment errors: ${errorDetails}`);

        // If we get specific errors that indicate we should retry, do so
        if (
          errorDetails.includes("does not exist") ||
          errorDetails.includes("not found") ||
          errorDetails.includes("not available")
        ) {
          throw new Error(errorDetails);
        }

        // Otherwise, this is a terminal error - propagate it
        return {
          success: false,
          errors: result.orderFulfill.errors,
        };
      }

      // Success!
      console.log(`✅ Fulfillment successful on attempt ${attempts}`);
      return {
        success: true,
        result,
      };
    } catch (error) {
      console.log(`💢 Attempt ${attempts} failed: ${(error as any)?.message}`);

      // Exponential backoff with jitter
      const delay = Math.min(
        2000 * Math.pow(1.5, attempts - 1) * (0.9 + Math.random() * 0.2),
        15000
      );
      console.log(
        `⏱️ Waiting ${Math.round(delay / 1000)}s before next attempt`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error(`Fulfillment failed after ${maxAttempts} attempts`);
};
