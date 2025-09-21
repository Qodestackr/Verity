export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";
import { Decimal } from "@prisma/client/runtime/library";
import { AuditSource } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();
    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sku = searchParams.get("sku");
    const productName = searchParams.get("productName");
    const source = searchParams.get("source");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const cacheKey = `audit:${sku || "all"}:${productName || "all"}:${
      source || "all"
    }:${startDate || "all"}:${endDate || "all"}:${page}:${limit}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const where: any = {};

    if (sku) where.sku = { contains: sku };
    if (productName) where.productName = { contains: productName };

    // Convert string source to enum value if provided
    if (source) {
      // Make sure the source is a valid enum value
      if (Object.values(AuditSource).includes(source as AuditSource)) {
        where.source = source as AuditSource;
      } else {
        console.warn(`Invalid source value: ${source}`);
        // Return empty results for invalid source to prevent errors
        return NextResponse.json({
          auditLogs: [],
          summary: {
            totalReceived: 0,
            totalSold: 0,
            totalAdjusted: 0,
            totalReceivedValue: 0,
            totalSoldValue: 0,
            totalAdjustedValue: 0,
            netQuantity: 0,
            netValue: 0,
          },
          pagination: {
            total: 0,
            pages: 0,
            page,
            limit,
          },
        });
      }
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [auditLogs, total] = await Promise.all([
      prisma.stockAuditLog.findMany({
        where,
        orderBy: {
          timestamp: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.stockAuditLog.count({ where }),
    ]);

    // Calculate summary statistics
    const summary = await calculateAuditSummary(where);

    const result = {
      auditLogs,
      summary,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 5); // 5 minutes TTL

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error fetching inventory audit logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory audit logs" },
      { status: 500 }
    );
  }
}

async function calculateAuditSummary(where: any) {
  // Clone the where clause to avoid modifying the original
  const baseWhere = { ...where };

  // Get received items (positive changes)
  const received = await prisma.stockAuditLog.aggregate({
    where: {
      ...baseWhere,
      quantityChange: { gt: 0 },
    },
    _sum: {
      quantityChange: true,
      totalCost: true,
    },
  });

  // Get sold items (using the enum value for SALE)
  // Make sure SALE is defined in the AuditSource enum
  const sold = await prisma.stockAuditLog.aggregate({
    where: {
      ...baseWhere,
      source: AuditSource.POS,
    },
    _sum: {
      quantityChange: true,
      totalCost: true,
    },
  });

  // Get adjusted items - filter out undefined values
  // Create an array of valid enum values to exclude
  const excludeSources = [
    AuditSource.POS,
    AuditSource.RECEIVE,
    AuditSource.RETURN,
  ].filter(Boolean);

  const adjusted = await prisma.stockAuditLog.aggregate({
    where: {
      ...baseWhere,
      source: {
        notIn: excludeSources.length > 0 ? excludeSources : undefined,
      },
    },
    _sum: {
      quantityChange: true,
      totalCost: true,
    },
  });

  // Calculate net changes
  const totalReceived = received._sum.quantityChange || 0;
  const totalSold = Math.abs(sold._sum.quantityChange || 0);
  const totalAdjusted = Math.abs(adjusted._sum.quantityChange || 0);

  const totalReceivedValue = (
    received._sum.totalCost || new Decimal(0)
  ).toNumber();
  const totalSoldValue = Math.abs(
    (sold._sum.totalCost || new Decimal(0)).toNumber()
  );
  const totalAdjustedValue = Math.abs(
    (adjusted._sum.totalCost || new Decimal(0)).toNumber()
  );

  return {
    totalReceived,
    totalSold,
    totalAdjusted,
    totalReceivedValue,
    totalSoldValue,
    totalAdjustedValue,
    netQuantity: totalReceived - totalSold - totalAdjusted,
    netValue: totalReceivedValue - totalSoldValue - totalAdjustedValue,
  };
}
