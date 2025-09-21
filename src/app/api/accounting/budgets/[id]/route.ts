import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = await params.id;

    // Try to get from cache first
    const cacheKey = `budget:${id}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        allocations: {
          include: {
            // Incl category details for each allocation
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Get actual expenses for the budget period
    const expenses = await prisma.expense.findMany({
      where: {
        organizationId: budget.organizationId,
        expenseDate: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
      },
      include: {
        category: true,
      },
    });

    // Calc budget vs actual by category
    const categoryMap = new Map();

    // Initialize with budget allocations
    for (const allocation of budget.allocations) {
      categoryMap.set(allocation.categoryId, {
        categoryId: allocation.categoryId,
        categoryName: allocation.category.name,
        budgeted: allocation.amount,
        actual: 0,
        variance: allocation.amount,
        percentUsed: 0,
      });
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
      budget,
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
    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget" },
      { status: 500 }
    );
  }
}

//  Update budget
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();
    const { name, startDate, endDate, totalAmount, description, allocations } =
      body;

    // Check if budget exists
    const existingBudget = await prisma.budget.findUnique({
      where: { id },
      include: { allocations: true },
    });

    if (!existingBudget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Validate allocations total matches budget total if allocations are provided
    if (allocations) {
      const allocationsTotal = allocations.reduce(
        (sum: number, allocation: any) => sum + allocation.amount,
        0
      );

      if (
        Math.abs(
          allocationsTotal - (totalAmount || existingBudget.totalAmount)
        ) > 0.01
      ) {
        return NextResponse.json(
          {
            error: "Allocation total does not match budget total",
            allocationsTotal,
            totalAmount: totalAmount || existingBudget.totalAmount,
          },
          { status: 400 }
        );
      }
    }

    // Update budget and allocations in a transaction
    const updatedBudget = await prisma.$transaction(async (tx) => {
      // Update the budget
      const budget = await tx.budget.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          totalAmount: totalAmount !== undefined ? totalAmount : undefined,
          description: description !== undefined ? description : undefined,
        },
      });

      // Update allocations if provided
      if (allocations) {
        // Delete existing allocations
        await tx.budgetAllocation.deleteMany({
          where: { budgetId: id },
        });

        // Create new allocations
        for (const allocation of allocations) {
          await tx.budgetAllocation.create({
            data: {
              budgetId: id,
              categoryId: allocation.categoryId,
              amount: allocation.amount,
              notes: allocation.notes,
            },
          });
        }
      }

      // Return the updated budget with allocations
      return tx.budget.findUnique({
        where: { id },
        include: { allocations: true },
      });
    });

    const cacheKey = `budget:${id}`;
    await redis.del(cacheKey);

    // Also invalidate period caches
    const updateStartDate = startDate || existingBudget.startDate;
    const updateEndDate = endDate || existingBudget.endDate;
    const currentDate = new Date(updateStartDate);

    while (currentDate <= new Date(updateEndDate)) {
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const cacheKey = `budgets:${existingBudget.organizationId}:${year}:${month}`;
      await redis.del(cacheKey);

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error("Error updating budget:", error);
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 }
    );
  }
}

// Delete budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Get the budget first to know the organizationId for cache invalidation
    const budget = await prisma.budget.findUnique({
      where: { id },
      select: { organizationId: true, startDate: true, endDate: true },
    });

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Delete the budget and its allocations
    await prisma.$transaction([
      prisma.budgetAllocation.deleteMany({
        where: { budgetId: id },
      }),
      prisma.budget.delete({
        where: { id },
      }),
    ]);

    const cacheKey = `budget:${id}`;
    await redis.del(cacheKey);

    // Also invalidate period caches
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const cacheKey = `budgets:${budget.organizationId}:${year}:${month}`;
      await redis.del(cacheKey);

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 }
    );
  }
}
