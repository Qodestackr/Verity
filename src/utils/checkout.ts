import { cookies } from "next/headers";
import {
  CheckoutCreateDocument,
  CheckoutFindDocument,
  FindOrderDocument,
} from "@/gql/graphql";
import { executeGraphQL, executeMutation } from "@/lib/graphql-client";

export async function getIdFromCookies(channel: string) {
  const cookieName = `checkoutId-${channel}`;
  const checkoutId = (await cookies()).get(cookieName)?.value || "";
  return checkoutId;
}

export async function saveIdToCookie(channel: string, checkoutId: string) {
  const shouldUseHttps =
    process.env.NEXT_PUBLIC_STOREFRONT_URL?.startsWith("https") ||
    !!process.env.NEXT_PUBLIC_VERCEL_URL;
  const cookieName = `checkoutId-${channel}`;
  (await cookies()).set(cookieName, checkoutId, {
    sameSite: "lax",
    secure: shouldUseHttps,
  });
}

export async function find(checkoutId: string) {
  try {
    const { checkout } = checkoutId
      ? await executeGraphQL(CheckoutFindDocument, {
          variables: {
            id: checkoutId,
          },
        })
      : { checkout: null };

    return checkout;
  } catch {
    // ignore invalid ID or checkout not found
  }
}

export async function findOrCreate({
  channel,
  checkoutId,
}: {
  checkoutId?: string;
  channel: string;
}) {
  if (!checkoutId) {
    return (await create({ channel })).checkoutCreate?.checkout;
  }

  const checkout = await find(checkoutId);
  return checkout || (await create({ channel })).checkoutCreate?.checkout;
}

export const create = ({ channel }: { channel: string }) =>
  executeMutation(CheckoutCreateDocument, {
    variables: {
      channel,
      lines: {
        forceNewLine: undefined,
        metadata: undefined,
        price: undefined,
        quantity: 0,
        variantId: "",
      },
    },
  });
