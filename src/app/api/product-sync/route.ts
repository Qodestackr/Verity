import { NextResponse, type NextRequest } from "next/server";

import { redis } from "@/lib/redis";
import z from "@/lib/zod";
import { nanoid } from "nanoid";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  volume: z.string().min(2, "Volume is required"),
  price: z.number().positive("Price must be positive"),
  sku: z.string().optional(),
  alcoholPercentage: z.string().min(1, "Alcohol percentage is required"),
  origin: z.string().optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  description: z.string().optional(),
});

const REDIS_KEY = "admin:products";

export async function GET() {
  try {
    const productsStr = await redis.get(REDIS_KEY);
    const products = productsStr ? JSON.parse(productsStr) : [];
    console.log(products);
    return "YAYA"; //NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products from Redis:", error);
    return NextResponse.json(
      { error: "Failed to retrieve products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    const validation = productSchema.safeParse(rawData);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const productData = validation.data;

    // Redis ops
    const existingProducts = await redis
      .get(REDIS_KEY)
      .then((data) => (data ? JSON.parse(data) : []));

    const newProduct = {
      ...productData,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };

    console.log("📥✅ redis ticks");

    const updatedProducts = [...existingProducts, newProduct];

    await redis.set(REDIS_KEY, JSON.stringify(updatedProducts));

    return NextResponse.json({
      success: true,
      productId: newProduct.id,
      redisKey: REDIS_KEY,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
