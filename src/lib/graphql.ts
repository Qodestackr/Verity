import {
  createClient,
  fetchExchange,
  cacheExchange,
  ssrExchange,
  subscriptionExchange,
  Operation,
  CombinedError,
} from "@urql/core";

import { useCurrency } from "@/hooks/useCurrency";
import { persistedExchange } from "@urql/exchange-persisted";
import { retryExchange } from "@urql/exchange-retry";
import { authExchange } from "@urql/exchange-auth";
import { getValidToken } from "@/lib/saleor-token-manager";
import { APP_COMMERCE_URL } from "@/config/urls";

const retryOptions = {
  initialDelayMs: 300,
  maxDelayMs: 5000,
  randomDelay: true,
  maxNumberAttempts: 5,
  retryIf: (err: any) => {
    // Retry on network errors and specific GraphQL errors that indicate temporary issues
    if (err.networkError) return true;

    // Check for rate limiting or server overload errors
    if (err.graphQLErrors) {
      return err.graphQLErrors.some(
        (e: any) =>
          e.extensions?.code === "INTERNAL_SERVER_ERROR" ||
          e.extensions?.code === "SERVICE_UNAVAILABLE" ||
          e.message?.includes("rate limit")
      );
    }

    return false;
  },
};

const ssr = ssrExchange({
  isClient: typeof window !== "undefined",
});

export const gqlclient = createClient({
  url: `${APP_COMMERCE_URL}/graphql/`,
  exchanges: [
    cacheExchange,
    ssr,
    retryExchange(retryOptions),
    // persistedExchange({
    //   preferGetForPersistedQueries: true,
    // }),
    authExchange(async (utils) => {
      const token = await getValidToken();

      return {
        // ... auth token to all ops
        addAuthToOperation(operation: Operation) {
          return utils.appendHeaders(operation, {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          });
        },

        // check if we need to refresh before an operation
        willAuthError() {
          // We're relying on getValidToken to always provide fresh tokens
          return false;
        },

        // Required: Check for auth errors from the API
        didAuthError(error: CombinedError) {
          // (401/403)== auth-related
          return error.graphQLErrors.some(
            (e) =>
              e.extensions?.code === "UNAUTHENTICATED" ||
              e.extensions?.code === "FORBIDDEN" ||
              e.message?.includes("authentication")
          );
        },

        // Required: Function to refresh auth
        async refreshAuth() {
          // Just get a fresh token
          await getValidToken();
        },
      };
    }),
    fetchExchange,
  ],
});
