import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

// Get profit and loss report
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
    const period = searchParams.get("period") || "monthly"; // monthly, quarterly, yearly
    const year = Number.parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );
    const month = searchParams.get("month")
      ? Number.parseInt(searchParams.get("month"))
      : null;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `reports:profit-loss:${organizationId}:${period}:${year}:${
      month || "all"
    }`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Determine date range based on period
    let startDate, endDate;
    const periodLabels = [];

    if (period === "monthly" && month !== null) {
      // Specific month
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
      periodLabels.push(`${year}-${String(month).padStart(2, "0")}`);
    } else if (period === "monthly") {
      // All months in year
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
      for (let i = 0; i < 12; i++) {
        periodLabels.push(`${year}-${String(i + 1).padStart(2, "0")}`);
      }
    } else if (period === "quarterly") {
      // All quarters in year
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
      for (let i = 0; i < 4; i++) {
        periodLabels.push(`${year}-Q${i + 1}`);
      }
    } else {
      // Yearly
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
      periodLabels.push(`${year}`);
    }

    // Get all sales in the date range
    const sales = await prisma.order.findMany({
      where: {
        organizationId,
        orderDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: "CANCELLED",
        },
      },
    });

    // Get all expenses in the date range
    const expenses = await prisma.expense.findMany({
      where: {
        organizationId,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    // Process data based on period
    const profitLossByPeriod: Record<
      string,
      {
        revenue: number;
        expenses: number;
        profit: number;
        margin: number;
      }
    > = {};

    // Init periods
    periodLabels.forEach((label) => {
      profitLossByPeriod[label] = {
        revenue: 0,
        expenses: 0,
        profit: 0,
        margin: 0,
      };
    });

    // Process sales
    sales.forEach((sale) => {
      const saleDate = new Date(sale.orderDate);
      let periodKey;

      if (period === "monthly") {
        periodKey = `${saleDate.getFullYear()}-${String(
          saleDate.getMonth() + 1
        ).padStart(2, "0")}`;
      } else if (period === "quarterly") {
        const quarter = Math.floor(saleDate.getMonth() / 3) + 1;
        periodKey = `${saleDate.getFullYear()}-Q${quarter}`;
      } else {
        periodKey = `${saleDate.getFullYear()}`;
      }

      if (profitLossByPeriod[periodKey]) {
        profitLossByPeriod[periodKey].revenue += sale.finalAmount;
      }
    });

    // Process expenses
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.expenseDate);
      let periodKey;

      if (period === "monthly") {
        periodKey = `${expenseDate.getFullYear()}-${String(
          expenseDate.getMonth() + 1
        ).padStart(2, "0")}`;
      } else if (period === "quarterly") {
        const quarter = Math.floor(expenseDate.getMonth() / 3) + 1;
        periodKey = `${expenseDate.getFullYear()}-Q${quarter}`;
      } else {
        periodKey = `${expenseDate.getFullYear()}`;
      }

      if (profitLossByPeriod[periodKey]) {
        profitLossByPeriod[periodKey].expenses += expense.amount;
      }
    });

    // Calc profit and margin
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalProfit = 0;

    Object.keys(profitLossByPeriod).forEach((key) => {
      const data = profitLossByPeriod[key];
      data.profit = data.revenue - data.expenses;
      data.margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;

      totalRevenue += data.revenue;
      totalExpenses += data.expenses;
    });

    totalProfit = totalRevenue - totalExpenses;
    const overallMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Prepare the result
    const result = {
      summary: {
        totalRevenue,
        totalExpenses,
        totalProfit,
        overallMargin,
        period,
        year,
        month,
      },
      profitLossByPeriod: Object.entries(profitLossByPeriod).map(
        ([period, data]) => ({
          period,
          ...data,
        })
      ),
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 3); // 3 hrs TTL

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating profit-loss report:", error);
    return NextResponse.json(
      { error: "Failed to generate profit-loss report" },
      { status: 500 }
    );
  }
}
