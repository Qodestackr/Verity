import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

// Get budget variance report
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
    const includeProjections = searchParams.get("projections") === "true";

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `reports:budget-variance:${organizationId}:${period}:${year}:${
      month || "all"
    }:${includeProjections}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Determine date range based on period
    let startDate, endDate;
    const periodLabels = [];
    const today = new Date();

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

    // Get all budgets that overlap with the date range
    const budgets = await prisma.budget.findMany({
      where: {
        organizationId,
        startDate: {
          lte: endDate,
        },
        endDate: {
          gte: startDate,
        },
      },
      include: {
        allocations: true,
      },
      orderBy: {
        startDate: "asc",
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

    // Get all categories
    const categories = await prisma.expenseCategory.findMany({
      where: {
        organizationId,
      },
    });

    // Process data based on period
    const varianceByPeriod: Record<
      string,
      {
        budgeted: Record<string, number>;
        actual: Record<string, number>;
        variance: Record<string, number>;
        percentUsed: Record<string, number>;
        totalBudgeted: number;
        totalActual: number;
        totalVariance: number;
        totalPercentUsed: number;
        isProjected: boolean;
      }
    > = {};

    // Initialize periods
    periodLabels.forEach((label) => {
      const categoryBudgets: Record<string, number> = {};
      const categoryActuals: Record<string, number> = {};
      const categoryVariances: Record<string, number> = {};
      const categoryPercentages: Record<string, number> = {};

      categories.forEach((category) => {
        categoryBudgets[category.id] = 0;
        categoryActuals[category.id] = 0;
        categoryVariances[category.id] = 0;
        categoryPercentages[category.id] = 0;
      });

      varianceByPeriod[label] = {
        budgeted: categoryBudgets,
        actual: categoryActuals,
        variance: categoryVariances,
        percentUsed: categoryPercentages,
        totalBudgeted: 0,
        totalActual: 0,
        totalVariance: 0,
        totalPercentUsed: 0,
        isProjected: false,
      };
    });

    // Process budgets
    budgets.forEach((budget) => {
      // Determine which periods this budget covers
      const budgetStart = new Date(budget.startDate);
      const budgetEnd = new Date(budget.endDate);

      // Calc monthly allocation amounts
      const totalMonths = Math.max(
        1,
        Math.ceil(
          (budgetEnd.getTime() - budgetStart.getTime()) /
            (30 * 24 * 60 * 60 * 1000)
        )
      );
      const monthlyAllocations: Record<string, number> = {};

      budget.allocations.forEach((allocation) => {
        monthlyAllocations[allocation.categoryId] =
          allocation.amount / totalMonths;
      });

      // Distribute budget across periods
      periodLabels.forEach((label) => {
        let periodStart, periodEnd;

        if (label.includes("-Q")) {
          // Quarterly period
          const [yearStr, quarterStr] = label.split("-Q");
          const quarterYear = Number.parseInt(yearStr);
          const quarter = Number.parseInt(quarterStr);
          periodStart = new Date(quarterYear, (quarter - 1) * 3, 1);
          periodEnd = new Date(quarterYear, quarter * 3, 0);
        } else if (label.includes("-")) {
          // Monthly period
          const [yearStr, monthStr] = label.split("-");
          const monthYear = Number.parseInt(yearStr);
          const month = Number.parseInt(monthStr);
          periodStart = new Date(monthYear, month - 1, 1);
          periodEnd = new Date(monthYear, month, 0);
        } else {
          // Yearly period
          const yearInt = Number.parseInt(label);
          periodStart = new Date(yearInt, 0, 1);
          periodEnd = new Date(yearInt, 11, 31);
        }

        // Check if budget overlaps with this period
        if (budgetEnd >= periodStart && budgetStart <= periodEnd) {
          // Calc overlap percentage (for partial periods)
          const overlapStart = new Date(
            Math.max(budgetStart.getTime(), periodStart.getTime())
          );
          const overlapEnd = new Date(
            Math.min(budgetEnd.getTime(), periodEnd.getTime())
          );
          const overlapDays = Math.ceil(
            (overlapEnd.getTime() - overlapStart.getTime()) /
              (24 * 60 * 60 * 1000)
          );
          const periodDays = Math.ceil(
            (periodEnd.getTime() - periodStart.getTime()) /
              (24 * 60 * 60 * 1000)
          );
          const overlapRatio = overlapDays / periodDays;

          // Add budget amounts to period
          budget.allocations.forEach((allocation) => {
            const periodAmount =
              (allocation.amount / totalMonths) * overlapRatio;
            varianceByPeriod[label].budgeted[allocation.categoryId] +=
              periodAmount;
            varianceByPeriod[label].totalBudgeted += periodAmount;
          });
        }
      });
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

      if (varianceByPeriod[periodKey]) {
        varianceByPeriod[periodKey].actual[expense.categoryId] +=
          expense.amount;
        varianceByPeriod[periodKey].totalActual += expense.amount;
      }
    });

    // Calc variance and percentages
    periodLabels.forEach((label) => {
      const periodData = varianceByPeriod[label];

      // Check if this is a future period (for projections)
      const isPeriodInFuture = label.includes("-Q")
        ? Number.parseInt(label.split("-Q")[0]) > today.getFullYear() ||
          (Number.parseInt(label.split("-Q")[0]) === today.getFullYear() &&
            Number.parseInt(label.split("-Q")[1]) >
              Math.floor(today.getMonth() / 3) + 1)
        : label.includes("-")
        ? Number.parseInt(label.split("-")[0]) > today.getFullYear() ||
          (Number.parseInt(label.split("-")[0]) === today.getFullYear() &&
            Number.parseInt(label.split("-")[1]) > today.getMonth() + 1)
        : Number.parseInt(label) > today.getFullYear();

      periodData.isProjected = isPeriodInFuture;

      // Calc variance and percentages for each category
      categories.forEach((category) => {
        const budgeted = periodData.budgeted[category.id] || 0;
        const actual = periodData.actual[category.id] || 0;

        periodData.variance[category.id] = budgeted - actual;
        periodData.percentUsed[category.id] =
          budgeted > 0 ? (actual / budgeted) * 100 : 0;
      });

      // Calc totals
      periodData.totalVariance =
        periodData.totalBudgeted - periodData.totalActual;
      periodData.totalPercentUsed =
        periodData.totalBudgeted > 0
          ? (periodData.totalActual / periodData.totalBudgeted) * 100
          : 0;
    });

    // Filter out future periods if projections are not requested
    const filteredPeriods = includeProjections
      ? periodLabels
      : periodLabels.filter((label) => !varianceByPeriod[label].isProjected);

    // Prepare the result
    const result = {
      period: {
        type: period,
        year,
        month: month || null,
        startDate,
        endDate,
      },
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
      variance: filteredPeriods.map((label) => ({
        period: label,
        ...varianceByPeriod[label],
      })),
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 3); // 3 hrs TTL

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating budget variance report:", error);
    return NextResponse.json(
      { error: "Failed to generate budget variance report" },
      { status: 500 }
    );
  }
}
