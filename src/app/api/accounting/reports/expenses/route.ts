import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

//Get expense reports
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
    const period = searchParams.get("period") || "monthly"; // daily, weekly, monthly, yearly
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

    const cacheKey = `reports:expenses:${organizationId}:${period}:${startDate}:${endDate}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Get all expenses in the date range
    const expenses = await prisma.expense.findMany({
      where: {
        organizationId,
        expenseDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        category: true,
      },
    });

    // Process data based on period
    const expensesByPeriod: any = {};
    let totalExpenses = 0;
    const expensesByCategory: Record<
      string,
      { amount: number; categoryName: string }
    > = {};

    expenses.forEach((expense) => {
      totalExpenses += expense.amount;

      let periodKey;
      const expenseDate = new Date(expense.expenseDate);

      switch (period) {
        case "daily":
          periodKey = expenseDate.toISOString().split("T")[0];
          break;
        case "weekly":
          const weekStart = new Date(expenseDate);
          weekStart.setDate(expenseDate.getDate() - expenseDate.getDay());
          periodKey = weekStart.toISOString().split("T")[0];
          break;
        case "monthly":
          periodKey = `${expenseDate.getFullYear()}-${String(
            expenseDate.getMonth() + 1
          ).padStart(2, "0")}`;
          break;
        case "yearly":
          periodKey = `${expenseDate.getFullYear()}`;
          break;
        default:
          periodKey = expenseDate.toISOString().split("T")[0];
      }

      if (!expensesByPeriod[periodKey]) {
        expensesByPeriod[periodKey] = {
          amount: 0,
          count: 0,
        };
      }

      expensesByPeriod[periodKey].amount += expense.amount;
      expensesByPeriod[periodKey].count += 1;

      // Track expenses by category
      const categoryId = expense.categoryId;
      const categoryName = expense.category.name;

      if (!expensesByCategory[categoryId]) {
        expensesByCategory[categoryId] = {
          amount: 0,
          categoryName,
        };
      }

      expensesByCategory[categoryId].amount += expense.amount;
    });

    // Convert to array and sort
    const expenseCategories = Object.entries(expensesByCategory)
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.categoryName,
        amount: data.amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Prepare the result
    const result = {
      summary: {
        totalExpenses,
        totalCount: expenses.length,
        period,
        startDate,
        endDate,
      },
      expensesByPeriod: Object.entries(expensesByPeriod).map(
        ([period, data]) => ({
          period,
          ...data,
        })
      ),
      expensesByCategory: expenseCategories,
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 3); // 3 hrs TTL

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating expense report:", error);
    return NextResponse.json(
      { error: "Failed to generate expense report" },
      { status: 500 }
    );
  }
}
