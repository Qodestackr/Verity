import { useQuery } from "urql";

import { GetInventoryDocument } from "@/gql/graphql";

export type InventoryItem = {
  id: string;
  name: string;
  variants: any[];
  stock: number;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
  category: string;
  warehouse: string;
  packaging: string;
  reorderLevel: number;
  lastUpdated: string;
};

export const useInventory = (channel: string) => {
  const [result] = useQuery({
    query: GetInventoryDocument,
    variables: {
      channel,
      first: 100,
      after: null,
    },
  });

  const { data, fetching, error } = result;

  // Transform the GraphQL data into a simpler format for the UI
  const inventory: InventoryItem[] =
    data?.products?.edges?.map(({ node }: any) => {
      const variants = node.variants || [];

      // Calc total stock across all variants and warehouses
      let totalStock = 0;
      let stockStatus: "in-stock" | "low-stock" | "out-of-stock" =
        "out-of-stock";

      variants.forEach((variant: any) => {
        const variantStock =
          variant.stocks?.reduce(
            (acc: number, stock: any) => acc + (stock.quantity || 0),
            0
          ) || 0;
        totalStock += variantStock;
      });

      if (totalStock > 0) {
        // Arbitrary thresholds - can be adjusted based on business logic
        stockStatus = totalStock < 50 ? "low-stock" : "in-stock";
      }

      // Get warehouses from the first variant's stocks
      const warehouses =
        variants[0]?.stocks?.map((stock: any) => stock.warehouse?.name) || [];
      const primaryWarehouse = warehouses[0] || "Unknown";

      return {
        id: node.id,
        name: node.name,
        variants: variants.map((v: any) => ({
          id: v.id,
          name: v.name,
          quantityAvailable: v.quantityAvailable || 0,
          quantityOrdered: v.quantityOrdered || 0,
          margin: v.margin || 0,
          stocks: v.stocks || [],
        })),
        stock: totalStock,
        stockStatus,
        category: variants[0]?.name?.includes("Beer")
          ? "Beer"
          : variants[0]?.name?.includes("Wine")
          ? "Wine"
          : variants[0]?.name?.includes("Vodka")
          ? "Vodka"
          : variants[0]?.name?.includes("Gin")
          ? "Gin"
          : variants[0]?.name?.includes("Whisky")
          ? "Whisky"
          : "Spirits",
        warehouse: primaryWarehouse,
        packaging: `${variants.length} variants`,
        reorderLevel: Math.max(20, Math.floor(totalStock * 0.3)), // Arbitrary reorder level
        lastUpdated: new Date().toISOString().split("T")[0], // Current date as placeholder
      };
    }) || [];

  // Extract all unique warehouses
  const warehouses = Array.from(
    new Set(
      inventory?.flatMap((item) =>
        item?.variants
          ?.flatMap((v: any) => v.stocks?.map((s: any) => s.warehouse?.name))
          .filter(Boolean)
      )
    )
  );

  const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = inventory.filter(
    (item) => item.stockStatus === "low-stock"
  ).length;
  const outOfStockCount = inventory.filter(
    (item) => item.stockStatus === "out-of-stock"
  ).length;

  return {
    inventory,
    warehouses,
    stats: {
      totalProducts: inventory.length,
      totalStock,
      lowStockCount,
      outOfStockCount,
      warehouseCount: warehouses.length,
    },
    isLoading: fetching,
    error,
  };
};
