import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { paymentService } from "@/services/payment-service";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

// Endpoint to check onboarding status
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

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId parameter is required" },
        { status: 400 }
      );
    }

    const statusKey = `org:${organizationId}:onboarding-status`;
    const statusJson = await redis.get(statusKey);

    if (!statusJson) {
      return NextResponse.json(
        { error: "Onboarding status not found" },
        { status: 404 }
      );
    }

    const status = JSON.parse(statusJson);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching onboarding status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
