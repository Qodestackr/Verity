import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

// Get all scenarios for a budget
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
    const budgetId = searchParams.get("budgetId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `budget:scenarios:${organizationId}:${budgetId || "all"}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Build query
    const where: any = { organizationId };
    if (budgetId) where.budgetId = budgetId;

    // Get scenarios with allocations, assumptions, and impacts
    const scenarios = await prisma.budgetScenario.findMany({
      where,
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
      },
      orderBy: [
        { isBaseline: "desc" }, // Baseline first
        { createdAt: "asc" }, // Then by creation date
      ],
    });

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(scenarios), "EX", 60 * 60 * 3); // 3 hrs TTL

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error("Error fetching budget scenarios:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget scenarios" },
      { status: 500 }
    );
  }
}

// Create a new budget scenario
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
      budgetId,
      name,
      description,
      isBaseline,
      totalAmount,
      allocations,
      assumptions,
    } = body;

    if (!organizationId || !budgetId || !name || !totalAmount || !allocations) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if this is the first scenario for this budget
    const existingScenarios = await prisma.budgetScenario.count({
      where: { budgetId },
    });

    // If this is the first scenario and isBaseline is not specified, make it the baseline
    const shouldBeBaseline = isBaseline || existingScenarios === 0;

    // If trying to create a baseline but one already exists, prevent it
    if (shouldBeBaseline && existingScenarios > 0) {
      const existingBaseline = await prisma.budgetScenario.findFirst({
        where: { budgetId, isBaseline: true },
      });

      if (existingBaseline) {
        return NextResponse.json(
          { error: "A baseline scenario already exists for this budget" },
          { status: 400 }
        );
      }
    }

    // Create scenario with allocations and assumptions in a transaction
    const scenario = await prisma.$transaction(async (tx) => {
      // Create the scenario
      const newScenario = await tx.budgetScenario.create({
        data: {
          organizationId,
          budgetId,
          name,
          description,
          isBaseline: shouldBeBaseline,
          totalAmount,
        },
      });

      // Create the allocations
      for (const allocation of allocations) {
        await tx.scenarioAllocation.create({
          data: {
            scenarioId: newScenario.id,
            categoryId: allocation.categoryId,
            amount: allocation.amount,
            changePercent: allocation.changePercent,
            notes: allocation.notes,
          },
        });
      }

      // Create the assumptions if provided
      if (assumptions && assumptions.length > 0) {
        for (const assumption of assumptions) {
          await tx.scenarioAssumption.create({
            data: {
              scenarioId: newScenario.id,
              type: assumption.type,
              name: assumption.name,
              description: assumption.description,
              changeType: assumption.changeType,
              changeValue: assumption.changeValue,
              appliedTo: assumption.appliedTo,
            },
          });
        }
      }

      // Calc impacts if this is not the baseline scenario
      if (!shouldBeBaseline) {
        // Get the baseline scenario
        const baseline = await tx.budgetScenario.findFirst({
          where: { budgetId, isBaseline: true },
          include: {
            allocations: true,
          },
        });

        if (baseline) {
          // Calc key metrics for impact analysis
          const baselineTotalExpense = baseline.totalAmount;
          const scenarioTotalExpense = totalAmount;

          // Calc profit margin impact (assuming revenue stays the same)
          // For this example, we'll use a placeholder revenue value
          const assumedRevenue = 1000000; // This would ideally come from actual data
          const baselineProfitMargin =
            ((assumedRevenue - baselineTotalExpense) / assumedRevenue) * 100;
          const scenarioProfitMargin =
            ((assumedRevenue - scenarioTotalExpense) / assumedRevenue) * 100;
          const profitMarginChange =
            scenarioProfitMargin - baselineProfitMargin;

          // Calc cash flow impact
          const cashFlowChange = baselineTotalExpense - scenarioTotalExpense;
          const cashFlowChangePercent =
            (cashFlowChange / baselineTotalExpense) * 100;

          // Create impact records
          await tx.scenarioImpact.create({
            data: {
              scenarioId: newScenario.id,
              metricName: "profit_margin",
              baselineValue: baselineProfitMargin,
              scenarioValue: scenarioProfitMargin,
              changePercent: profitMarginChange,
              impact:
                profitMarginChange > 0
                  ? "positive"
                  : profitMarginChange < 0
                  ? "negative"
                  : "neutral",
            },
          });

          await tx.scenarioImpact.create({
            data: {
              scenarioId: newScenario.id,
              metricName: "cash_flow",
              baselineValue: baselineTotalExpense,
              scenarioValue: scenarioTotalExpense,
              changePercent: cashFlowChangePercent,
              impact:
                cashFlowChange > 0
                  ? "positive"
                  : cashFlowChange < 0
                  ? "negative"
                  : "neutral",
            },
          });
        }
      }

      // Return the created scenario with all relations
      return tx.budgetScenario.findUnique({
        where: { id: newScenario.id },
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
        },
      });
    });

    const cachePattern = `budget:scenarios:${organizationId}:*`;
    const keys = await redis.keys(cachePattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    console.error("Error creating budget scenario:", error);
    return NextResponse.json(
      { error: "Failed to create budget scenario" },
      { status: 500 }
    );
  }
}
