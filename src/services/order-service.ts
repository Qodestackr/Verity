
import { executeGraphQL, executeMutation } from "@/lib/graphql-client";
import {
  CheckoutCreateDocument,
  CheckoutShippingAddressUpdateDocument,
  CheckoutDeliveryMethodUpdateDocument,
  CheckoutBillingAddressUpdateDocument,
  CheckoutCompleteDocument,
  CountryCode,
  LanguageCodeEnum,
  FulfillOrderDocument,
  ConfirmOrderDocument,
  GetOrderFulfillmentDocument,
  OrderStatus,
  OrderFulfillInput,
} from "@/gql/graphql";

// Types
export interface CartItem {
  variantId: string;
  quantity: number;
  name: string;
  price: number;
}

export interface Customer {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: Address;
}

export interface Business {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  taxId?: string;
}

export interface Address {
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  postalCode: string;
  country: CountryCode;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  fulfillmentId?: string;
  status?: OrderStatus;
  error?: string;
}

export interface OrderFulfillmentResult {
  success: boolean;
  result?: any;
  errors?: Array<{ field?: string; message: string }>;
}

export class OrderService {
  private WAREHOUSE_ID: string;
  private POS_CHANNEL: string;
  private B2B_CHANNEL: string;
  private ONLINE_CHANNEL: string;

  constructor(
    warehouseId: string = "V2FyZWhvdXNlOjNlMTUwNDRiLWIyNGUtNDA1Mi1hNWY1LTVhOTI3MTE5M2I5Nw==",
    posChannel: string = "century-consults",
    b2bChannel: string = "b2b-channel",
    onlineChannel: string = "online-shop"
  ) {
    this.WAREHOUSE_ID = warehouseId;
    this.POS_CHANNEL = posChannel;
    this.B2B_CHANNEL = b2bChannel;
    this.ONLINE_CHANNEL = onlineChannel;
  }

