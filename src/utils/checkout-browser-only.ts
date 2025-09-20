import { useCurrency } from "@/hooks/useCurrency";
import { FindOrderDocument, GetOrderFulfillmentDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql-client";

export async function waitForOrderToExist(orderId: string): Promise<boolean> {
  console.log("Checking if order exists:", orderId);

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const data = await executeGraphQL(GetOrderFulfillmentDocument, {
        variables: { id: orderId },
        cache: "no-cache",
      });

      if (data?.order) {
        console.log(`✅ Order confirmed in ${attempts} attempts`);
        return true;
      }

      console.log(`⏳ Attempt ${attempts}: Order not found yet`);
    } catch (error) {
      console.log(`⚠️ Error checking order:`, error);
    }
    await new Promise((r) => setTimeout(r, 500 * attempts));
  }

  console.log(`❌ Order ${orderId} not found after ${maxAttempts} attempts`);
  return false;
}

export async function getOrderLineId(
  orderId: string,
  variantId: string
): Promise<string> {
  let retries = 3;

  while (retries > 0) {
    const data = await executeGraphQL(FindOrderDocument, {
      variables: { id: orderId },
    });

    const line = data?.order?.lines.find((l) => l.variant?.id === variantId);

    if (line) {
      console.log("🔥 Line found:", line.id);
      return line.id;
    }

    retries--;
    console.log(`Line not found. ${retries} retries left...`);
    await new Promise((r) => setTimeout(r, 500 * (4 - retries)));
  }

  throw new Error(`Variant ${variantId} not found in order after 3 attempts`);
}
