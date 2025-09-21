import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { subscriptionService } from "@/services/subscription-service";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

// Get subscription details
export async function GET(
  req: NextRequest,
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

    const subscriptionId = params.id;

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

    // Get subscription with related data
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        organizationId,
      },
      include: {
        plan: true,
        paymentMethod: true,
        invoices: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
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

    const subscriptionId = params.id;
    const body = await req.json();
    const { planId, paymentMethodId, cancelAtPeriodEnd } = body;

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

    // Verify subscription belongs to organization
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        organizationId,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Handle different update scenarios
    if (planId && planId !== subscription.planId) {
      // Change plan
      const updatedSubscription = await subscriptionService.changeSubscription(
        subscriptionId,
        planId,
        paymentMethodId
      );
      return NextResponse.json(updatedSubscription);
    }

    if (paymentMethodId && paymentMethodId !== subscription.paymentMethodId) {
      // Update payment method
      const updatedSubscription = await subscriptionService.updatePaymentMethod(
        subscriptionId,
        paymentMethodId
      );
      return NextResponse.json(updatedSubscription);
    }

    if (
      cancelAtPeriodEnd !== undefined &&
      cancelAtPeriodEnd !== subscription.cancelAtPeriodEnd
    ) {
      // Handle cancellation or reactivation
      const updatedSubscription = await subscriptionService.updateCancellation(
        subscriptionId,
        cancelAtPeriodEnd
      );
      return NextResponse.json(updatedSubscription);
    }

    // Generic update for other fields
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: body,
    });

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// Cancel subscription
export async function DELETE(
  req: NextRequest,
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

    const subscriptionId = params.id;

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

    // Verify subscription belongs to organization
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        organizationId,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Cancel subscription immediately
    const canceledSubscription = await subscriptionService.cancelSubscription(
      subscriptionId
    );

    return NextResponse.json(canceledSubscription);
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
