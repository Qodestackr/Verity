import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { subscriptionService } from "@/services/subscription-service";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

// Get all subscription plans
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
    const businessType =
      userWithOrg.organizationMembers[0].organization.businessType;

    // Get all active subscription plans for the business type
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
        businessType: businessType as any,
      },
      orderBy: {
        price: "asc",
      },
    });

    // Get current subscription if any
    const currentSubscription = await prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });

    return NextResponse.json({
      plans,
      currentSubscription,
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}

// Create a new subscription
export async function POST(req: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, paymentMethodId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }
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

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (existingSubscription) {
      // Handle existing subscription (upgrade, downgrade, etc.)
      const updatedSubscription = await subscriptionService.changeSubscription(
        existingSubscription.id,
        planId,
        paymentMethodId
      );
      return NextResponse.json(updatedSubscription);
    }

    const subscription = await subscriptionService.createSubscription(
      organizationId,
      planId,
      paymentMethodId
    );

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
