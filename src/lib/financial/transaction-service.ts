import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { createClient } from "urql";
import { getStockMovementService } from "@/lib/inventory/stock-movement-service";
import { POSPaymentMethod } from "@prisma/client";

// Types to match our schema
type TransactionType =
  | "SALE"
  | "PURCHASE"
  | "EXPENSE"
  | "INCOME"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "OTHER";

type PaymentMethod = "CASH" | "MPESA" | "CARD" | "BANK" | "CREDIT" | "OTHER";

interface CreateTransactionInput {
  tillId: string;
  type: TransactionType;
  amount: number; // in cents, positive for IN, negative for OUT
  paymentMethod: PaymentMethod;
  reference: string;
  description?: string;
  metadata?: Record<string, any>;
  organizationId: string;
}

interface CreateSaleTransactionInput {
  tillId: string;
  channelId: string;
  orderLines: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
  }>;
  paymentMethod: PaymentMethod;
  customerEmail?: string;
  customerPhone?: string;
  customerNote?: string;
  organizationId: string;
}

interface CreatePurchaseTransactionInput {
  tillId: string;
  supplierId: string;
  paymentMethod: PaymentMethod;
  reference: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitCost: number;
  }>;
  notes?: string;
  organizationId: string;
}

interface CreateExpenseTransactionInput {
  tillId: string;
  amount: number; // in cents, positive value (will be stored as negative)
  paymentMethod: PaymentMethod;
  category: string;
  reference?: string;
  notes?: string;
  organizationId: string;
}

// GraphQL operations for Saleor
const CREATE_ORDER_MUTATION = `
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
`;

export class TransactionService {
  private saleorClient;

