import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getStandardHeaders } from "@/utils/headers";

// Get all expenses with pagination and filtering
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
    const categoryId = searchParams.get("categoryId");
    const vendorId = searchParams.get("vendorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const cacheKey = `expenses:${organizationId}:${categoryId || "all"}:${vendorId || "all"
      }:${startDate || "all"}:${endDate || "all"}:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const where: any = { organizationId };

    if (categoryId) where.categoryId = categoryId;
    if (vendorId) where.vendorId = vendorId;

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    // Get expenses with pagination
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: true,
          vendor: true,
        },
        orderBy: {
          expenseDate: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    const result = {
      expenses,
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
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// Create a new expense
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
      categoryId,
      vendorId,
      amount,
      description,
      receiptUrl,
      paymentMethod,
      paymentStatus,
      expenseDate,
      taxDeductible,
      taxAmount,
      notes,
    } = body;

    if (
      !organizationId ||
      !categoryId ||
      !amount ||
      !description ||
      !paymentMethod ||
      !expenseDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        organizationId,
        categoryId,
        vendorId,
        amount,
        description,
        receiptUrl,
        paymentMethod,
        paymentStatus: paymentStatus || "PENDING",
        expenseDate: new Date(expenseDate),
        taxDeductible: taxDeductible || false,
        taxAmount,
        // notes,
      },
      include: {
        category: true,
        vendor: true,
      },
    });

    const cachePattern = `expenses:${organizationId}:*`;
    const keys = await redis.keys(cachePattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
