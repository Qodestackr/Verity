
import prisma from "@/lib/prisma";
import { createClient } from "urql";

type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";
type StockMovementSource =
  | "PURCHASE"
  | "SALE"
  | "RETURN"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "COUNT_ADJUSTMENT"
  | "DAMAGE"
  | "LOSS"
  | "OTHER";

interface StockMovementInput {
  warehouseId: string;
  productVariantId: string;
  type: StockMovementType;
  source: StockMovementSource;
  quantity: number;
  unitCost: number;
  totalCost?: number; // Optional, will be calculated if not provided
  reference?: string;
  referenceType?: string;
  notes?: string;
  organizationId: string;
  transactionId?: string;
}

interface SaleorStock {
  id: string;
  quantity: number;
  warehouse: {
    id: string;
    name: string;
  };
  productVariant: {
    id: string;
    name: string;
    sku: string;
    product: {
      id: string;
      name: string;
    };
  };
}

// GraphQL operations
const UPDATE_STOCK_MUTATION = `
  mutation UpdateStock($input: StockUpdateInput!) {
    stockUpdate(input: $input) {
      stock {
        id
        quantity
        warehouse {
          id
        }
        productVariant {
          id
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

const GET_STOCK_QUERY = `
  query GetStock($variantId: ID!, $warehouseId: ID!) {
    stock(productVariant: $variantId, warehouse: $warehouseId) {
      id
      quantity
      warehouse {
        id
        name
      }
      productVariant {
        id
        name
        sku
        product {
          id
          name
        }
      }
    }
  }
