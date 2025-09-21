# WAREHOUSE DESIGN CHOICES

## Introduction

This document outlines the design choices and concepts around managing inventory in a multi-warehouse setup for the Getverity platform. It explains the differences between warehouse management approaches and provides examples of GraphQL queries used to query inventory data.

## Key Concepts

- **Business Units**: For retailers with a single store, each store maps to a single warehouse. For wholesale and retail outlets, we use the "Business Unit" approach to treat each outlet as a separate warehouse, but managed under a single profile. Brand owners and distributors with multiple warehouses can switch between them via Business Units without needing to log out (similar to Binance's multi-warehouse approach).

- **Warehouse Management**: Different types of users, such as admins, wholesalers, and retailers, can have different visibility and access to stock levels, depending on their business unit and warehouse mappings.

## Queries Overview

Two main types of queries were considered for inventory management:

### GetInventory Query

- Returns a list of all products in the system, filtered by the channel (warehouse context), along with their variants, stock levels, and other relevant product details
- Suited for querying across multiple products and their stock levels in a specific channel
- Provides an aggregated overview of the inventory across warehouses, especially useful for admins who need visibility across multiple business units

### WarehouseStock Query

- Returns the stock levels for specific product variants within a single warehouse
- Tailored for users with a more localized view (e.g., a retailer with a single warehouse) or for admins managing inventory at a specific warehouse
- Ideal for querying specific stock levels tied to a warehouse without having to aggregate data from different warehouses

## Warehouse Structure

### Retailers (Single Warehouse Mapping)

**Scenario**: Retailers who manage a single retail store.

**Warehouse Mapping**: A single warehouse is mapped to the retailer, and the inventory is scoped to this warehouse.

**Query**: The WarehouseStock query is most appropriate here since retailers only need data from a single warehouse.

### Wholesale + Retail Outlet (Business Units)

**Scenario**: Businesses with both wholesale and retail outlets, each managed under a single business unit.

**Warehouse Mapping**: Each outlet is treated as a business unit mapped to a specific warehouse. The user can manage inventory per outlet without needing multiple logins.

<!--
ANALYTICS COMPLEXITY: WE NEED TO AGGREGATE INVENTORY DATA ACROSS DIFFERENT WAREHOUSES, AND PROVIDE A BROADER VIEW OF STOCK AND VARIANTS ACROSS THE BOARD.
-->

### Multi-Warehouse Users (Brand Owners and Distributors)

**Scenario**: Users managing multiple warehouses, such as brand owners and distributors.

**Warehouse Mapping**: Users can create multiple business units, each tied to a different warehouse. Admins can seamlessly switch between business units to manage stock across multiple warehouses.

- **Multi-Warehouse Context**: Since our platform supports multiple business units for wholesalers, brand owners, and distributors, the platform is better suited if admins can manage and view inventory across multiple warehouses.

- **Channel-Based Filtering**: Allows us to filter data by channel (business unit), so admins can view inventory per warehouse/business unit without needing to log out.

### Why WarehouseStock May Be Useful:

- For retailers or single warehouse users, the WarehouseStock query offers a simpler and more focused approach, providing stock information for a specific warehouse without complexity.

In summary, GetInventory is more flexible and future-proof for our platform, given the focus on multi-warehouse management and business units. The WarehouseStock query is useful for more localized or specific use cases, especially for retailers with a single store or warehouse.
