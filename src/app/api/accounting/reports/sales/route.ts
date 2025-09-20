import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

// Get sales reports
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
    const period = searchParams.get("period") || "daily"; // daily, weekly, monthly, yearly
    const startDate =
      searchParams.get("startDate") ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get("endDate") || new Date().toISOString();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `reports:sales:${organizationId}:${period}:${startDate}:${endDate}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Get all orders in the date range
    const orders = await prisma.order.findMany({
      where: {
        organizationId,
        orderDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        items: true,
      },
    });

    // Process data based on period
    const salesByPeriod: any = {};
    let totalSales = 0;
    const totalOrders = orders.length;
    let averageOrderValue = 0;

    orders.forEach((order) => {
      totalSales += order.finalAmount;

      let periodKey;
      const orderDate = new Date(order.orderDate);

      switch (period) {
        case "daily":
          periodKey = orderDate.toISOString().split("T")[0];
          break;
        case "weekly":
          const weekStart = new Date(orderDate);
          weekStart.setDate(orderDate.getDate() - orderDate.getDay());
          periodKey = weekStart.toISOString().split("T")[0];
          break;
        case "monthly":
          periodKey = `${orderDate.getFullYear()}-${String(
            orderDate.getMonth() + 1
          ).padStart(2, "0")}`;
          break;
        case "yearly":
          periodKey = `${orderDate.getFullYear()}`;
          break;
        default:
          periodKey = orderDate.toISOString().split("T")[0];
      }

      if (!salesByPeriod[periodKey]) {
        salesByPeriod[periodKey] = {
          sales: 0,
          orders: 0,
          items: 0,
        };
      }

      salesByPeriod[periodKey].sales += order.finalAmount;
      salesByPeriod[periodKey].orders += 1;
      salesByPeriod[periodKey].items += order.items.length;
    });

    // Calc average order value
    if (totalOrders > 0) {
      averageOrderValue = totalSales / totalOrders;
    }

    // Get top selling products
    const productSales: Record<string, { quantity: number; revenue: number }> =
      {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.totalPrice;
      });
    });

    // Convert to array and sort by quantity
    const topProducts = Object.entries(productSales)
      .map(([productId, data]) => ({
        productId,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const result = {
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
        period,
        startDate,
        endDate,
      },
      salesByPeriod: Object.entries(salesByPeriod).map(([period, data]) => ({
        period,
        ...data,
      })),
      topProducts,
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 3); // 3 hrs TTL

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating sales report:", error);
    return NextResponse.json(
      { error: "Failed to generate sales report" },
      { status: 500 }
    );
  }
}
