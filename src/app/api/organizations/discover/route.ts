import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
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

    // Get organization ID from session or query params
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optional filters
    const businessType = searchParams.get("businessType");
    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    // Get existing relationships to exclude
    const existingRelationships = await prisma.businessRelationship.findMany({
      where: {
        OR: [{ requesterId: organizationId }, { targetId: organizationId }],
      },
      select: {
        requesterId: true,
        targetId: true,
      },
    });

    // Create a set of organization IDs to exclude
    const excludeIds = new Set<string>([
      organizationId, // Exclude self
      ...existingRelationships.map((rel) => rel.requesterId),
      ...existingRelationships.map((rel) => rel.targetId),
    ]);

    // Build query
    const query: any = {
      where: {
        id: { notIn: Array.from(excludeIds) },
        visibilitySettings: {
          isDiscoverable: true,
        },
        ...(businessType && { businessType }),
        ...(city && { city }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        logo: true,
        businessType: true,
        city: true,
        description: true,
        visibilitySettings: {
          select: {
            showContactInfo: true,
            showProducts: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        name: "asc",
      },
    };

    const organizations = await prisma.organization.findMany(query);

    // Count total for pagination
    const totalCount = await prisma.organization.count({
      where: query.where,
    });

    return NextResponse.json({
      organizations,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error discovering organizations:", error);
    return NextResponse.json(
      { error: "Failed to discover organizations" },
      { status: 500 }
    );
  }
}
