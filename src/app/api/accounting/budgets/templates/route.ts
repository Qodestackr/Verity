import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

// Get budget templates or generate a suggested budget
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
    const mode = searchParams.get("mode") || "suggest"; // "suggest" or "templates"
    const months = Number.parseInt(searchParams.get("months") || "3"); // How many months of data to analyze

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `budget:templates:${organizationId}:${mode}:${months}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    if (mode === "templates") {
      // Return predefined budget templates
      const templates = [
        {
          name: "Standard Retail Budget",
          description: "A balanced budget template for retail businesses",
          allocations: [
            { category: "rent", percentage: 25 },
            { category: "utilities", percentage: 10 },
            { category: "employee_wages", percentage: 30 },
            { category: "marketing", percentage: 10 },
            { category: "stock_purchase", percentage: 15 },
            { category: "transport", percentage: 5 },
            { category: "office_supplies", percentage: 3 },
            { category: "equipment_maintenance", percentage: 2 },
          ],
        },
        {
          name: "Growth-Focused Budget",
          description:
            "Budget template focused on business growth and expansion",
          allocations: [
            { category: "rent", percentage: 20 },
            { category: "utilities", percentage: 8 },
            { category: "employee_wages", percentage: 25 },
            { category: "marketing", percentage: 20 },
            { category: "stock_purchase", percentage: 18 },
            { category: "transport", percentage: 4 },
            { category: "office_supplies", percentage: 2 },
            { category: "equipment_maintenance", percentage: 3 },
          ],
        },
        {
          name: "Cost-Saving Budget",
          description: "Budget template focused on reducing expenses",
          allocations: [
            { category: "rent", percentage: 30 },
            { category: "utilities", percentage: 12 },
            { category: "employee_wages", percentage: 35 },
            { category: "marketing", percentage: 5 },
            { category: "stock_purchase", percentage: 10 },
            { category: "transport", percentage: 3 },
            { category: "office_supplies", percentage: 2 },
            { category: "equipment_maintenance", percentage: 3 },
          ],
        },
      ];

      // Map template categories to actual category IDs
      const categories = await prisma.expenseCategory.findMany({
        where: { organizationId },
      });

      const templatesWithIds = templates.map((template) => {
        return {
          ...template,
          allocations: template.allocations
            .map((allocation) => {
              const category = categories.find(
                (c) =>
                  c.name.toLowerCase().replace(/\s+/g, "_") ===
                  allocation.category
              );
              return {
                ...allocation,
                categoryId: category?.id || null,
                categoryName: category?.name || allocation.category,
              };
            })
            .filter((allocation) => allocation.categoryId !== null),
        };
      });

      await redis.set(
        cacheKey,
        JSON.stringify(templatesWithIds),
        "EX",
        60 * 60 * 24
      ); // 24 hrs TTL

      return NextResponse.json(templatesWithIds);
    } else {
      // Generate a suggested budget based on historical data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      // Get expense categories
      const categories = await prisma.expenseCategory.findMany({
        where: { organizationId },
      });

      // Get historical expenses
      const expenses = await prisma.expense.findMany({
        where: {
          organizationId,
          expenseDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Calc average monthly spend by category
      const categoryTotals: Record<
        string,
        { total: number; count: number; categoryName: string }
      > = {};

      for (const expense of expenses) {
        if (!categoryTotals[expense.categoryId]) {
          const category = categories.find((c) => c.id === expense.categoryId);
          categoryTotals[expense.categoryId] = {
            total: 0,
            count: 0,
            categoryName: category?.name || "Unknown",
          };
        }

        categoryTotals[expense.categoryId].total += expense.amount;
        categoryTotals[expense.categoryId].count += 1;
      }

      // Calc total monthly average
      let totalMonthlyAverage = 0;
      const categoryAverages: Array<{
        categoryId: string;
        categoryName: string;
        monthlyAverage: number;
        percentage: number;
      }> = [];

      for (const [categoryId, data] of Object.entries(categoryTotals)) {
        const monthlyAverage = data.total / months;
        totalMonthlyAverage += monthlyAverage;

        categoryAverages.push({
          categoryId,
          categoryName: data.categoryName,
          monthlyAverage,
          percentage: 0, // Will calculate after we have the total
        });
      }

      // Calc percentages and sort by amount
      categoryAverages.forEach((category) => {
        category.percentage =
          totalMonthlyAverage > 0
            ? (category.monthlyAverage / totalMonthlyAverage) * 100
            : 0;
      });

      categoryAverages.sort((a, b) => b.monthlyAverage - a.monthlyAverage);

      // Add any missing categories with zero values
      for (const category of categories) {
        if (!categoryAverages.some((c) => c.categoryId === category.id)) {
          categoryAverages.push({
            categoryId: category.id,
            categoryName: category.name,
            monthlyAverage: 0,
            percentage: 0,
          });
        }
      }

      const suggestedBudget = {
        totalMonthlyAverage,
        categoryAllocations: categoryAverages,
        basedOn: {
          months,
          startDate,
          endDate,
        },
      };

      await redis.set(
        cacheKey,
        JSON.stringify(suggestedBudget),
        "EX",
        60 * 60 * 3
      ); // 3 hrs TTL

      return NextResponse.json(suggestedBudget);
    }
  } catch (error) {
    console.error("Error generating budget templates:", error);
    return NextResponse.json(
      { error: "Failed to generate budget templates" },
      { status: 500 }
    );
  }
}
