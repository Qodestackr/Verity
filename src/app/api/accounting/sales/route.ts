import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";
import { nanoid } from "nanoid";

// Get all sales/orders with pagination and filtering
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
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `sales:${organizationId}:${customerId || "all"}:${
      status || "all"
    }:${startDate || "all"}:${endDate || "all"}:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const where: any = { organizationId };

    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: true,
        },
        orderBy: {
          orderDate: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const result = {
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 60 * 3); // 3 hrs TTL

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

// Create a new sale/order
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
    const {
      organizationId,
      customerId,
      items,
      totalAmount,
      discountAmount = 0,
      taxAmount = 0,
      shippingAmount = 0,
      paymentMethod,
      paymentStatus,
      notes,
    } = body;

    if (
      !organizationId ||
      !items ||
      !items.length ||
      !totalAmount ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calc final amount
    const finalAmount =
      totalAmount - discountAmount + taxAmount + shippingAmount;

    // Generate order number
    const orderNumber = `ORD-${nanoid()}`;

    // Create the order with items
    const order = await prisma.order.create({
      data: {
        organizationId,
        customerId,
        orderNumber,
        totalAmount,
        discountAmount,
        taxAmount,
        shippingAmount,
        finalAmount,
        paymentMethod,
        paymentStatus: paymentStatus || "PENDING",
        status: "PENDING",
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            discount: item.discount || 0,
            notes: item.notes,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    const cachePattern = `sales:${organizationId}:*`;
    const keys = await redis.keys(cachePattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
