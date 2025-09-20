import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

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

    const paymentMethodId = params.id;

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

    // Get payment method
    const paymentMethod = await prisma.paymentMethodDetails.findFirst({
      where: {
        id: paymentMethodId,
        organizationId,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error("Error fetching payment method:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment method" },
      { status: 500 }
    );
  }
}

// Update payment method
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

    const paymentMethodId = params.id;
    const body = await req.json();
    const { isDefault, ...updateData } = body;

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

    // Verify payment method belongs to organization
    const paymentMethod = await prisma.paymentMethodDetails.findFirst({
      where: {
        id: paymentMethodId,
        organizationId,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // If setting as default, unset other default payment methods
    if (isDefault) {
      await prisma.paymentMethodDetails.updateMany({
        where: {
          organizationId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update payment method
    const updatedPaymentMethod = await prisma.paymentMethodDetails.update({
      where: { id: paymentMethodId },
      data: {
        ...updateData,
        isDefault: isDefault ?? paymentMethod.isDefault,
      },
    });

    return NextResponse.json(updatedPaymentMethod);
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json(
      { error: "Failed to update payment method" },
      { status: 500 }
    );
  }
}

// Delete payment method
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

    const paymentMethodId = params.id;

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

    // Verify payment method belongs to organization
    const paymentMethod = await prisma.paymentMethodDetails.findFirst({
      where: {
        id: paymentMethodId,
        organizationId,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Check if this is the default payment method
    if (paymentMethod.isDefault) {
      return NextResponse.json(
        {
          error:
            "Cannot delete default payment method. Set another payment method as default first.",
        },
        { status: 400 }
      );
    }

    // Check if this payment method is being used by any active subscriptions
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        paymentMethodId,
        status: {
          in: ["ACTIVE", "TRIALING", "PAST_DUE"],
        },
      },
    });

    if (activeSubscription) {
      return NextResponse.json(
        {
          error:
            "Cannot delete payment method that is being used by an active subscription.",
        },
        { status: 400 }
      );
    }

    // Delete payment method
    await prisma.paymentMethodDetails.delete({
      where: { id: paymentMethodId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 }
    );
  }
}
