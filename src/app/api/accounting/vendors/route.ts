import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

import { getStandardHeaders } from "@/utils/headers";

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
    const search = searchParams.get("search");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `vendors:${organizationId}:${search || "all"}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const where: any = {
      organizationId,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    await redis.set(cacheKey, JSON.stringify(vendors), "EX", 60 * 60 * 3); // 3 hrs TTL

    return NextResponse.json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

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
      contactPerson,
      email,
      phone,
      address,
      taxId,
      notes,
    } = body;

    if (!organizationId || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.create({
      data: {
        organizationId,
        name,
        contactPerson,
        email,
        phone,
        address,
        taxId,
        notes,
      },
    });

    const cachePattern = `vendors:${organizationId}:*`;
    const keys = await redis.keys(cachePattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}
