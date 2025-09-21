import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

export async function GET(req: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const userWithOrg = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organizationMembers: { include: { organization: true } } },
    });

    if (!userWithOrg || userWithOrg.organizationMembers.length === 0) {
      return NextResponse.json(
        { error: "User does not have an organization" },
        { status: 400 }
      );
    }

    const organizationId = userWithOrg.organizationMembers[0].organizationId;

    // Parse query parameters
    const url = new URL(req.url);
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");
    const offset = Number.parseInt(url.searchParams.get("offset") || "0");
    const status = url.searchParams.get("status");

    // Build query
    const where = {
      organizationId,
      ...(status ? { status: status as any } : {}),
    };

    // Get invoices with pagination
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
          payments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
