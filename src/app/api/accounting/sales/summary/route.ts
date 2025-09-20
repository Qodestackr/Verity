import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

export async function GET(request: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Create a cache key based on the query parameters
    const cacheKey = `sales:summary:${organizationId}:${startDate || "all"}:${
      endDate || "all"
    }:${category || "all"}`;

    // Try to get cached data first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Build the query
    const where: any = { organizationId };

    // Add date filters if provided
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    // Only include completed orders
    where.status = "COMPLETED";

    // Get orders with their items
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
    });

    // Process the orders to create summary data
    const productSummary: Record<string, any> = {};
    const categorySummary: Record<string, any> = {};

    let totalRevenue = 0;
    let totalQuantity = 0;

    // Process each order
    for (const order of orders) {
      totalRevenue += order.finalAmount;

      // Process each item in the order
      for (const item of order.items) {
        // Get product details from database
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) continue;

        // Skip if category filter is applied and doesn't match
        if (category && product.category !== category) continue;

        // Update product summary
        if (!productSummary[item.productId]) {
          productSummary[item.productId] = {
            productId: item.productId,
            name: product.name,
            category: product.category || "Uncategorized",
            quantity: 0,
            revenue: 0,
            cost: 0,
          };
        }

        productSummary[item.productId].quantity += item.quantity;
        productSummary[item.productId].revenue += item.totalPrice;
        productSummary[item.productId].cost +=
          (product.cost || 0) * item.quantity;
        totalQuantity += item.quantity;

        // Update category summary
        const categoryName = product.category || "Uncategorized";
        if (!categorySummary[categoryName]) {
          categorySummary[categoryName] = {
            category: categoryName,
            quantity: 0,
            revenue: 0,
            cost: 0,
            productCount: 0,
            products: new Set(),
          };
        }

        categorySummary[categoryName].quantity += item.quantity;
        categorySummary[categoryName].revenue += item.totalPrice;
        categorySummary[categoryName].cost +=
          (product.cost || 0) * item.quantity;
        categorySummary[categoryName].products.add(item.productId);
      }
    }

    // Calculate profit and other metrics
    const productSummaryArray = Object.values(productSummary).map(
      (product: any) => {
        const profit = product.revenue - product.cost;
        const profitMargin =
          product.revenue > 0 ? (profit / product.revenue) * 100 : 0;

        return {
          ...product,
          profit,
          profitMargin,
        };
      }
    );

    const categorySummaryArray = Object.values(categorySummary).map(
      (category: any) => {
        const profit = category.revenue - category.cost;
        const profitMargin =
          category.revenue > 0 ? (profit / category.revenue) * 100 : 0;
        const productCount = category.products.size;

        // Remove the Set before serializing
        const { products, ...rest } = category;

        return {
          ...rest,
          profit,
          profitMargin,
          productCount,
        };
      }
    );

    // Calculate overall summary
    const totalCost = Object.values(productSummary).reduce(
      (sum: number, product: any) => sum + product.cost,
      0
    );
    const totalProfit = totalRevenue - totalCost;
    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    const result = {
      summary: {
        totalRevenue,
        totalProfit,
        totalQuantity,
        averageOrderValue,
        profitMargin,
        totalOrders: orders.length,
      },
      products: productSummaryArray,
      categories: categorySummaryArray,
    };

    // Cache the result for 1 hour
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating sales summary:", error);
    return NextResponse.json(
      { error: "Failed to generate sales summary" },
      { status: 500 }
    );
  }
}
