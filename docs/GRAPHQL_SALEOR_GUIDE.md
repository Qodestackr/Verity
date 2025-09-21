# Getverity Saleor GraphQL Guide

## Overview

This document provides a comprehensive guide to working with Saleor's GraphQL API in the Getverity platform. It covers our GraphQL architecture, code generation approach, and best practices for extending and consuming the API.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Directory Structure](#directory-structure)
- [GraphQL File Organization](#graphql-file-organization)
- [Code Generation](#code-generation)
- [Consuming GraphQL in Components](#consuming-graphql-in-components)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

## Architecture Overview

Getverity uses Saleor as its commerce engine with a custom relationship management layer. Our GraphQL implementation follows these principles:

1. **Declarative Approach**: GraphQL operations are defined in separate `.graphql` files, not embedded in components
2. **Code Generation**: TypeScript types are automatically generated from GraphQL schemas
3. **Reusable Fragments**: Common data structures are defined once and reused
4. **Role-Specific Operations**: GraphQL operations are organized by business role (distributor, wholesaler, retailer)
5. **urql Client**: We use urql for its lightweight footprint and excellent TypeScript support

## Directory Structure

```
src/
├── graphql/
│   ├── fragments/        # Reusable GraphQL fragments
│   │   ├── product.graphql
│   │   ├── order.graphql
│   │   ├── business.graphql
│   │   └── warehouse.graphql
│   ├── mutations/        # GraphQL mutations
│   │   ├── OrderMutations.graphql
│   │   ├── InventoryMutations.graphql
│   │   └── ...
│   ├── queries/          # GraphQL queries
│   │   ├── ProductQueries.graphql
│   │   ├── OrderQueries.graphql
│   │   └── ...
│   ├── subscriptions/    # GraphQL subscriptions
│   │   └── ...
│   └── schema.graphql    # Introspected Saleor schema
├── gql/                  # Generated TypeScript code
│   └── graphql.ts        # All generated types and documents
└── ...
```

## GraphQL File Organization

### Fragments

Fragments define reusable pieces of GraphQL that can be included in multiple operations. We organize fragments by domain:

```graphql
# fragments/product.graphql
fragment ProductBasic on Product {
  id
  name
  slug
  thumbnail {
    url
    alt
  }
}

fragment ProductPricing on Product {
  ...ProductBasic
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
```

Fragments should:

- Start from basic fields and extend with more specific fragments
- Be domain-focused (product, order, customer)
- Include only the fields needed for specific use cases

### Queries

Queries are operations that fetch data and are organized by domain. Each file contains related queries:

```graphql
# queries/ProductQueries.graphql
query ProductList($first: Int = 20, $channel: String!) {
  products(first: $first, channel: $channel) {
    edges {
      node {
        ...ProductPricing
      }
    }
  }
}

query ProductDetails($id: ID!, $channel: String!) {
  product(id: $id, channel: $channel) {
    ...ProductInventory
    description
    category {
      name
    }
  }
}
```

### Mutations

Mutations modify data and are organized by business operation:

```graphql
# mutations/OrderMutations.graphql
mutation CreateOrder($input: OrderCreateInput!) {
  orderCreate(input: $input) {
    order {
      id
      number
    }
    errors {
      field
      message
      code
    }
  }
}
```

### Subscriptions

Subscriptions provide real-time updates:

```graphql
# subscriptions/OrderSubscriptions.graphql
subscription OrderUpdated($id: ID!) {
  orderUpdated(id: $id) {
    id
    status
  }
}
```

## Code Generation

We use GraphQL Code Generator to automatically create TypeScript types from our GraphQL schema and operations.

### Setup

Our codegen configuration (`codegen.ts`) is set up to:

1. Introspect the Saleor API schema
2. Read all `.graphql` files
3. Generate TypeScript types
4. Generate urql hooks

```typescript
// codegen.ts
export default {
  schema: "https://our-saleor-instance.com/graphql/",
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/gql/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-urql"],
    },
  },
};
```

### Running Code Generation

After adding or modifying GraphQL files, run:

```bash
npm run codegen
# or
yarn codegen
```

This command generates `src/gql/graphql.ts` with all types and operations.

### Generated Output

The generated file contains:

1. TypeScript types for all GraphQL types in the schema
2. TypeScript types for your specific operations
3. Document constants for each operation
4. Type-safe hooks for urql

For example, a query like:

```graphql
query ProductList($first: Int = 20) {
  products(first: $first) {
    edges {
      node {
        ...ProductBasic
      }
    }
  }
}
```

Will generate:

- `ProductListDocument` - The executable GraphQL document
- `ProductListQuery` - Response type
- `ProductListQueryVariables` - Variables type

## Consuming GraphQL in Components

### Queries

```tsx
import { useQuery } from "urql";
import {
  ProductListDocument,
  ProductListQuery,
  ProductListQueryVariables,
} from "@/gql/graphql";

function ProductListComponent() {
  const [result] = useQuery<ProductListQuery, ProductListQueryVariables>({
    query: ProductListDocument,
    variables: {
      first: 20,
      channel: "default-channel",
    },
  });

  if (result.fetching) return <p>Loading...</p>;
  if (result.error) return <p>Error: {result.error.message}</p>;

  return (
    <div>
      {result.data?.products?.edges.map((edge) => (
        <div key={edge.node.id}>
          <h3>{edge.node.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

### Mutations

```tsx
import { useMutation } from "urql";
import {
  CreateOrderDocument,
  CreateOrderMutation,
  CreateOrderMutationVariables,
} from "@/gql/graphql";

function OrderForm() {
  const [result, createOrder] = useMutation<
    CreateOrderMutation,
    CreateOrderMutationVariables
  >(CreateOrderDocument);

  const handleSubmit = async (formData) => {
    const result = await createOrder({
      input: {
        // form data
      },
    });

    if (result.error) {
      console.error("Error creating order", result.error);
    } else {
      console.log("Order created", result.data?.orderCreate?.order);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### Subscriptions

```tsx
import { useSubscription } from "urql";
import { OrderUpdatedDocument, OrderUpdatedSubscription } from "@/gql/graphql";

function OrderStatus({ orderId }) {
  const [result] = useSubscription<OrderUpdatedSubscription>({
    query: OrderUpdatedDocument,
    variables: { id: orderId },
  });

  return (
    <div>
      Current status: {result.data?.orderUpdated?.status || "Loading..."}
    </div>
  );
}
```

### Accessing Fragment Fields

You don't need to import fragments directly - they're bundled with the query/mutation:

```tsx
// This works automatically - all fields from ProductBasic are included
const products = result.data?.products?.edges.map((edge) => edge.node);
console.log(products[0].name); // From ProductBasic fragment
```

## Best Practices

### 1. Use Fragments Extensively

Fragments are the building blocks of efficient GraphQL operations:

- Create domain-specific base fragments (e.g., `ProductBasic`)
- Build more specialized fragments that include the base (`ProductWithPricing`)
- Compose queries from fragments for consistency

### 2. Handle Loading and Error States

Always account for the three states of any GraphQL operation:

```tsx
if (result.fetching) return <LoadingComponent />;
if (result.error) return <ErrorComponent error={result.error} />;
if (!result.data) return <EmptyStateComponent />;

// Proceed with data rendering
```

### 3. Optimistic Updates

For better UX, use optimistic updates with mutations:

```tsx
const [result, updateStock] =
  useMutation<UpdateStockMutation>(UpdateStockDocument);

updateStock(
  { id: productId, quantity: newQuantity },
  {
    optimisticResponse: {
      stockUpdate: {
        stock: {
          id: productId,
          quantity: newQuantity,
          __typename: "Stock",
        },
        errors: [],
      },
    },
  }
);
```

### 4. Keep Channel Context Consistent

Always include the channel parameter for queries that require it:

```tsx
const currentChannel = "default-channel"; // Or from context/state

const [result] = useQuery({
  query: ProductListDocument,
  variables: { channel: currentChannel },
});
```

### 5. Handle Pagination

For paginated queries, implement proper handling:

```tsx
function ProductList() {
  const [cursor, setCursor] = useState(null);

  const [result] = useQuery({
    query: ProductListDocument,
    variables: {
      first: 20,
      after: cursor,
    },
  });

  const loadMore = () => {
    if (result.data?.products?.pageInfo?.hasNextPage) {
      setCursor(result.data.products.pageInfo.endCursor);
    }
  };

  return (
    <div>
      {/* Products list */}
      <button
        onClick={loadMore}
        disabled={!result.data?.products?.pageInfo?.hasNextPage}
      >
        Load More
      </button>
    </div>
  );
}
```

## Common Patterns

### Role-Based Operations

Our operations are organized by business role:

```tsx
// For a retailer dashboard
function RetailerDashboard() {
  const { data: session } = useSession();

  // Only query data relevant to retailers
  const [result] = useQuery({
    query:
      session?.user?.role === "retailer"
        ? RetailerOrdersDocument
        : session?.user?.role === "wholesaler"
        ? WholesalerOrdersDocument
        : DistributorOrdersDocument,
  });

  // Render appropriate view
}
```

### Metadata for Custom B2B Fields

We use Saleor's metadata fields for B2B-specific attributes:

```graphql
query CustomerBusinessDetails($id: ID!) {
  customer(id: $id) {
    id
    email
    # Standard fields
    firstName
    lastName
    # Custom B2B fields via metadata
    businessType: metadata(key: "business_type") {
      value
    }
    creditLimit: metadata(key: "credit_limit") {
      value
    }
  }
}
```

Then in components:

```tsx
const businessType = customer?.businessType?.value || "Not set";
const creditLimit = parseFloat(customer?.creditLimit?.value || "0");
```

### Data Relationship Management

For managing business relationships that Saleor doesn't natively support:

```graphql
mutation ConnectSupplierToCustomer($supplierId: ID!, $customerId: ID!) {
  updateMetadata(
    id: $supplierId,
    input: [
      {
        key: "customers",
        value: "existing value, new customer ID" // Requires client-side processing
      }
    ]
  ) {
    errors {
      field
      message
    }
  }
}
```

## Troubleshooting

### "Fragment not found" Errors

If you see errors about missing fragments:

1. Make sure fragment files are being included in the codegen process
2. Check that fragments are properly imported in queries
3. Run codegen again after any GraphQL file changes

### Type Mismatches

If TypeScript shows type errors:

1. The schema might have changed - run codegen again
2. Check the structure of your query/mutation against the schema
3. Verify variable types match expected input types

### Performance Issues

If queries are slow:

1. Review query complexity and reduce unnecessary fields
2. Implement pagination for large data sets
3. Consider caching frequently used data
4. Use fragments to ensure you're only requesting needed fields

## Advanced Usage

### Custom Scalars

For custom scalar types (like DateTime), add special handling:

```typescript
// codegen.ts
export default {
  schema: "https://your-saleor-instance.com/graphql/",
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/gql/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-urql"],
      config: {
        scalars: {
          DateTime: "string",
          JSON: "Record<string, any>",
        },
      },
    },
  },
};
```

### Combining Multiple Operations

For complex dashboards, you might need to combine multiple queries:

```tsx
function Dashboard() {
  const [ordersResult] = useQuery({ query: RecentOrdersDocument });
  const [inventoryResult] = useQuery({ query: LowStockProductsDocument });
  const [customerResult] = useQuery({ query: TopCustomersDocument });

  // Combine data for display
  return (
    <div>
      <OrdersWidget data={ordersResult.data} />
      <InventoryWidget data={inventoryResult.data} />
      <CustomersWidget data={customerResult.data} />
    </div>
  );
}
```

### Custom Cache Updates

For complex data relationships, manually update the cache:

```tsx
const [result, createProduct] = useMutation(CreateProductDocument);

const addProduct = async (input) => {
  const result = await createProduct({ input });

  // Update the products list cache
  client.updateQuery(
    { query: ProductListDocument, variables: { first: 20 } },
    (data) => {
      if (!data || !result.data?.productCreate?.product) return data;

      return {
        ...data,
        products: {
          ...data.products,
          edges: [
            {
              node: result.data.productCreate.product,
              __typename: "ProductCountableEdge",
            },
            ...data.products.edges,
          ],
        },
      };
    }
  );
};
```

## Why This Approach?

Our approach to Saleor GraphQL offers several key benefits:

1. **Type Safety**: All GraphQL operations have full TypeScript typing
2. **Separation of Concerns**: GraphQL operations are separate from UI components
3. **Reusability**: Fragments promote consistent data structures across components
4. **Maintainability**: Centralized GraphQL files make changes easier to manage
5. **Performance**: Only request the fields you need through precise fragments
6. **Role Specificity**: Operations are tailored to business roles (retailer, wholesaler, distributor)

This architecture supports Getverity's core value proposition of relationship management in the liquor distribution chain while leveraging Saleor's commerce capabilities.

## Next Steps and Further Learning

To expand your understanding:

1. Review the [Saleor API documentation](https://docs.saleor.io/docs/3.x/api-reference)
2. Explore the [urql documentation](https://formidable.com/open-source/urql/docs/)
3. Study the [GraphQL Code Generator docs](https://www.graphql-code-generator.com/)

## Conclusion

This guide should serve as your reference for working with the Getverity GraphQL implementation. By following these patterns and best practices, you'll be able to efficiently build and maintain features across the entire distribution chain.

Remember that our GraphQL approach mirrors the business domain - just as the liquor distribution chain has specific roles and relationships, our GraphQL operations are structured to reflect those business realities.
