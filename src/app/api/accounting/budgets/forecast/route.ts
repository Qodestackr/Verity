import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

// Get budget forecasts based on historical data
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
    const months = Number.parseInt(searchParams.get("months") || "3"); // How many months to forecast
    const historyMonths = Number.parseInt(
      searchParams.get("historyMonths") || "6"
    ); // How many months of history to analyze

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Try to get from cache first
    const cacheKey = `budget:forecast:${organizationId}:${months}:${historyMonths}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Get historical data for analysis
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - historyMonths);

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
      include: {
        category: true,
      },
    });

    // Get historical sales
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

    // Group expenses by month and category
    const expensesByMonth: Record<string, Record<string, number>> = {};
    const monthlyTotals: Record<
      string,
      { expenses: number; revenue: number; profit: number }
    > = {};

    // Initialize data structures
    for (let i = 0; i < historyMonths; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      expensesByMonth[monthKey] = {};
      categories.forEach((category) => {
        expensesByMonth[monthKey][category.id] = 0;
      });

      monthlyTotals[monthKey] = { expenses: 0, revenue: 0, profit: 0 };
    }

    // Process expenses
    expenses.forEach((expense) => {
      const date = new Date(expense.expenseDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (expensesByMonth[monthKey]) {
        expensesByMonth[monthKey][expense.categoryId] =
          (expensesByMonth[monthKey][expense.categoryId] || 0) + expense.amount;
        monthlyTotals[monthKey].expenses += expense.amount;
      }
    });

    // Process sales
    sales.forEach((sale) => {
      const date = new Date(sale.orderDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (monthlyTotals[monthKey]) {
        monthlyTotals[monthKey].revenue += sale.finalAmount;
      }
    });

    // Calc profit
    Object.keys(monthlyTotals).forEach((month) => {
      monthlyTotals[month].profit =
        monthlyTotals[month].revenue - monthlyTotals[month].expenses;
    });

    // Convert to arrays for analysis
    const monthKeys = Object.keys(monthlyTotals).sort();
    const expenseData = monthKeys.map((month) => monthlyTotals[month].expenses);
    const revenueData = monthKeys.map((month) => monthlyTotals[month].revenue);
    const profitData = monthKeys.map((month) => monthlyTotals[month].profit);

    // Calc growth rates and seasonality
    const expenseGrowthRates: number[] = [];
    const revenueGrowthRates: number[] = [];
    const categoryGrowthRates: Record<string, number[]> = {};

    // Initialize category growth rates
    categories.forEach((category) => {
      categoryGrowthRates[category.id] = [];
    });

    // Calc month-over-month growth rates
    for (let i = 1; i < monthKeys.length; i++) {
      const currentMonth = monthKeys[i];
      const previousMonth = monthKeys[i - 1];

      // Overall expense growth
      if (monthlyTotals[previousMonth].expenses > 0) {
        const expenseGrowth =
          (monthlyTotals[currentMonth].expenses -
            monthlyTotals[previousMonth].expenses) /
          monthlyTotals[previousMonth].expenses;
        expenseGrowthRates.push(expenseGrowth);
      }

      // Overall revenue growth
      if (monthlyTotals[previousMonth].revenue > 0) {
        const revenueGrowth =
          (monthlyTotals[currentMonth].revenue -
            monthlyTotals[previousMonth].revenue) /
          monthlyTotals[previousMonth].revenue;
        revenueGrowthRates.push(revenueGrowth);
      }

      // Category-specific growth
      categories.forEach((category) => {
        const currentAmount = expensesByMonth[currentMonth][category.id] || 0;
        const previousAmount = expensesByMonth[previousMonth][category.id] || 0;

        if (previousAmount > 0) {
          const growth = (currentAmount - previousAmount) / previousAmount;
          categoryGrowthRates[category.id].push(growth);
        }
      });
    }

    // Calc average growth rates
    const avgExpenseGrowth =
      expenseGrowthRates.length > 0
        ? expenseGrowthRates.reduce((sum, rate) => sum + rate, 0) /
          expenseGrowthRates.length
        : 0;

    const avgRevenueGrowth =
      revenueGrowthRates.length > 0
        ? revenueGrowthRates.reduce((sum, rate) => sum + rate, 0) /
          revenueGrowthRates.length
        : 0;

    const avgCategoryGrowth: Record<string, number> = {};
    categories.forEach((category) => {
      const rates = categoryGrowthRates[category.id];
      avgCategoryGrowth[category.id] =
        rates.length > 0
          ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length
          : 0;
    });

    // Generate forecasts
    const forecasts = [];
    let lastExpenseTotal =
      monthlyTotals[monthKeys[monthKeys.length - 1]].expenses;
    let lastRevenueTotal =
      monthlyTotals[monthKeys[monthKeys.length - 1]].revenue;
    let lastCategoryAmounts: Record<string, number> = {};

    categories.forEach((category) => {
      lastCategoryAmounts[category.id] =
        expensesByMonth[monthKeys[monthKeys.length - 1]][category.id] || 0;
    });

    // Create forecast for each future month
    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const monthKey = `${forecastDate.getFullYear()}-${String(
        forecastDate.getMonth() + 1
      ).padStart(2, "0")}`;

      // Apply growth rates with some randomness to simulate real-world variability
      const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2

      // Forecast expenses with growth
      const forecastedExpenses =
        lastExpenseTotal * (1 + avgExpenseGrowth * randomFactor);

      // Forecast revenue with growth
      const forecastedRevenue =
        lastRevenueTotal * (1 + avgRevenueGrowth * randomFactor);

      // Forecast by category
      const categoryForecasts: Record<string, number> = {};
      let categoryTotal = 0;

      categories.forEach((category) => {
        const categoryRandomFactor = 0.85 + Math.random() * 0.3; // Slightly different random factor per category
        const forecastedAmount =
          lastCategoryAmounts[category.id] *
          (1 + avgCategoryGrowth[category.id] * categoryRandomFactor);

        categoryForecasts[category.id] = forecastedAmount;
        categoryTotal += forecastedAmount;
      });

      // Normalize category amounts to match total forecasted expenses
      if (categoryTotal > 0) {
        categories.forEach((category) => {
          categoryForecasts[category.id] =
            (categoryForecasts[category.id] / categoryTotal) *
            forecastedExpenses;
        });
      }

      // Calc profit
      const forecastedProfit = forecastedRevenue - forecastedExpenses;

      // Add to forecasts array
      forecasts.push({
        month: monthKey,
        expenses: forecastedExpenses,
        revenue: forecastedRevenue,
        profit: forecastedProfit,
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          amount: categoryForecasts[category.id],
          percentage:
            forecastedExpenses > 0
              ? (categoryForecasts[category.id] / forecastedExpenses) * 100
              : 0,
        })),
      });

      // Update last values for next iteration
      lastExpenseTotal = forecastedExpenses;
      lastRevenueTotal = forecastedRevenue;
      lastCategoryAmounts = categoryForecasts;
    }

    // Prepare historical data for context
    const history = monthKeys.map((month) => ({
      month,
      expenses: monthlyTotals[month].expenses,
      revenue: monthlyTotals[month].revenue,
      profit: monthlyTotals[month].profit,
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        amount: expensesByMonth[month][category.id] || 0,
        percentage:
          monthlyTotals[month].expenses > 0
            ? ((expensesByMonth[month][category.id] || 0) /
                monthlyTotals[month].expenses) *
              100
            : 0,
      })),
    }));

    // Calc confidence scores based on data consistency
    const expenseVariability = calculateVariability(expenseGrowthRates);
    const revenueVariability = calculateVariability(revenueGrowthRates);

    const confidenceScore = Math.max(
      0,
      Math.min(100, 100 - ((expenseVariability + revenueVariability) / 2) * 100)
    );

    // Prepare insights based on the forecast
    const insights = generateInsights(history, forecasts, categories);

    const result = {
      history: history.reverse(), // Most recent first
      forecasts,
      metrics: {
        avgExpenseGrowth: avgExpenseGrowth * 100, // Convert to percentage
        avgRevenueGrowth: avgRevenueGrowth * 100,
        avgProfitMargin: calculateAvgProfitMargin(history),
        confidenceScore,
      },
      insights,
    };

    // Add code to store forecast results in the database
    // Add this after the result object is created but before caching and returning the response

    try {
      // Store forecast results in database for historical reference
      await prisma.budgetForecast.create({
        data: {
          organizationId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          forecastMonths: months,
          historyMonths: historyMonths,
          confidenceScore,
          avgExpenseGrowth: avgExpenseGrowth * 100,
          avgRevenueGrowth: avgRevenueGrowth * 100,
          avgProfitMargin: calculateAvgProfitMargin(history),
          categories: {
            create: forecasts.flatMap((forecast) =>
              forecast.categories.map((category) => ({
                categoryId: category.id,
                month: forecast.month,
                amount: category.amount,
                percentage: category.percentage,
              }))
            ),
          },
          insights: {
            create: insights.map((insight) => ({
              type: insight.type,
              title: insight.title,
              description: insight.description,
              action: insight.action,
            })),
          },
        },
      });
    } catch (dbError) {
      // Log error but don't fail the request if storage fails
      console.error("Error storing forecast in database:", dbError);
    }

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 3); // 3 hrs TTL

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating budget forecast:", error);
    return NextResponse.json(
      { error: "Failed to generate budget forecast" },
      { status: 500 }
    );
  }
}

// Helper function to calculate variability (coefficient of variation)
function calculateVariability(values: number[]): number {
  if (values.length === 0) return 1; // Maximum variability if no data

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance =
    squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Return coefficient of variation, capped at 1 for very volatile data
  return Math.min(1, Math.abs(mean) > 0.0001 ? stdDev / Math.abs(mean) : 1);
}

// Helper function to calculate average profit margin
function calculateAvgProfitMargin(history: any[]): number {
  const margins = history
    .map((month) =>
      month.revenue > 0 ? (month.profit / month.revenue) * 100 : 0
    )
    .filter((margin) => !isNaN(margin));

  return margins.length > 0
    ? margins.reduce((sum, margin) => sum + margin, 0) / margins.length
    : 0;
}

// Helper function to generate insights
function generateInsights(
  history: any[],
  forecasts: any[],
  categories: any[]
): any[] {
  const insights = [];

  // Get the most recent historical month and the first forecasted month
  const lastHistoryMonth = history[0];
  const firstForecastMonth = forecasts[0];

  // Check if expenses are forecasted to increase significantly
  if (firstForecastMonth.expenses > lastHistoryMonth.expenses * 1.1) {
    insights.push({
      type: "warning",
      title: "Expense Increase Expected",
      description: `Expenses are projected to increase by ${(
        (firstForecastMonth.expenses / lastHistoryMonth.expenses - 1) *
        100
      ).toFixed(1)}% next month.`,
      action:
        "Review your budget allocations to identify areas for potential cost control.",
    });
  }

  // Check if revenue is forecasted to decrease
  if (firstForecastMonth.revenue < lastHistoryMonth.revenue * 0.95) {
    insights.push({
      type: "alert",
      title: "Revenue Decline Projected",
      description: `Revenue may decrease by ${(
        (1 - firstForecastMonth.revenue / lastHistoryMonth.revenue) *
        100
      ).toFixed(1)}% next month based on current trends.`,
      action: "Consider marketing initiatives or promotions to boost sales.",
    });
  }

  // Check for profit margin changes
  const lastProfitMargin =
    lastHistoryMonth.revenue > 0
      ? (lastHistoryMonth.profit / lastHistoryMonth.revenue) * 100
      : 0;
  const forecastProfitMargin =
    firstForecastMonth.revenue > 0
      ? (firstForecastMonth.profit / firstForecastMonth.revenue) * 100
      : 0;

  if (forecastProfitMargin < lastProfitMargin * 0.9) {
    insights.push({
      type: "warning",
      title: "Profit Margin Squeeze",
      description: `Your profit margin is projected to decrease from ${lastProfitMargin.toFixed(
        1
      )}% to ${forecastProfitMargin.toFixed(1)}%.`,
      action:
        "Analyze your cost structure and pricing strategy to maintain profitability.",
    });
  }

  // Identify fastest growing expense categories
  const growingCategories = categories
    .map((category) => {
      const lastAmount =
        lastHistoryMonth.categories.find((c: any) => c.id === category.id)
          ?.amount || 0;
      const forecastAmount =
        firstForecastMonth.categories.find((c: any) => c.id === category.id)
          ?.amount || 0;
      const growthRate = lastAmount > 0 ? forecastAmount / lastAmount - 1 : 0;

      return {
        id: category.id,
        name: category.name,
        growthRate,
        lastAmount,
        forecastAmount,
      };
    })
    .filter((category) => category.lastAmount > 0 && category.growthRate > 0.15)
    .sort((a, b) => b.growthRate - a.growthRate);

  if (growingCategories.length > 0) {
    const topCategory = growingCategories[0];
    insights.push({
      type: "insight",
      title: "Fast-Growing Expense Category",
      description: `"${topCategory.name}" expenses are projected to grow by ${(
        topCategory.growthRate * 100
      ).toFixed(1)}% next month.`,
      action:
        "Review this category to ensure spending aligns with business objectives.",
    });
  }

  // Check for seasonal patterns
  // This is a simplified approach - a real implementation would use more sophisticated time series analysis
  const currentMonth = new Date().getMonth();
  const nextMonth = (currentMonth + 1) % 12;

  // Look for historical data from the same month last year
  const lastYearSameMonth = history.find((m) => {
    const [year, month] = m.month.split("-");
    return Number.parseInt(month) === nextMonth + 1;
  });

  if (lastYearSameMonth) {
    // Compare with forecast to detect seasonal patterns
    const seasonalDiff =
      firstForecastMonth.expenses / lastHistoryMonth.expenses -
      lastYearSameMonth.expenses / lastHistoryMonth.expenses;

    if (Math.abs(seasonalDiff) > 0.1) {
      insights.push({
        type: "insight",
        title: "Seasonal Pattern Detected",
        description: `Based on last year's data, your forecast may ${
          seasonalDiff > 0 ? "overestimate" : "underestimate"
        } expenses for next month.`,
        action: "Adjust your budget to account for seasonal variations.",
      });
    }
  }

  // Cash flow insight
  if (forecasts.some((f) => f.profit < 0)) {
    const negativeMonths = forecasts.filter((f) => f.profit < 0);
    insights.push({
      type: "alert",
      title: "Potential Cash Flow Issues",
      description: `Negative cash flow projected in ${negativeMonths.length} of the next ${forecasts.length} months.`,
      action:
        "Prepare a cash reserve or explore financing options to cover potential shortfalls.",
    });
  }

  return insights;
}
