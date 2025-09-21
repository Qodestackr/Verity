import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

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

    // Get current subscription with related data
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
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
      return NextResponse.json({
        subscription: null,
        message: "No active subscription found",
      });
    }

    // Get billing contact information
    const billingContact = await prisma.billingContact.findUnique({
      where: { organizationId },
    });

    return NextResponse.json({
      subscription,
      billingContact,
    });
  } catch (error) {
    console.error("Error fetching current subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
