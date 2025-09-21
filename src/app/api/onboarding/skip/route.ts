import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

export async function POST(req: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const userId = session.user.id;
    const userWithOrg = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizationMembers: { include: { organization: true } } },
    });

    if (!userWithOrg || userWithOrg.organizationMembers.length === 0) {
      return NextResponse.json(
        { error: "User does not have an organization" },
        { status: 400 }
      );
    }

    const organizationId = userWithOrg.organizationMembers[0].organizationId;

    // Create onboarding preference record if it doesn't exist
    const onboardingPreference = await prisma.onboardingPreference.upsert({
      where: { organizationId },
      update: {}, // No updates needed
      create: {
        organizationId,
        currentStep: 0,
      },
    });

    // Set default user role to "user"
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "user" as any },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding skipped",
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error skipping onboarding:", error);
    return NextResponse.json(
      { error: "Failed to skip onboarding" },
      { status: 500 }
    );
  }
}