  /**
   * Creates a POS order for immediate fulfillment
   */
  async createPOSOrder(
    items: CartItem[],
    customer?: Customer
  ): Promise<OrderResult> {
    try {
      console.log(`🛒 Starting POS order creation for ${items.length} items`);

      // Step 1: Create checkout with POS channel
      const checkoutId = await this.createCheckout(
        items,
        this.POS_CHANNEL,
        customer?.email ||
          (customer?.phone
            ? `${customer.phone}@pos.customer`
            : "pos-customer@example.com")
      );

      // Step 2: Add addresses
      await this.addAddressesToCheckout(
        checkoutId,
        this.getPOSAddress(customer)
      );

      // Step 3: Set delivery method
      await this.setDeliveryMethod(checkoutId);

      // Step 4: Complete checkout (creates order)
      const orderId = await this.completeCheckout(checkoutId);

      // Step 5: Confirm and fulfill order
      await this.confirmOrder(orderId);

      // Verify order exists before fulfillment
      const orderExists = await this.waitForOrderToExist(orderId);
      if (!orderExists) {
        throw new Error(
          "Order wasn't found after multiple verification attempts"
        );
      }

      // Step 6: Fulfill the order immediately (POS is immediate fulfillment)
      const fulfillResult = await this.fulfillOrder(orderId, items);

      if (!fulfillResult.success) {
        throw new Error(
          `Fulfillment failed: ${fulfillResult.errors
            ?.map((e) => `${e.field || "unknown"}: ${e.message}`)
            .join(", ")}`
        );
      }

      return {
        success: true,
        orderId: orderId,
        fulfillmentId:
          fulfillResult.result?.orderFulfill?.fulfillments?.[0]?.id,
        status: OrderStatus.Fulfilled,
      };
    } catch (error) {
      console.error("POS order creation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Creates a B2B order which will be scheduled for fulfillment
   */
  async createB2BOrder(
    items: CartItem[],
    business: Business,
    scheduledDate?: Date
  ): Promise<OrderResult> {
    try {
      console.log(`🛒 Starting B2B order creation for ${business.name}`);

      // Step 1: Create checkout with B2B channel
      const checkoutId = await this.createCheckout(
        items,
        this.B2B_CHANNEL,
        business.email
      );

      // Step 2: Add addresses
      await this.addAddressesToCheckout(checkoutId, business.address);

      // Step 3: Set delivery method - for B2B we assume warehouse delivery
      await this.setDeliveryMethod(checkoutId);

      // Step 4: Complete checkout (creates order)
      const orderId = await this.completeCheckout(checkoutId);

      // Step 5: Confirm order but don't fulfill yet
      await this.confirmOrder(orderId);

      // For B2B orders, we don't fulfill immediately
      // Instead we would schedule the fulfillment for later
      if (scheduledDate) {
        // Store scheduled date in your custom DB
        await this.scheduleFulfillment(orderId, scheduledDate);
      }

      return {
        success: true,
        orderId: orderId,
        status: OrderStatus.Unfulfilled,
      };
    } catch (error) {
      console.error("B2B order creation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Creates an online shop order
   */
  async createOnlineOrder(
    items: CartItem[],
    customer: Customer
  ): Promise<OrderResult> {
    try {
      console.log(
        `🛒 Starting online order creation for ${customer.firstName} ${customer.lastName}`
      );

      // Step 1: Create checkout with online channel
      const checkoutId = await this.createCheckout(
        items,
        this.ONLINE_CHANNEL,
        customer.email || `${customer.phone}@online.customer`
      );

      // Step 2: Add addresses
      if (!customer.address) {
        throw new Error("Customer address is required for online orders");
      }
      await this.addAddressesToCheckout(checkoutId, customer.address);

      // Step 3: Set delivery method
      await this.setDeliveryMethod(checkoutId);

      // Step 4: Complete checkout (creates order)
      const orderId = await this.completeCheckout(checkoutId);

      // Step 5: Confirm order but don't fulfill yet
      await this.confirmOrder(orderId);

      // For online orders, we would typically assign to a driver later

      return {
        success: true,
        orderId: orderId,
        status: OrderStatus.PartiallyFulfilled, //.Confirmed,
      };
    } catch (error) {
      console.error("Online order creation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Assigns an order to a driver for delivery
   */
  async assignOrderToDriver(
    orderId: string,
    driverId: string
  ): Promise<OrderResult> {
    try {
      // Here you would:
      // 1. Update your custom driver assignments table
      // 2. Potentially update order metadata in Saleor
      // 3. Send notifications

      // Simplified version
      console.log(`Assigning order ${orderId} to driver ${driverId}`);

      // Store in your custom DB the assignment
      // await prisma.driverAssignment.create({ ... })

      return {
        success: true,
        orderId: orderId,
        status: OrderStatus.Unfulfilled,
      };
    } catch (error) {
      console.error("Order driver assignment failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Fulfills a previously created order
   */
  async fulfillExistingOrder(orderId: string): Promise<OrderResult> {
    try {
      // First verify order exists and is in correct state
      const orderData = await executeGraphQL(GetOrderFulfillmentDocument, {
        variables: { id: orderId },
      });

      if (!orderData?.order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Get order lines from Saleor
      const orderLines = orderData.order.lines.map((line) => ({
        variantId: line.variant.id,
        quantity: line.quantity,
        name: line.productName,
        price: parseFloat(line.unitPrice.gross.amount),
      }));

      // Fulfill the order
      const fulfillResult = await this.fulfillOrder(orderId, orderLines);

      if (!fulfillResult.success) {
        throw new Error(
          `Fulfillment failed: ${fulfillResult.errors
            ?.map((e) => `${e.field || "unknown"}: ${e.message}`)
            .join(", ")}`
        );
      }

      return {
        success: true,
        orderId: orderId,
        fulfillmentId:
          fulfillResult.result?.orderFulfill?.fulfillments?.[0]?.id,
        status: OrderStatus.Fulfilled,
      };
    } catch (error) {
      console.error("Order fulfillment failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // PRIVATE HELPER METHODS

  private async createCheckout(
    items: CartItem[],
    channel: string,
    email: string
  ): Promise<string> {
    const checkoutResult = await executeMutation(CheckoutCreateDocument, {
      variables: {
        channel: channel,
        email: email,
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

    return checkoutId;
  }

  private async addAddressesToCheckout(
    checkoutId: string,
    address: Address
  ): Promise<void> {
    // Add shipping address
    const addressResult = await executeMutation(
      CheckoutShippingAddressUpdateDocument,
      {
        variables: {
          checkoutId,
          shippingAddress: {
            firstName: "Customer",
            lastName: "Name",
            streetAddress1: address.streetAddress1,
            streetAddress2: address.streetAddress2,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
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

    // Add billing address
    const billingResult = await executeMutation(
      CheckoutBillingAddressUpdateDocument,
      {
        variables: {
          checkoutId,
          billingAddress: {
            firstName: "Customer",
            lastName: "Name",
            streetAddress1: address.streetAddress1,
            streetAddress2: address.streetAddress2,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
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
  }

  private async setDeliveryMethod(checkoutId: string): Promise<void> {
    const deliveryResult = await executeMutation(
      CheckoutDeliveryMethodUpdateDocument,
      {
        variables: {
          checkoutId,
          deliveryMethodId: this.WAREHOUSE_ID,
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
  }

  private async completeCheckout(checkoutId: string): Promise<string> {
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

    return orderId;
  }

  private async confirmOrder(orderId: string): Promise<void> {
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

        // Critical: Add a delay after confirmation to ensure order synchronization
        console.log(`⏱️ Waiting for order synchronization...`);
        await new Promise((r) => setTimeout(r, 2000));
      } catch (error) {
        console.error(
          `❌ Confirmation attempt ${confirmAttempt} failed:`,
          error
        );
        if (confirmAttempt >= maxConfirmAttempts) throw error;
        await new Promise((r) => setTimeout(r, 1000 * confirmAttempt));
      }
    }
  }

  private async waitForOrderToExist(orderId: string): Promise<boolean> {
    // This would be implemented using your existing waitForOrderToExist function
    // Simulating for now
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const orderData = await executeGraphQL(GetOrderFulfillmentDocument, {
          variables: { id: orderId },
        });

        if (orderData?.order) {
          return true;
        }

        console.log(`Order not found, attempt ${attempts}/${maxAttempts}`);
        await new Promise((r) => setTimeout(r, 1000 * attempts));
      } catch (error) {
        console.error(`Error checking order existence: ${error}`);
      }
    }

    return false;
  }

  private async fulfillOrder(
    orderId: string,
    items: CartItem[]
  ): Promise<OrderFulfillmentResult> {
    let attempts = 0;
    const maxAttempts = 5;

    // Important: Wait for order to exist BEFORE creating fulfillment lines
    console.log(`⏱️ Ensuring order exists before fulfillment: ${orderId}`);
    const orderExists = await this.waitForOrderToExist(orderId);

    if (!orderExists) {
      throw new Error(
        `Order ${orderId} does not exist after multiple verification attempts`
      );
    }

    console.log(`📦 Preparing fulfillment for order: ${orderId}`);

    // Generate fulfillment lines AFTER order confirmation
    let fulfillmentLines;
    try {
      // This would need to be adjusted to use a method to get order line IDs
      // For example, implement this in your service or use the existing function
      fulfillmentLines = await Promise.all(
        items.map(async (item) => {
          const orderLineId = await this.getOrderLineId(
            orderId,
            item.variantId
          );
          console.log(
            `📊 Mapped variant ${item.variantId} to order line ${orderLineId}`
          );
          return {
            orderLineId,
            stocks: [
              {
                quantity: item.quantity,
                warehouse: this.WAREHOUSE_ID,
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
      throw new Error(
        `Failed to prepare fulfillment: ${(error as any).message}`
      );
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
            } as OrderFulfillInput,
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
        console.log(
          `💢 Attempt ${attempts} failed: ${(error as any)?.message}`
        );

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
  }

  private async getOrderLineId(
    orderId: string,
    variantId: string
  ): Promise<string> {
    // This would be implemented using your existing getOrderLineId function
    // For demonstration, just returning a mock ID
    // In reality, this would query Saleor to get the actual line ID
    return `OrderLine:${orderId}-${variantId}`;
  }

  private async scheduleFulfillment(
    orderId: string,
    scheduledDate: Date
  ): Promise<void> {
    // This would schedule the fulfillment in your custom database
    console.log(
      `Scheduling fulfillment for order ${orderId} on ${scheduledDate.toISOString()}`
    );
    // In a real implementation:
    // await prisma.scheduledFulfillment.create({
    //   data: {
    //     orderId,
    //     scheduledDate,
    //     status: 'SCHEDULED'
    //   }
    // });
  }

  private getPOSAddress(customer?: Customer): Address {
    if (customer?.address) {
      return customer.address;
    }

    // Default POS address
    return {
      streetAddress1: "Store Location",
      city: "Nairobi",
      postalCode: "00100",
      country: CountryCode.Ke,
    };
  }
}

// Initialize the service
// const orderService = new OrderService();

// // Create a POS order
// const result = await orderService.createPOSOrder(cartItems, customer);
// if (result.success) {
//   // Show receipt with orderId
// }

// // Create a B2B order with scheduled delivery
// const b2bResult = await orderService.createB2BOrder(
//   items,
//   businessCustomer,
//   new Date('2025-05-10')
// );
