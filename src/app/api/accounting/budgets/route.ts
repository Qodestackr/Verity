import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

// Get all budgets with allocations
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
    const year =
      searchParams.get("year") || new Date().getFullYear().toString();
    const month =
      searchParams.get("month") ||
      (new Date().getMonth() + 1).toString().padStart(2, "0");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `budgets:${organizationId}:${year}:${month}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Find active budget for the given period
    const startOfMonth = new Date(`${year}-${month}-01`);
    const endOfMonth = new Date(
      new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1) - 1
    );

    const budgets = await prisma.budget.findMany({
      where: {
        organizationId,
        startDate: {
          lte: endOfMonth,
        },
        endDate: {
          gte: startOfMonth,
        },
      },
      include: {
        allocations: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    // Get actual expenses for the period to compare with budget
    const expenses = await prisma.expense.findMany({
      where: {
        organizationId,
        expenseDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        category: true,
      },
    });

    // Calc budget vs actual by category
    const categoryMap = new Map();

    // Initialize with budget allocations
    if (budgets.length > 0) {
      const activeBudget = budgets[0];

      for (const allocation of activeBudget.allocations) {
        const category = await prisma.expenseCategory.findUnique({
          where: { id: allocation.categoryId },
        });

        if (category) {
          categoryMap.set(category.id, {
            categoryId: category.id,
            categoryName: category.name,
            budgeted: allocation.amount,
            actual: 0,
            variance: allocation.amount,
            percentUsed: 0,
          });
        }
      }
    }

    // Add actual expenses
    for (const expense of expenses) {
      const categoryId = expense.categoryId;

      if (categoryMap.has(categoryId)) {
        const category = categoryMap.get(categoryId);
        category.actual += expense.amount;
        category.variance = category.budgeted - category.actual;
        category.percentUsed =
          category.budgeted > 0
            ? (category.actual / category.budgeted) * 100
            : 0;
        categoryMap.set(categoryId, category);
      } else {
        // Expense for category without budget allocation
        categoryMap.set(categoryId, {
          categoryId,
          categoryName: expense.category.name,
          budgeted: 0,
          actual: expense.amount,
          variance: -expense.amount,
          percentUsed: 100,
        });
      }
    }

    // Convert map to array
    const budgetComparison = Array.from(categoryMap.values());

    // Calc totals
    const totalBudgeted = budgetComparison.reduce(
      (sum, item) => sum + item.budgeted,
      0
    );
    const totalActual = budgetComparison.reduce(
      (sum, item) => sum + item.actual,
      0
    );
    const totalVariance = totalBudgeted - totalActual;
    const totalPercentUsed =
      totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

    const result = {
      period: {
        year: Number.parseInt(year),
        month: Number.parseInt(month),
        startDate: startOfMonth,
        endDate: endOfMonth,
      },
      budget: budgets.length > 0 ? budgets[0] : null,
      comparison: {
        byCategory: budgetComparison,
        totals: {
          budgeted: totalBudgeted,
          actual: totalActual,
          variance: totalVariance,
          percentUsed: totalPercentUsed,
        },
      },
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 3); // 3 hrs TTL

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

// Create a new budget with allocations
export async function POST(request: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    const {
      organizationId,
      name,
      budgetStartDate,
      endDate,
      totalAmount,
      description,
      allocations,
    } = body;

    if (
      !organizationId ||
      !name ||
      !budgetStartDate ||
      !endDate ||
      !totalAmount ||
      !allocations
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate allocations total matches budget total
    const allocationsTotal = allocations.reduce(
      (sum: number, allocation: any) => sum + allocation.amount,
      0
    );

    if (Math.abs(allocationsTotal - totalAmount) > 0.01) {
      // Allow for small floating point differences
      return NextResponse.json(
        {
          error: "Allocation total does not match budget total",
          allocationsTotal,
          totalAmount,
        },
        { status: 400 }
      );
    }

    // Create budget with allocations in a transaction
    const budget = await prisma.$transaction(async (tx) => {
      // Create the budget
      const newBudget = await tx.budget.create({
        data: {
          organizationId,
          name,
          startDate: new Date(budgetStartDate),
          endDate: new Date(endDate),
          totalAmount,
          description,
        },
      });

      // Create the allocations
      for (const allocation of allocations) {
        await tx.budgetAllocation.create({
          data: {
            budgetId: newBudget.id,
            categoryId: allocation.categoryId,
            amount: allocation.amount,
            notes: allocation.notes,
          },
        });
      }

      // Return the created budget with allocations
      return tx.budget.findUnique({
        where: { id: newBudget.id },
        include: { allocations: true },
      });
    });

    const startDate = new Date(body.budgetStartDate);
    const inputEndDate = new Date(body.endDate);
    const currentDate = new Date(startDate);

    while (currentDate <= inputEndDate) {
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const cacheKey = `budgets:${organizationId}:${year}:${month}`;
      await redis.del(cacheKey);

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}
