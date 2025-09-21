import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

//  Get scenario by ID
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

    const id = params.id;

    // Try to get from cache first
    const cacheKey = `budget:scenario:${id}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const scenario = await prisma.budgetScenario.findUnique({
      where: { id },
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

    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(scenario), "EX", 60 * 60 * 3); // 3 hrs TTL

    return NextResponse.json(scenario);
  } catch (error) {
    console.error("Error fetching budget scenario:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget scenario" },
      { status: 500 }
    );
  }
}

// Update scenario
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
    const { name, description, totalAmount, allocations, assumptions } = body;

    const existingScenario = await prisma.budgetScenario.findUnique({
      where: { id },
      include: {
        allocations: true,
        assumptions: true,
        impacts: true,
      },
    });

    if (!existingScenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    // Update scenario and related data in a transaction
    const updatedScenario = await prisma.$transaction(async (tx) => {
      // Update the scenario
      const scenario = await tx.budgetScenario.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          description: description !== undefined ? description : undefined,
          totalAmount: totalAmount !== undefined ? totalAmount : undefined,
        },
      });

      // Update allocations if provided
      if (allocations) {
        // Delete existing allocations
        await tx.scenarioAllocation.deleteMany({
          where: { scenarioId: id },
        });

        // Create new allocations
        for (const allocation of allocations) {
          await tx.scenarioAllocation.create({
            data: {
              scenarioId: id,
              categoryId: allocation.categoryId,
              amount: allocation.amount,
              changePercent: allocation.changePercent,
              notes: allocation.notes,
            },
          });
        }
      }

      // Update assumptions if provided
      if (assumptions) {
        // Delete existing assumptions
        await tx.scenarioAssumption.deleteMany({
          where: { scenarioId: id },
        });

        // Create new assumptions
        for (const assumption of assumptions) {
          await tx.scenarioAssumption.create({
            data: {
              scenarioId: id,
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

      // Recalc impacts if this is not the baseline scenario
      if (!existingScenario.isBaseline) {
        // Delete existing impacts
        await tx.scenarioImpact.deleteMany({
          where: { scenarioId: id },
        });

        // Get the baseline scenario
        const baseline = await tx.budgetScenario.findFirst({
          where: {
            budgetId: existingScenario.budgetId,
            isBaseline: true,
          },
          include: {
            allocations: true,
          },
        });

        if (baseline) {
          // Calc key metrics for impact analysis
          const baselineTotalExpense = baseline.totalAmount;
          const scenarioTotalExpense =
            totalAmount || existingScenario.totalAmount;

          // Calc profit margin impact (assuming revenue stays the same)
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
              scenarioId: id,
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
              scenarioId: id,
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

      // Return the updated scenario with all relations
      return tx.budgetScenario.findUnique({
        where: { id },
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

    const cacheKey = `budget:scenario:${id}`;
    await redis.del(cacheKey);

    // Also invalidate list caches
    const cachePattern = `budget:scenarios:${existingScenario.organizationId}:*`;
    const keys = await redis.keys(cachePattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    return NextResponse.json(updatedScenario);
  } catch (error) {
    console.error("Error updating budget scenario:", error);
    return NextResponse.json(
      { error: "Failed to update budget scenario" },
      { status: 500 }
    );
  }
}

// Delete scenario
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

    // Get the scenario first to know the organizationId for cache invalidation
    const scenario = await prisma.budgetScenario.findUnique({
      where: { id },
      select: {
        organizationId: true,
        isBaseline: true,
        budgetId: true,
      },
    });

    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    // Prevent deletion of baseline scenario if there are other scenarios
    if (scenario.isBaseline) {
      const otherScenarios = await prisma.budgetScenario.count({
        where: {
          budgetId: scenario.budgetId,
          id: { not: id },
        },
      });

      if (otherScenarios > 0) {
        return NextResponse.json(
          {
            error:
              "Cannot delete baseline scenario while other scenarios exist. Make another scenario the baseline first.",
          },
          { status: 400 }
        );
      }
    }

    // Delete the scenario and its related data
    await prisma.$transaction([
      prisma.scenarioImpact.deleteMany({
        where: { scenarioId: id },
      }),
      prisma.scenarioAssumption.deleteMany({
        where: { scenarioId: id },
      }),
      prisma.scenarioAllocation.deleteMany({
        where: { scenarioId: id },
      }),
      prisma.budgetScenario.delete({
        where: { id },
      }),
    ]);

    const cacheKey = `budget:scenario:${id}`;
    await redis.del(cacheKey);

    // Also invalidate list caches
    const cachePattern = `budget:scenarios:${scenario.organizationId}:*`;
    const keys = await redis.keys(cachePattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting budget scenario:", error);
    return NextResponse.json(
      { error: "Failed to delete budget scenario" },
      { status: 500 }
    );
  }
}
