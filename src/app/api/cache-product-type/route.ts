
import { redis } from "@/lib/redis";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json(
      { error: "Key parameter is required" },
      { status: 400 }
    );
  }

  try {
    const value = await redis.get(key);

    return NextResponse.json({ value });
  } catch (error) {
    console.error("Redis GET error:", error);
    return NextResponse.json(
      { error: (error as any).message },
      { status: 500 }
    );
  }
}

// POST endpoint to set a cached value
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, ttl } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    if (ttl && ttl > 0) {
      await redis.set(key, value, "EX", ttl);
    } else {
      await redis.set(key, value);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Redis SET error:", error);
    return NextResponse.json(
      { error: (error as any).message },
      { status: 500 }
    );
  }
}
