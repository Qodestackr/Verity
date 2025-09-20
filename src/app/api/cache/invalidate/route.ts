import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

// Invalidate cache for specific resources
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
    const { organizationId, resource } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    let pattern;
    if (resource) {
      pattern = `${resource}:${organizationId}:*`;
    } else {
      pattern = `*:${organizationId}:*`;
    }

    const keys = await redis.keys(pattern);
    let deletedCount = 0;

    if (keys.length > 0) {
      deletedCount = await redis.del(keys);
    }

    return NextResponse.json({
      success: true,
      message: `Invalidated ${deletedCount} cache entries`,
      resource: resource || "all",
      organizationId,
    });
  } catch (error) {
    console.error("Error invalidating cache:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}
