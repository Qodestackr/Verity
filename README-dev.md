# Alcorabooks Developer Guide

<!--
>> SAFE RESTART SALOER: https://claude.ai/public/artifacts/81a01e29-c1aa-4153-84b9-59e8acd6c640
docker compose up -d --no-deps api
docker compose restart api
-->

## Table of Contents

- [GraphQL & URQL Setup](#graphql--urql-setup)
- [Working with GraphQL CodeGen](#working-with-graphql-codegen)
- [Advanced URQL Patterns](#advanced-urql-patterns)
- [Authentication & Channel Management](#authentication--channel-management)
- [Common CRUD Operations](#common-crud-operations)
- [Performance Optimization](#performance-optimization)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## GraphQL & URQL Setup

### Project Structure

```
src/
├── graphql/              # GraphQL operation definitions
│   ├── fragments/        # Reusable GraphQL fragments
│   ├── mutations/        # GraphQL mutations
│   ├── queries/          # GraphQL queries
│   └── subscriptions/    # GraphQL subscriptions
├── gql/                  # Generated TypeScript types (don't edit manually)
└── lib/
    └── graphql.ts        # URQL client configuration
```

### URQL Client Configuration

For advanced Saleor integration with channel support:

```js
import {
  createClient,
  fetchExchange,
  cacheExchange,
  dedupExchange,
} from "@urql/core";
import { authExchange } from "@urql/exchange-auth";
import { multipartFetchExchange } from "@urql/exchange-multipart-fetch";
import { retryExchange } from "@urql/exchange-retry";
import { refocusExchange } from "@urql/exchange-refocus";

export const createSaleorClient = (
  token: string,
  channelSlug: string = "default-channel"
) => {
  return createClient({
    url: "https://store-dvup9a9c.saleor.cloud/graphql/",
    exchanges: [
      dedupExchange,
      cacheExchange({
        // Custom cache configuration
        keys: {
          Money: () => null, // Money doesn't need a cache key
        },
        resolvers: {
          // Resolver for custom caching logic
          Query: {
            product: (_, args) => ({
              __typename: "Product",
              id: args.id,
            }),
          },
        },
      }),
      refocusExchange(),
      retryExchange({
        retryIf: (error) =>
          !!(
            error.networkError ||
            error.graphQLErrors?.some(
              (e) => e.extensions?.code === "TEMPORARILY_UNAVAILABLE"
            )
          ),
        maxNumberAttempts: 3,
      }),
      authExchange({
        getAuth: async () => {
          if (!token) return null;
          return { token };
        },
        addAuthToOperation: ({ authState, operation }) => {
          if (!authState?.token) return operation;

          const fetchOptions =
            typeof operation.context.fetchOptions === "function"
              ? operation.context.fetchOptions()
              : operation.context.fetchOptions || {};

          return {
            ...operation,
            context: {
              ...operation.context,
              fetchOptions: {
                ...fetchOptions,
                headers: {
                  ...fetchOptions.headers,
                  Authorization: `Bearer ${authState.token}`,
                },
              },
            },
          };
        },
        didAuthError: ({ error }) => {
          return error.graphQLErrors.some(
            (e) => e.extensions?.code === "UNAUTHENTICATED"
          );
        },
      }),
      multipartFetchExchange, // For file uploads
    ],
    // Add default channel to all operations
    fetchOptions: () => {
      return {
        headers: { "X-Saleor-Channel": channelSlug },
      };
    },
  });
};
```

## Working with GraphQL CodeGen

### Running CodeGen

```bash
# Generate types from schema and operations
pnpm codegen

# Watch mode for development
pnpm codegen --watch
```

### Advanced Fragment Usage

Use fragments to maintain consistent data shapes:

```graphql
fragment ProductBase on Product {
  id
  name
  slug
}

fragment ProductDetails on Product {
  ...ProductBase
  description
  thumbnail {
    url
    alt
  }
  category {
    id
    name
  }
  pricing {
    priceRange {
      start {
        gross {
          amount
          currency
        }
      }
    }
  }
}

fragment ProductInventory on Product {
  ...ProductBase
  variants {
    id
    name
    sku
    stocks {
      warehouse {
        id
        name
      }
      quantity
      quantityAllocated
    }
  }
}
```

Then use these fragments in your queries:

```graphql
query GetProductsForRetailer($first: Int!, $channel: String!) {
  products(first: $first, channel: $channel) {
    edges {
      node {
        ...ProductDetails
      }
    }
  }
}

query GetProductInventory($id: ID!, $channel: String!) {
  product(id: $id, channel: $channel) {
    ...ProductInventory
  }
}
```

## Advanced URQL Patterns

### Handling Pagination

```jsx
import { useCallback } from "react";
import { useQuery } from "urql";
import { GetProductsDocument } from "@/gql/graphql";

export function useProductsPagination(channelSlug: string) {
  const [result, executeQuery] = useQuery({
    query: GetProductsDocument,
    variables: {
      first: 20,
      channel: channelSlug,
      after: null,
    },
    // Don't fetch automatically on component mount
    pause: true,
  });

  // Initial data load
  const loadInitialData = useCallback(() => {
    executeQuery({
      variables: {
        first: 20,
        channel: channelSlug,
        after: null,
      },
    });
  }, [executeQuery, channelSlug]);

  // Load next page
  const loadNextPage = useCallback(() => {
    if (result.data?.products?.pageInfo?.hasNextPage) {
      executeQuery({
        variables: {
          first: 20,
          channel: channelSlug,
          after: result.data.products.pageInfo.endCursor,
        },
      });
    }
  }, [executeQuery, result.data, channelSlug]);

  return {
    products: result.data?.products?.edges?.map((edge) => edge.node) || [],
    isLoading: result.fetching,
    error: result.error,
    hasNextPage: result.data?.products?.pageInfo?.hasNextPage || false,
    loadInitialData,
    loadNextPage,
  };
}
```

### Optimistic Updates

```jsx
import { useMutation } from "urql";
import { toast } from "sonner";
import { AddToCartDocument } from "@/gql/graphql";

export function useAddToCart() {
  const [result, addToCartMutation] = useMutation(AddToCartDocument);

  const addToCart = async (productId: string, quantity: number) => {
    try {
      const { data, error } = await addToCartMutation(
        {
          productId,
          quantity,
        },
        {
          // Optimistic update
          optimistic: {
            // Predicted response
            __typename: "Mutation",
            checkoutLineAdd: {
              __typename: "CheckoutLineAdd",
              checkout: {
                __typename: "Checkout",
                id: "temp-id-for-optimistic-update",
                lines: [
                  {
                    __typename: "CheckoutLine",
                    id: `temp-line-${productId}`,
                    quantity,
                    variant: {
                      __typename: "ProductVariant",
                      id: productId,
                    },
                  },
                ],
                totalPrice: {
                  __typename: "TaxedMoney",
                  gross: {
                    __typename: "Money",
                    amount: 0, // Will be updated with real value
                    currency: "KES",
                  },
                },
              },
              errors: [],
            },
          },
        }
      );

      if (error || data?.checkoutLineAdd?.errors?.length) {
        const errorMessage =
          error?.message ||
          data?.checkoutLineAdd?.errors[0]?.message ||
          "Failed to add to cart";
        toast.error(errorMessage);
        return false;
      }

      toast.success("Added to cart!");
      return true;
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("An unexpected error occurred");
      return false;
    }
  };

  return {
    addToCart,
    isLoading: result.fetching,
  };
}
```

### Managing Complex State

Use helper functions to transform GraphQL results into application state:

```js
// src/lib/transforms/inventory.ts
import type { ProductInventoryFragment } from "@/gql/graphql";

export interface StockLevel {
  warehouseId: string;
  warehouseName: string;
  available: number;
  allocated: number;
  total: number;
}

export function transformProductInventory(
  product: ProductInventoryFragment
): StockLevel[] {
  if (!product?.variants) return [];

  // Create a Map to consolidate stock across variants
  const warehouseStockMap = new Map<string, StockLevel>();

  product.variants.forEach((variant) => {
    if (!variant.stocks) return;

    variant.stocks.forEach((stock) => {
      const warehouseId = stock.warehouse.id;

      if (!warehouseStockMap.has(warehouseId)) {
        warehouseStockMap.set(warehouseId, {
          warehouseId,
          warehouseName: stock.warehouse.name,
          available: 0,
          allocated: 0,
          total: 0,
        });
      }

      const currentStock = warehouseStockMap.get(warehouseId)!;
      const available = stock.quantity - stock.quantityAllocated;

      warehouseStockMap.set(warehouseId, {
        ...currentStock,
        available: currentStock.available + available,
        allocated: currentStock.allocated + stock.quantityAllocated,
        total: currentStock.total + stock.quantity,
      });
    });
  });

  return Array.from(warehouseStockMap.values());
}
```

## Authentication & Channel Management

### User Context with Organization and Channel

```js
// src/lib/store/auth-store.ts
import { create } from "zustand";
import { createClient } from "@/lib/graphql";

interface AuthState {
  token: string | null;
  user: {
    id: string,
    email: string,
    role: string,
  } | null;
  organization: {
    id: string,
    name: string,
    slug: string,
  } | null;
  channel: {
    id: string,
    slug: string,
  } | null;
  graphqlClient: ReturnType<typeof createClient> | null;
  setAuth: (token: string, userData: any) => void;
  setOrganization: (org: any) => void;
  setChannel: (channel: any) => void;
  logout: () => void;
}

export const useAuthStore =
  create <
  AuthState >
  ((set) => ({
    token: null,
    user: null,
    organization: null,
    channel: null,
    graphqlClient: null,

    setAuth: (token, userData) =>
      set((state) => {
        const newClient = createSaleorClient(
          token,
          state.channel?.slug || "default-channel"
        );
        return {
          token,
          user: userData,
          graphqlClient: newClient,
        };
      }),

    setOrganization: (org) => set((state) => ({ organization: org })),

    setChannel: (channel) =>
      set((state) => {
        // Recreate client when channel changes
        const newClient = state.token
          ? createSaleorClient(state.token, channel.slug)
          : null;

        return {
          channel,
          graphqlClient: newClient,
        };
      }),

    logout: () =>
      set({
        token: null,
        user: null,
        organization: null,
        channel: null,
        graphqlClient: null,
      }),
  }));
```

### URQL Context Provider with Dynamic Client

```jsx
"use client";

import React, { useEffect } from "react";
import { Provider } from "urql";
import { useAuthStore } from "@/lib/store/auth-store";
import { createSaleorClient } from "@/lib/graphql";

export function GraphQLProvider({ children }: { children: React.ReactNode }) {
  const { token, channel, graphqlClient, setAuth } = useAuthStore();

  // Initialize client on mount or when token/channel changes
  useEffect(() => {
    // Check if we have a token in localStorage on mount
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");

    if (savedToken && savedUser) {
      try {
        setAuth(savedToken, JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to restore auth state:", e);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
  }, [setAuth]);

  // Create a fallback client for unauthenticated users
  const fallbackClient = React.useMemo(() => {
    return createSaleorClient("", "default-channel");
  }, []);

  return (
    <Provider value={graphqlClient || fallbackClient}>{children}</Provider>
  );
}
```

## Common CRUD Operations

### Creating a Product

```jsx
import { useMutation } from "urql";
import { ProductCreateDocument } from "@/gql/graphql";

export function useCreateProduct() {
  const [result, createProductMutation] = useMutation(ProductCreateDocument);

  const createProduct = async (productData: {
    name: string;
    description: string;
    productTypeId: string;
    categoryId: string;
    price: number;
  }) => {
    try {
      const { data, error } = await createProductMutation({
        input: {
          name: productData.name,
          description: productData.description,
          productType: productData.productTypeId,
          category: productData.categoryId,
        },
        priceInput: {
          baseAmount: productData.price,
        },
      });

      if (error || data?.productCreate?.errors?.length) {
        return {
          success: false,
          error: error?.message || data?.productCreate?.errors[0]?.message,
        };
      }

      return {
        success: true,
        product: data?.productCreate?.product,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "An unexpected error occurred",
      };
    }
  };

  return {
    createProduct,
    isLoading: result.fetching,
  };
}
```

### Updating Product Stock

```jsx
import { useMutation } from "urql";
import { ProductVariantStockUpdateDocument } from "@/gql/graphql";

export function useUpdateStock() {
  const [result, updateStockMutation] = useMutation(
    ProductVariantStockUpdateDocument
  );

  const updateStock = async (
    variantId: string,
    warehouseId: string,
    quantity: number
  ) => {
    try {
      const { data, error } = await updateStockMutation({
        variantId,
        stocks: [
          {
            warehouse: warehouseId,
            quantity,
          },
        ],
      });

      if (error || data?.productVariantStocksUpdate?.errors?.length) {
        return {
          success: false,
          error:
            error?.message ||
            data?.productVariantStocksUpdate?.errors[0]?.message,
        };
      }

      return {
        success: true,
        variant: data?.productVariantStocksUpdate?.productVariant,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to update stock",
      };
    }
  };

  return {
    updateStock,
    isLoading: result.fetching,
  };
}
```

### Creating an Order (POS Transaction)

```jsx
import { useMutation } from "urql";
import { OrderCreateDocument } from "@/gql/graphql";
import { useAuthStore } from "@/lib/store/auth-store";

export function useCreateOrder() {
  const [result, createOrderMutation] = useMutation(OrderCreateDocument);
  const { user, channel } = useAuthStore();

  const createOrder = async (orderData: {
    lines: Array<{
      variantId: string;
      quantity: number;
    }>;
    customer?: {
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    };
    shippingAddress?: any;
    billingAddress?: any;
    note?: string;
  }) => {
    if (!channel) {
      return {
        success: false,
        error: "No active channel selected",
      };
    }

    try {
      const { data, error } = await createOrderMutation({
        input: {
          channel: channel.slug,
          user: orderData.customer?.email || user?.email,
          lines: orderData.lines.map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
          })),
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress,
          metadata: [
            { key: "source", value: "POS" },
            { key: "created_by", value: user?.id || "anonymous" },
          ],
          privateMetadata: [{ key: "note", value: orderData.note || "" }],
        },
      });

      if (error || data?.draftOrderCreate?.errors?.length) {
        return {
          success: false,
          error: error?.message || data?.draftOrderCreate?.errors[0]?.message,
        };
      }

      // Complete the draft order to convert it to a regular order
      // Call completeOrder mutation here if needed

      return {
        success: true,
        order: data?.draftOrderCreate?.order,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to create order",
      };
    }
  };

  return {
    createOrder,
    isLoading: result.fetching,
  };
}
```

## Performance Optimization

### Component-Level Query Hooks

```tsx
// src/hooks/products.ts
import { useQuery } from "urql";
import { GetProductsByCategoryDocument } from "@/gql/graphql";

export function useProductsByCategory(
  categoryId: string,
  options = { limit: 20 }
) {
  return useQuery({
    query: GetProductsByCategoryDocument,
    variables: {
      categoryId,
      first: options.limit,
    },
    context: {
      // Add request policy for cache control
      requestPolicy: "cache-first",
    },
  });
}
```

### Custom Cache Updates

```jsx
// src/lib/cache-updates.ts
import { Cache, QueryInput } from "@urql/exchange-graphcache";
import { GetProductsDocument, ProductCreateMutation } from "@/gql/graphql";

// Update cache after product creation
export function updateProductsAfterCreate(
  cache: Cache,
  result: ProductCreateMutation
) {
  if (!result.productCreate?.product) return;

  // Get existing products query
  cache.updateQuery(
    { query: GetProductsDocument, variables: { first: 20 } } as QueryInput,
    (data) => {
      if (!data || !data.products || !data.products.edges) return data;

      // Add new product to list
      return {
        ...data,
        products: {
          ...data.products,
          edges: [
            // Add new item at the beginning
            {
              __typename: "ProductCountableEdge",
              node: result.productCreate.product,
            },
            // Include existing items
            ...data.products.edges,
          ],
        },
      };
    }
  );
}
```

### Prefetching For Better UX

```jsx
// src/components/product-list.tsx
import { useQuery, usePrefetch } from "urql";
import { GetProductDetailsDocument, GetProductsDocument } from "@/gql/graphql";

export function ProductList() {
  const [result] = useQuery({
    query: GetProductsDocument,
    variables: { first: 20 },
  });
  const prefetchProduct = usePrefetch({ query: GetProductDetailsDocument });

  // Prefetch product details on hover
  const handleProductHover = (productId: string) => {
    prefetchProduct({ variables: { id: productId } });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {result.data?.products?.edges.map(({ node }) => (
        <div
          key={node.id}
          onMouseEnter={() => handleProductHover(node.id)}
          className="border p-4 rounded"
        >
          <h3>{node.name}</h3>
          {/* other product info */}
        </div>
      ))}
    </div>
  );
}
```

## Testing

### Testing GraphQL Operations

```js
// src/hooks/__tests__/products.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useProductsByCategory } from "../products";
import { createWrapper } from "../../test-utils";

describe("useProductsByCategory", () => {
  it("fetches products for a category", async () => {
    const mockCategoryId = "Q2F0ZWdvcnk6MQ==";

    // Mock client with predefined response
    const wrapper = createWrapper([
      {
        request: {
          query: GetProductsByCategoryDocument,
          variables: { categoryId: mockCategoryId, first: 20 },
        },
        result: {
          data: {
            products: {
              edges: [
                {
                  node: {
                    id: "UHJvZHVjdDox",
                    name: "Test Product 1",
                  },
                },
              ],
            },
          },
        },
      },
    ]);

    const { result } = renderHook(() => useProductsByCategory(mockCategoryId), {
      wrapper,
    });

    // Initial loading state
    expect(result.current[0].fetching).toBe(true);

    // Wait for query to resolve
    await waitFor(() => expect(result.current[0].fetching).toBe(false));

    // Check results
    expect(result.current[0].data?.products.edges).toHaveLength(1);
    expect(result.current[0].data?.products.edges[0].node.name).toBe(
      "Test Product 1"
    );
  });
});
```

## Troubleshooting

### Common URQL Issues

1. **Authentication Problems**

   - Check that your token is being correctly passed in the Authorization header
   - Verify token expiration and refresh logic
   - Confirm proper CORS configuration on the server

2. **Cache Inconsistencies**

   - Use DevTools to inspect cache state
   - Implement proper cache updates for mutations
   - Consider using different request policies for specific queries

3. **Performance Issues**
   - Reduce query complexity by only requesting needed fields
   - Implement pagination for large lists
   - Use fragments to avoid duplicating field selections
   - Consider implementing persisted queries for production

### Debugging GraphQL Operations

```js
// Add this to your createClient configuration
const debugExchange =
  ({ forward }) =>
  (ops$) => {
    if (process.env.NODE_ENV === "development") {
      const operationStart = new Date();

      return pipe(
        ops$,
        tap((operation) => {
          console.group(`GraphQL Operation: ${operation.key}`);
          console.log("Query:", operation.query);
          console.log("Variables:", operation.variables);
          console.log("Start time:", operationStart.toISOString());
          console.groupEnd();
        }),
        forward,
        tap((result) => {
          const operationEnd = new Date();
          const duration = operationEnd.getTime() - operationStart.getTime();

          console.group(`GraphQL Result: ${result.operation.key}`);
          console.log("Duration:", `${duration}ms`);
          console.log("Result:", result);
          console.groupEnd();
        })
      );
    }

    return forward(ops$);
  };

// Add debugExchange to your exchanges array
```

---

## Quick Reference

### Essential GraphQL Queries

```graphql
# Product stock check (POS)
query CheckProductStock($productId: ID!, $channel: String!) {
  product(id: $productId, channel: $channel) {
    id
    name
    variants {
      id
      name
      sku
      stocks {
        warehouse {
          id
        }
        quantity
        quantityAllocated
      }
    }
  }
}

# Create order (POS)
mutation CreateOrder($input: OrderCreateInput!) {
  orderCreate(input: $input) {
    order {
      id
      number
      created
      status
      total {
        gross {
          amount
          currency
        }
      }
    }
    errors {
      field
      message
      code
    }
  }
}

# Update stock (Inventory Management)
mutation UpdateStock($variantId: ID!, $stocks: [StockInput!]!) {
  productVariantStocksUpdate(variantId: $variantId, stocks: $stocks) {
    productVariant {
      id
      stocks {
        warehouse {
          id
          name
        }
        quantity
      }
    }
    errors {
      field
      message
      code
    }
  }
}
```

### Performance Checklist

- [ ] Use fragments for consistent data requirements
- [ ] Implement pagination for all list queries
- [ ] Set appropriate cache policies
- [ ] Update cache after mutations
- [ ] Prefetch data for common user flows
- [ ] Monitor query complexity and response times
