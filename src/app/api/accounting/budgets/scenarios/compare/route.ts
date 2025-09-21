import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

export async function POST(request: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { scenarioIds, organizationId } = body;

    if (!scenarioIds || !Array.isArray(scenarioIds) || scenarioIds.length < 2) {
      return NextResponse.json(
        { error: "At least two scenario IDs are required" },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `budget:scenarios:compare:${scenarioIds.sort().join("-")}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Get all scenarios with their allocations, assumptions, and impacts
    const scenarios = await prisma.budgetScenario.findMany({
      where: {
        id: { in: scenarioIds },
        organizationId,
      },
      include: {
        allocations: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        assumptions: true,
        impacts: true,
        budget: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (scenarios.length !== scenarioIds.length) {
      return NextResponse.json(
        { error: "One or more scenarios not found" },
        { status: 404 }
      );
    }

    // Check if all scenarios belong to the same budget
    const budgetIds = new Set(scenarios.map((s) => s.budgetId));
    if (budgetIds.size !== 1) {
      return NextResponse.json(
        { error: "All scenarios must belong to the same budget" },
        { status: 400 }
      );
    }

    // Find the baseline scenario
    const baselineScenario = scenarios.find((s) => s.isBaseline);
    if (!baselineScenario) {
      return NextResponse.json(
        { error: "No baseline scenario found for comparison" },
        { status: 400 }
      );
    }

    // Get all expense categories used across all scenarios
    const allCategoryIds = new Set<string>();
    scenarios.forEach((scenario) => {
      scenario.allocations.forEach((allocation) => {
        allCategoryIds.add(allocation.categoryId);
      });
    });

    // Get category details
    const categories = await prisma.expenseCategory.findMany({
      where: {
        id: { in: Array.from(allCategoryIds) },
        organizationId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Prepare comparison data
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    // Prepare category comparison data
    const categoryComparison = Array.from(allCategoryIds).map((categoryId) => {
      const categoryName = categoryMap.get(categoryId) || "Unknown Category";
      const baselineAllocation = baselineScenario.allocations.find(
        (a) => a.categoryId === categoryId
      );
      const baselineAmount = baselineAllocation ? baselineAllocation.amount : 0;

      const scenarioData = scenarios.map((scenario) => {
        const allocation = scenario.allocations.find(
          (a) => a.categoryId === categoryId
        );
        const amount = allocation ? allocation.amount : 0;
        const difference = amount - baselineAmount;
        const percentChange =
          baselineAmount > 0 ? (difference / baselineAmount) * 100 : 0;

        return {
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          amount,
          difference,
          percentChange,
        };
      });

      return {
        categoryId,
        categoryName,
        baselineAmount,
        scenarioData,
      };
    });

    // Prepare metrics comparison
    const metricsComparison = [
      {
        metricName: "Total Budget",
        baselineValue: baselineScenario.totalAmount,
        scenarios: scenarios.map((scenario) => ({
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          value: scenario.totalAmount,
          difference: scenario.totalAmount - baselineScenario.totalAmount,
          percentChange:
            ((scenario.totalAmount - baselineScenario.totalAmount) /
              baselineScenario.totalAmount) *
            100,
        })),
      },
      // ...more metrics
    ];

    // Prepare assumptions comparison
    const assumptionsComparison = scenarios.map((scenario) => ({
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      assumptions: scenario.assumptions,
    }));

    // Prepare impacts comparison
    const impactsComparison = scenarios
      .filter((s) => !s.isBaseline) // Only non-baseline scenarios have impacts
      .map((scenario) => ({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        impacts: scenario.impacts,
      }));

    const result = {
      budget: scenarios[0].budget,
      scenarios: scenarios.map((s) => ({
        id: s.id,
        name: s.name,
        isBaseline: s.isBaseline,
        totalAmount: s.totalAmount,
      })),
      categoryComparison,
      metricsComparison,
      assumptionsComparison,
      impactsComparison,
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 1); // 1 hr TTL

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error comparing budget scenarios:", error);
    return NextResponse.json(
      { error: "Failed to compare budget scenarios" },
      { status: 500 }
    );
  }
}
