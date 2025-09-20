# Saleor GraphQL Debugging Guide

This guide covers common GraphQL errors you'll encounter when working with Saleor and how to solve them efficiently.

## Authentication Errors

### PermissionDenied Error

```json
{
  "errors": [
    {
      "message": "You need one of the following permissions: MANAGE_PRODUCTS",
      "extensions": {
        "exception": {
          "code": "PermissionDenied"
        }
      }
    }
  ]
}
```

**Solution**: Add the correct Authorization header:

```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

## Input Validation Errors

### Invalid Enum Values

```json
{
  "errors": [
    {
      "message": "Expected type \"CountryCode\", found \"KE\"."
    }
  ]
}
```

**Solution**: Use the correct enum syntax:

```graphql
# WRONG ❌
country: "KE"

# RIGHT ✅
country: CountryCode.KE
```

### Missing Required Fields

```json
{
  "errors": [
    {
      "message": "Field ProductCreateInput.productType of required type ID! was not provided."
    }
  ]
}
```

**Solution**: Always include all required fields (marked with `!` in schema)

## ID Format Errors

### Invalid ID Format

```json
{
  "errors": [
    {
      "message": "Invalid ID value"
    }
  ]
}
```

**Solution**: All IDs in Saleor are base64-encoded. Never manipulate them manually.

### ID Not Found

```json
{
  "errors": [
    {
      "message": "Couldn't resolve id: 'V2FyZWVV1c2U6NA=='"
    }
  ]
}
```

**Solution**: Query for valid IDs before using them in mutations

## Channel-Related Issues

### Missing Channel Context

```json
{
  "errors": [
    {
      "message": "You need to provide a channel"
    }
  ]
}
```

**Solution**: Include channel in queries that require it:

```graphql
query {
  products(channel: "channel-slug-here") {
    # ...
  }
}
```

### Missing Channel Listings

Product pricing not showing up in queries? You need to add channel listings:

```graphql
mutation {
  productVariantChannelListingUpdate(
    id: "variant-id"
    input: { channelListings: [{ channelId: "channel-id", price: "19.99" }] }
  ) {
    productVariant {
      id
    }
  }
}
```

## Stock Management Problems

### Cannot Update Stock

```json
{
  "errors": [
    {
      "message": "Stock for this variant in this warehouse already exists."
    }
  ]
}
```

**Solution**: Use `productVariantStocksUpdate` instead of `stockCreate` for existing stock

## Mutation Errors

### Error Handling Pattern

Always check the errors object in mutations:

```graphql
mutation {
  yourMutation(input: {}) {
    errors {
      # Always include this!
      field
      message
      code
    }
    # other return fields
  }
}
```

## Common Issues & Quick Fixes

1. **Products not visible in store**:

   - Check if product is published in the channel
   - Verify it has stock in warehouses
   - Ensure price is set in the channel

2. **Can't create a product**:

   - Product type is required
   - Category is required for most product types
   - Product attributes may be required

3. **Stock appears as zero**:

   - Verify warehouse is associated with channel
   - Check if variant has stock in the warehouse
   - Ensure stock quantity is greater than zero

4. **Prices not showing up**:

   - Check channel listings for product variants
   - Ensure the price is set for the right channel

5. **Orders not completing**:
   - Verify payment method setup
   - Check shipping method configuration
   - Ensure stock availability

## Query Parameter Best Practices

### Using Variables in GraphQL

```graphql
# BETTER ✅
query GetProduct($id: ID!) {
  product(id: $id) {
    name
  }
}

# Variables:
{
  "id": "UHJvZHVjdDoxMjM="
}
```

## Tools & Techniques

1. **Introspection Queries**: Use this to explore the schema

   ```graphql
   {
     __schema {
       types {
         name
         description
       }
     }
   }
   ```

2. **Check Field Definitions**:

```graphql
{
  __type(name: "Product") {
    name
    fields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}
```

3. **Debug network requests** in browser dev tools to see raw request/response data

4. **Use GraphQL variables** instead of string interpolation to avoid escaping issues
