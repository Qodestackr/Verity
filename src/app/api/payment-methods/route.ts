import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { paymentService } from "@/services/payment-service";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

export async function GET(req: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get payment methods
    const paymentMethods = await prisma.paymentMethodDetails.findMany({
      where: { organizationId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

// Add a new payment method
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
    const { type, provider, isDefault, ...paymentDetails } = body;

    if (!type || !provider) {
      return NextResponse.json(
        { error: "Payment method type and provider are required" },
        { status: 400 }
      );
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

    // Create payment method based on type
    let paymentMethod;

    switch (type) {
      case "CARD":
        paymentMethod = await paymentService.addCardPaymentMethod(
          organizationId,
          provider,
          isDefault,
          paymentDetails
        );
        break;
      case "BANK_ACCOUNT":
        paymentMethod = await paymentService.addBankAccountPaymentMethod(
          organizationId,
          provider,
          isDefault,
          paymentDetails
        );
        break;
      case "MPESA":
        paymentMethod = await paymentService.addMpesaPaymentMethod(
          organizationId,
          isDefault,
          paymentDetails
        );
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported payment method type" },
          { status: 400 }
        );
    }

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error("Error adding payment method:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}
