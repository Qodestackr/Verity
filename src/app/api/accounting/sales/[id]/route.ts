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
    const id = params.id;

    const cacheKey = `sale:${id}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await redis.set(cacheKey, JSON.stringify(order), "EX", 60 * 60 * 3); // 3 hrs TTL

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching sale:", error);
    return NextResponse.json(
      { error: "Failed to fetch sale" },
      { status: 500 }
    );
  }
}

// Update sale/order status
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: body,
      include: {
        customer: true,
        items: true,
      },
    });

    const cacheKey = `sale:${id}`;
    await redis.del(cacheKey);

    // Also invalidate list caches
    const cachePattern = `sales:${updatedOrder.organizationId}:*`;
    const keys = await redis.keys(cachePattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating sale:", error);
    return NextResponse.json(
      { error: "Failed to update sale" },
      { status: 500 }
    );
  }
}
