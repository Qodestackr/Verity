import { useCurrency } from "@/hooks/useCurrency";
import { type Checkout } from "@/gql/graphql";
import { extractCheckoutIdFromUrl } from "@/utils/url";
import { useEffect, useMemo } from "react";
import { useQuery } from "urql";

// import { type Checkout, useCheckoutQuery } from "@/checkout/graphql";
// import { extractCheckoutIdFromUrl } from "@/checkout/lib/utils/url";
// import { useCheckoutUpdateStateActions } from "@/checkout/state/updateStateStore";

function useCheckoutUpdateStateActions(): { setLoadingCheckout: any } {
  throw new Error("Function not implemented.");
}

export const useCheckout = ({ pause = false } = {}) => {
  const id = useMemo(() => extractCheckoutIdFromUrl(), []);
  const { setLoadingCheckout } = useCheckoutUpdateStateActions();

  const [{ data, fetching, stale }, refetch] = useQuery({
    variables: { id, languageCode: "EN_US" },
    pause: pause,
    query: "",
  });

  useEffect(
    () => setLoadingCheckout(fetching || stale),
    [fetching, setLoadingCheckout, stale]
  );

  return useMemo(
    () => ({
      checkout: data?.checkout as Checkout,
      fetching: fetching || stale,
      refetch,
    }),
    [data?.checkout, fetching, refetch, stale]
  );
};
