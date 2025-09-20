import { useCurrency } from "@/hooks/useCurrency";
import { executeMutation } from "@/lib/graphql-client";

import {
  CheckoutCreateDocument,
  CheckoutShippingAddressUpdateDocument,
  CheckoutBillingAddressUpdateDocument,
  CheckoutDeliveryMethodUpdateDocument,
  CheckoutPaymentCreateDocument,
  CheckoutCompleteDocument,
  CountryCode,
  LanguageCodeEnum,
} from "@/gql/graphql";

// VERY VERY IMPORTANT
const WAREHOUSE_ID =
  "V2FyZWhvdXNlOjVkNmVjYjMzLWJhZGItNGUxMC05MTA2LWNiN2Y0NTRiYjFlYw==";

// Cart item with variant ID
interface CartItem {
  variantId: string;
  quantity: number;
  name: string;
  price: number;
}

interface OrderOptions {
  deliveryDate?: string;
  specialInstructions?: string;
  customerPhone?: string;
  customerName?: string;
  deliveryAddress?: {
    streetAddress1: string;
    city: string;
    postalCode: string;
    country: CountryCode;
  };
}

/**
 * Creates a purchase order for a retailer ordering from a distributor
 *
 * Unlike POS orders, purchase orders:
 * 1. Are not auto-confirmed (distributor must confirm)
 * 2. Are not auto-fulfilled (distributor handles fulfillment)
 * 3. Have a pending status until confirmed
 * 4. Can include delivery date requests and special instructions
 */
export async function createPurchaseOrder(
  items: CartItem[],
  channelSlug = "disney-land-distributors",
  options: OrderOptions = {}
) {
  try {
    console.log(
      `🛒 Starting purchase order creation for ${items.length} items from ${channelSlug}`
    );

    // Default options
    const {
      deliveryDate,
      specialInstructions,
      customerPhone = "retailer@example.com",
      customerName = "Retailer Store",
      deliveryAddress = {
        streetAddress1: "Store Location",
        city: "Nairobi",
        postalCode: "00100",
        country: CountryCode.Ke,
      },
    } = options;

    // Step 1: Create checkout
    const checkoutResult = await executeMutation(CheckoutCreateDocument, {
      variables: {
        channel: channelSlug,
        email: customerPhone.includes("@")
          ? customerPhone
          : `${customerPhone}@retailer.customer`,
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
            firstName: customerName.split(" ")[0] || "Retailer",
            lastName: customerName.split(" ").slice(1).join(" ") || "Store",
            streetAddress1: deliveryAddress.streetAddress1,
            city: deliveryAddress.city,
            postalCode: deliveryAddress.postalCode,
            country: deliveryAddress.country,
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

    // Step 3: Add billing address (same as shipping for simplicity)
    const billingResult = await executeMutation(
      CheckoutBillingAddressUpdateDocument,
      {
        variables: {
          checkoutId,
          billingAddress: {
            firstName: customerName.split(" ")[0] || "Retailer",
            lastName: customerName.split(" ").slice(1).join(" ") || "Store",
            streetAddress1: deliveryAddress.streetAddress1,
            city: deliveryAddress.city,
            postalCode: deliveryAddress.postalCode,
            country: deliveryAddress.country,
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

    // Add this step between Step 3 and Step 5 (replace the commented out Step 4)
    // Step 4: Set delivery method (required for checkout completion)
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

    console.log(
      "::KICHELE IPOO?",
      checkoutResult.checkoutCreate?.checkout?.totalPrice.gross
    );

    // DASHBOARD: ALLOW UNPAID ORDERS
    // // Step 4.5: Add payment method to the checkout
    // const paymentResult = await executeMutation(CheckoutPaymentCreateDocument, {
    //   variables: {
    //     checkoutId,
    //     input: {
    //       gateway: "manual", // Or your payment gateway
    //       amount:
    //         checkoutResult.checkoutCreate?.checkout?.totalPrice.gross?.amount,
    //       token: "manual_payment_token", // A token or identifier for the payment
    //     },
    //   },
    // });

    // if (paymentResult.checkoutPaymentCreate?.errors?.length) {
    //   throw new Error(
    //     `Payment create failed: ${JSON.stringify(
    //       paymentResult.checkoutPaymentCreate.errors
    //     )}`
    //   );
    // }

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

    const orderId = completeResult.checkoutComplete?.order?.id;
    if (!orderId) throw new Error("No order ID returned");
    console.log(`✅ Checkout completed, order created: ${orderId}`);

    // Unlike POS orders, we don't auto-confirm or fulfill
    // The distributor will handle confirmation and fulfillment

    // Add metadata for delivery date and special instructions if provided
    if (deliveryDate || specialInstructions) {
      // This would typically be done with a metadata update mutation
      // For this example, we'll just log it
      console.log(
        `📝 Order metadata: Requested delivery date: ${
          deliveryDate || "Not specified"
        }`
      );
      console.log(
        `📝 Order metadata: Special instructions: ${
          specialInstructions || "None"
        }`
      );
    }

    // Return order details
    return {
      success: true,
      orderId: orderId,
      status: "pending",
      message:
        "Purchase order created successfully and is awaiting distributor confirmation",
    };
  } catch (error) {
    console.error("Purchase order creation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