  constructor(apiUrl: string, token: string) {
    this.saleorClient = createClient({
      url: apiUrl,
      fetchOptions: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      },
    });
  }

  // Create a basic transaction
  async createTransaction(input: CreateTransactionInput) {
    try {
      return await prisma.pOSTransaction.create({
        data: {
          tillId: input.tillId,
          amount: input.amount,
          paymentMethod: input.paymentMethod as POSPaymentMethod,
          organizationId: input.organizationId,
          receiptNumber: input.reference,
        },
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  // Create a sale transaction with related order
  async createSaleTransaction(input: CreateSaleTransactionInput) {
    try {
      // Calc total amount
      const totalAmount = input.orderLines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0
      );

      // Start a transaction
      return await prisma.$transaction(async (tx) => {
        // 1. Create the base transaction
        const transaction = await tx.transaction.create({
          data: {
            tillId: input.tillId,
            type: "SALE",
            amount: totalAmount, // This is positive for sales
            paymentMethod: input.paymentMethod,
            reference: `ORD-${Date.now().toString(36).toUpperCase()}`, // Generate a reference
            description: "POS Sale",
            organizationId: input.organizationId,
          },
        });

        // 2. Create a Saleor order
        const orderInput = {
          channel: input.channelId,
          billingAddress: {
            firstName: "POS",
            lastName: "Customer",
            country: "KE",
          },
          customerNote: input.customerNote,
          lines: input.orderLines.map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
          })),
        };

        const result = await this.saleorClient
          .mutation(CREATE_ORDER_MUTATION, {
            input: orderInput,
          })
          .toPromise();

        if (result.error) {
          throw new Error(`Saleor API error: ${result.error.message}`);
        }

        if (result.data?.orderCreate?.errors?.length > 0) {
          throw new Error(
            `Saleor order creation error: ${result.data.orderCreate.errors[0].message}`
          );
        }

        const order = result.data.orderCreate.order;

        // 3. Create order transaction details
        const orderTransaction = await tx.orderTransaction.create({
          data: {
            transactionId: transaction.id,
            orderSaleorId: order.id,
            orderNumber: order.number,
            subtotal: totalAmount, // Without tax
            tax: 0, // Assume tax is included in line prices
            total: totalAmount,
            items: {
              createMany: {
                data: input.orderLines.map((line) => ({
                  productVariantId: line.variantId,
                  productName: "Product", // This would need to be fetched from Saleor
                  productSku: "SKU", // This would need to be fetched from Saleor
                  quantity: line.quantity,
                  unitPrice: line.unitPrice,
                  unitCost: line.unitCost,
                  totalPrice: line.unitPrice * line.quantity,
                })),
              },
            },
          },
        });

        // 4. Create stock movements for each line
        const stockMovementService = getStockMovementService();
        const stockMovements = [];

        for (const line of input.orderLines) {
          // For each line item, create a stock movement
          const stockMovement = await stockMovementService.createStockMovement({
            warehouseId: "default-warehouse-id", // This should be retrieved from channel config
            productVariantId: line.variantId,
            type: "OUT",
            source: "SALE",
            quantity: line.quantity,
            unitCost: line.unitCost,
            totalCost: line.unitCost * line.quantity,
            reference: order.id,
            referenceType: "ORDER",
            organizationId: input.organizationId,
            transactionId: transaction.id,
          });

          stockMovements.push(stockMovement);
        }

        return {
          transaction,
          orderTransaction,
          saleorOrder: order,
          stockMovements,
        };
      });
    } catch (error) {
      console.error("Error creating sale transaction:", error);
      throw error;
    }
  }

  // Create a purchase transaction with stock movements
  async createPurchaseTransaction(input: CreatePurchaseTransactionInput) {
    try {
      // Calc total amount
      const totalAmount = input.items.reduce(
        (sum, item) => sum + item.unitCost * item.quantity,
        0
      );

      // Start a transaction
      return await prisma.$transaction(async (tx) => {
        // 1. Create the base transaction (negative amount for outgoing money)
        const transaction = await tx.transaction.create({
          data: {
            tillId: input.tillId,
            type: "PURCHASE",
            amount: -totalAmount, // Negative for purchases (money going out)
            paymentMethod: input.paymentMethod,
            reference: input.reference,
            description: "Stock Purchase",
            organizationId: input.organizationId,
          },
        });

        // 2. Create purchase transaction details
        const purchaseTransaction = await tx.purchaseTransaction.create({
          data: {
            transactionId: transaction.id,
            supplierId: input.supplierId,
            purchaseNumber: input.reference,
            status: "COMPLETE", // Assume it's complete for simplicity
            deliveryDate: new Date(),
            subtotal: totalAmount,
            tax: 0, // Assume tax is included
            total: totalAmount,
            items: {
              createMany: {
                data: input.items.map((item) => ({
                  productVariantId: item.variantId,
                  productName: "Product", // This would need to be fetched
                  productSku: "SKU", // This would need to be fetched
                  quantity: item.quantity,
                  receivedQuantity: item.quantity, // Assume full receipt
                  unitCost: item.unitCost,
                  totalCost: item.unitCost * item.quantity,
                })),
              },
            },
          },
        });

        // 3. Create stock movements for each item
        const stockMovementService = getStockMovementService();
        const stockMovements = [];

        for (const item of input.items) {
          // For each item, create a stock movement (IN for purchases)
          const stockMovement = await stockMovementService.createStockMovement({
            warehouseId: "default-warehouse-id", // This should be retrieved from config
            productVariantId: item.variantId,
            type: "IN",
            source: "PURCHASE",
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.unitCost * item.quantity,
            reference: input.reference,
            referenceType: "PURCHASE",
            notes: input.notes,
            organizationId: input.organizationId,
            transactionId: transaction.id,
          });

          stockMovements.push(stockMovement);
        }

        return {
          transaction,
          purchaseTransaction,
          stockMovements,
        };
      });
    } catch (error) {
      console.error("Error creating purchase transaction:", error);
      throw error;
    }
  }

  // Create an expense transaction
  async createExpenseTransaction(input: CreateExpenseTransactionInput) {
    try {
      // Start a transaction
      return await prisma.$transaction(async (tx) => {
        // 1. Create the base transaction (negative amount for outgoing money)
        const transaction = await tx.transaction.create({
          data: {
            tillId: input.tillId,
            type: "EXPENSE",
            amount: -input.amount, // Negative for expenses (money going out)
            paymentMethod: input.paymentMethod,
            reference:
              input.reference || `EXP-${Date.now().toString(36).toUpperCase()}`,
            description: `Expense: ${input.category}`,
            organizationId: input.organizationId,
          },
        });

        // 2. Create expense transaction details
        const expenseTransaction = await tx.expenseTransaction.create({
          data: {
            transactionId: transaction.id,
            category: input.category,
            notes: input.notes,
          },
        });

        return { transaction, expenseTransaction };
      });
    } catch (error) {
      console.error("Error creating expense transaction:", error);
      throw error;
    }
  }

  // Get transactions with filtering
  async getTransactions(filters: {
    organizationId: string;
    tillId?: string;
    type?: TransactionType | TransactionType[];
    paymentMethod?: PaymentMethod | PaymentMethod[];
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
    take?: number;
    skip?: number;
  }) {
    try {
      const {
        organizationId,
        tillId,
        type,
        paymentMethod,
        dateFrom,
        dateTo,
        search,
        take = 100,
        skip = 0,
      } = filters;

      // Build filter object
      const whereClause: any = { organizationId };

      if (tillId) whereClause.tillId = tillId;

      if (type) {
        if (Array.isArray(type)) {
          whereClause.type = { in: type };
        } else {
          whereClause.type = type;
        }
      }

      if (paymentMethod) {
        if (Array.isArray(paymentMethod)) {
          whereClause.paymentMethod = { in: paymentMethod };
        } else {
          whereClause.paymentMethod = paymentMethod;
        }
      }

      // Date range
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt.gte = dateFrom;
        if (dateTo) whereClause.createdAt.lte = dateTo;
      }

      // Search in reference, description, or metadata
      if (search) {
        whereClause.OR = [
          { reference: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      // Query with pagination
      const [transactions, totalCount] = await Promise.all([
        prisma.transaction.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take,
          skip,
          include: {
            orderDetails: {
              include: {
                items: true,
              },
            },
            purchaseDetails: {
              include: {
                items: true,
                supplier: true,
              },
            },
            expenseDetails: true,
            stockMovements: {
              select: {
                id: true,
                type: true,
                source: true,
                quantity: true,
                productVariantId: true,
              },
            },
          },
        }),
        prisma.transaction.count({ where: whereClause }),
      ]);

      return { transactions, totalCount };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }

  // Generate a daily financial report
  async generateDailyFinancialReport(
    date: Date,
    organizationId: string,
    tillId?: string
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

      if (tillId) {
        baseFilter.tillId = tillId;
      }

      // Get all transactions for the day
      const transactions = await prisma.transaction.findMany({
        where: baseFilter,
        orderBy: { createdAt: "asc" },
        include: {
          orderDetails: {
            include: {
              items: true,
            },
          },
          purchaseDetails: {
            include: {
              items: true,
            },
          },
          expenseDetails: true,
          stockMovements: true,
        },
      });

      // Get till information if specified
      let tillInfo = null;
      if (tillId) {
        tillInfo = await prisma.till.findUnique({
          where: { id: tillId },
        });
      }

      // Initialize summary
      const summary = {
        date: startOfDay,
        tillId: tillId,
        openingBalance: tillInfo?.openingBalance || 0,
        closingBalance: tillInfo?.closingBalance || 0,
        totalSales: 0,
        totalExpenses: 0,
        totalPurchases: 0,
        netCashFlow: 0,
        transactions: transactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          paymentMethod: t.paymentMethod,
          reference: t.reference,
          createdAt: t.createdAt,
        })),
        salesByCategory: new Map(),
        salesByPaymentMethod: new Map(),
        topSellingProducts: new Map(),
      };

      // Process transactions
      for (const tx of transactions) {
        const amount = tx.amount;

        // Update totals based on transaction type
        if (tx.type === "SALE") {
          summary.totalSales += amount;

          // Update payment method breakdown
          const method = tx.paymentMethod;
          const current = summary.salesByPaymentMethod.get(method) || 0;
          summary.salesByPaymentMethod.set(method, current + amount);

          // Process order items for category and product breakdown
          if (tx.orderDetails?.items) {
            for (const item of tx.orderDetails.items) {
              // Category aggregation
              const category = "Unknown"; // Would come from product metadata
              const currentCategoryAmount = summary.salesByCategory.get(
                category
              ) || { amount: 0, quantity: 0 };
              summary.salesByCategory.set(category, {
                amount: currentCategoryAmount.amount + item.totalPrice,
                quantity: currentCategoryAmount.quantity + item.quantity,
              });

              // Product aggregation for top sellers
              const productKey = item.productVariantId;
              const currentProduct = summary.topSellingProducts.get(
                productKey
              ) || {
                product: { id: item.productVariantId, name: item.productName },
                quantity: 0,
                revenue: 0,
              };

              summary.topSellingProducts.set(productKey, {
                product: currentProduct.product,
                quantity: currentProduct.quantity + item.quantity,
                revenue: currentProduct.revenue + item.totalPrice,
              });
            }
          }
        } else if (tx.type === "EXPENSE") {
          summary.totalExpenses += Math.abs(amount); // Amount is negative for expenses
        } else if (tx.type === "PURCHASE") {
          summary.totalPurchases += Math.abs(amount); // Amount is negative for purchases
        }
      }

      // Calc net cash flow
      summary.netCashFlow =
        summary.totalSales - summary.totalExpenses - summary.totalPurchases;

      // Convert maps to arrays for easier serialization
      const result = {
        ...summary,
        salesByCategory: Array.from(summary.salesByCategory.entries()).map(
          ([category, data]) => ({
            category,
            amount: data.amount,
            quantity: data.quantity,
          })
        ),
        salesByPaymentMethod: Array.from(
          summary.salesByPaymentMethod.entries()
        ).map(([method, amount]) => ({
          method,
          amount,
        })),
        topSellingProducts: Array.from(summary.topSellingProducts.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10),
      };

      // Save the report
      await prisma.financialReport.create({
        data: {
          organizationId,
          tillId,
          reportType: "DAILY",
          reportDate: startOfDay,
          data: result,
        },
      });

      return result;
    } catch (error) {
      console.error("Error generating daily financial report:", error);
      throw error;
    }
  }
}

// Singleton instance
let transactionService: TransactionService | null = null;

// Initialize the service
export function initTransactionService(apiUrl: string, token: string) {

  transactionService = new TransactionService(apiUrl, token);
  return transactionService;
}

// Get the initialized service
export function getTransactionService() {
  if (!transactionService) {
    throw new Error("Transaction service not initialized");
  }
  return transactionService;
}