`;

export class StockMovementService {
  private saleorClient;

  constructor(apiUrl: string, token: string) {
    this.saleorClient = createClient({
      url: apiUrl,
      fetchOptions: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      },
      exchanges: [],
    });
  }

  // Create a stock movement and update Saleor's inventory
  async createStockMovement(input: StockMovementInput) {
    try {
      // Calc totalCost if not provided
      const totalCost = input.totalCost || input.quantity * input.unitCost;

      // Start a transaction
      return await prisma.$transaction(async (tx) => {
        // 1. Record the stock movement in our database
        const stockMovement = await tx.stockMovement.create({
          data: {
            warehouseId: input.warehouseId,
            productVariantId: input.productVariantId,
            type: input.type,
            source: input.source,
            quantity: input.quantity,
            unitCost: input.unitCost,
            totalCost,
            reference: input.reference,
            referenceType: input.referenceType,
            notes: input.notes,
            organizationId: input.organizationId,
            transactionId: input.transactionId,
          },
        });

        // 2. Update the stock in Saleor
        // Note: For OUT and negative ADJUSTMENT, quantity should be negative
        let saleorQuantity = input.quantity;
        if (
          input.type === "OUT" ||
          (input.type === "ADJUSTMENT" && input.quantity < 0)
        ) {
          saleorQuantity = -Math.abs(input.quantity);
        } else if (
          input.type === "IN" ||
          (input.type === "ADJUSTMENT" && input.quantity > 0)
        ) {
          saleorQuantity = Math.abs(input.quantity);
        }

        // Update Saleor stock
        const result = await this.saleorClient
          .mutation(UPDATE_STOCK_MUTATION, {
            input: {
              variantId: input.productVariantId,
              warehouseId: input.warehouseId,
              quantity: saleorQuantity,
            },
          })
          .toPromise();

        if (result.error) {
          throw new Error(`Saleor API error: ${result.error.message}`);
        }

        if (result.data?.stockUpdate?.errors?.length > 0) {
          throw new Error(
            `Saleor stock update error: ${result.data.stockUpdate.errors[0].message}`
          );
        }

        return stockMovement;
      });
    } catch (error) {
      console.error("Error creating stock movement:", error);
      throw error;
    }
  }

  // Get stock movements with filtering
  async getStockMovements(filters: {
    organizationId: string;
    warehouseId?: string;
    productVariantId?: string;
    type?: StockMovementType;
    source?: StockMovementSource;
    dateFrom?: Date;
    dateTo?: Date;
    reference?: string;
    take?: number;
    skip?: number;
  }) {
    try {
      const {
        organizationId,
        warehouseId,
        productVariantId,
        type,
        source,
        dateFrom,
        dateTo,
        reference,
        take = 100,
        skip = 0,
      } = filters;

      // Build filter object
      const whereClause: any = { organizationId };

      if (warehouseId) whereClause.warehouseId = warehouseId;
      if (productVariantId) whereClause.productVariantId = productVariantId;
      if (type) whereClause.type = type;
      if (source) whereClause.source = source;
      if (reference) whereClause.reference = { contains: reference };

      // Date range
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt.gte = dateFrom;
        if (dateTo) whereClause.createdAt.lte = dateTo;
      }

      // Query with pagination
      const [movements, totalCount] = await Promise.all([
        prisma.stockMovement.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take,
          skip,
          include: {
            transaction: {
              select: {
                id: true,
                type: true,
                amount: true,
                paymentMethod: true,
                reference: true,
              },
            },
          },
        }),
        prisma.stockMovement.count({ where: whereClause }),
      ]);

      return { movements, totalCount };
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      throw error;
    }
  }

  // Get current stock from Saleor
  async getCurrentStock(
    variantId: string,
    warehouseId: string
  ): Promise<SaleorStock | null> {
    try {
      const result = await this.saleorClient
        .query(GET_STOCK_QUERY, {
          variantId,
          warehouseId,
        })
        .toPromise();

      if (result.error) {
        throw new Error(`Saleor API error: ${result.error.message}`);
      }

      return result.data?.stock;
    } catch (error) {
      console.error("Error fetching current stock:", error);
      throw error;
    }
  }

  // Calc daily stock movement summary
  async getDailyStockMovementSummary(
    date: Date,
    organizationId: string,
    warehouseId?: string
  ) {
    try {
      // Set date range for the entire day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Base filter
      const baseFilter: any = {
        organizationId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };

      if (warehouseId) {
        baseFilter.warehouseId = warehouseId;
      }

      // Get all movements for the day
      const movements = await prisma.stockMovement.findMany({
        where: baseFilter,
        orderBy: { createdAt: "asc" },
      });

      // Initialize summary
      const summary = {
        date: startOfDay,
        totalIn: 0,
        totalOut: 0,
        totalAdjustments: 0,
        netChange: 0,
        financialImpact: {
          totalInCost: 0,
          totalOutCost: 0,
          totalAdjustmentCost: 0,
          netCost: 0,
          currency: "KES", // Default currency
        },
        byCategory: new Map(),
      };

      // Process each movement
      for (const movement of movements) {
        const quantity = movement.quantity;
        const cost = movement.totalCost;

        // Update by movement type
        if (movement.type === "IN") {
          summary.totalIn += quantity;
          summary.financialImpact.totalInCost += cost;
        } else if (movement.type === "OUT") {
          summary.totalOut += Math.abs(quantity);
          summary.financialImpact.totalOutCost += Math.abs(cost);
        } else if (movement.type === "ADJUSTMENT") {
          summary.totalAdjustments += quantity;

          if (quantity > 0) {
            summary.financialImpact.totalAdjustmentCost += cost;
          } else {
            summary.financialImpact.totalAdjustmentCost += cost; // This will be negative for negative adjustments
          }
        }

        // Update net change
        summary.netChange =
          summary.totalIn - summary.totalOut + summary.totalAdjustments;

        // Update financial impact
        summary.financialImpact.netCost =
          summary.financialImpact.totalInCost -
          summary.financialImpact.totalOutCost +
          summary.financialImpact.totalAdjustmentCost;
      }

      return summary;
    } catch (error) {
      console.error("Error calculating stock movement summary:", error);
      throw error;
    }
  }

  // Record a stock taking (inventory count)
  async recordStockTaking(input: {
    warehouseId: string;
    organizationId: string;
    items: Array<{
      productVariantId: string;
      countedQuantity: number;
      unitCost: number;
      note?: string;
    }>;
    transactionId?: string;
  }) {
    try {
      const { warehouseId, organizationId, items, transactionId } = input;

      // Process each item
      const stockMovements = await Promise.all(
        items.map(async (item) => {
          // 1. Get current stock from Saleor
          const currentStock = await this.getCurrentStock(
            item.productVariantId,
            warehouseId
          );

          if (!currentStock) {
            throw new Error(
              `Stock not found for variant ${item.productVariantId} in warehouse ${warehouseId}`
            );
          }

          // 2. Calculate difference
          const difference = item.countedQuantity - currentStock.quantity;

          if (difference === 0) {
            return null; // No adjustment needed
          }

          // 3. Create stock movement
          return this.createStockMovement({
            warehouseId,
            productVariantId: item.productVariantId,
            type: "ADJUSTMENT",
            source: "COUNT_ADJUSTMENT",
            quantity: difference,
            unitCost: item.unitCost,
            totalCost: difference * item.unitCost,
            notes: item.note || "Inventory count adjustment",
            organizationId,
            transactionId,
            referenceType: "ADJUSTMENT",
          });
        })
      );

      // Filter out null values (no adjustment needed)
      return stockMovements.filter(Boolean);
    } catch (error) {
      console.error("Error recording stock taking:", error);
      throw error;
    }
  }
}

// Singleton instance for the application
let stockMovementService: StockMovementService | null = null;

// Initialize the service
export function initStockMovementService(apiUrl: string, token: string) {
  stockMovementService = new StockMovementService(apiUrl, token);
  return stockMovementService;
}

// Get the initialized service
export function getStockMovementService() {
  if (!stockMovementService) {
    throw new Error("Stock movement service not initialized");
  }
  return stockMovementService;
}
