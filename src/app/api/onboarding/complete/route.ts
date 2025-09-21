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

    // Mark onboarding as complete
    const [updatedOrg, updatedPreference] = await prisma.$transaction([
      prisma.organization.update({
        where: { id: organizationId },
        data: { onboardingComplete: true },
      }),
      prisma.onboardingPreference.update({
        where: { organizationId },
        data: {
          isComplete: true,
          completedAt: new Date(),
          currentStep: 7, // Final step
        },
      }),
    ]);

    // Update user role based on business type
    const businessType = updatedPreference?.businessType;
    let role = "user"; // Default role

    if (businessType) {
      switch (businessType) {
        case "BRAND_OWNER":
          role = "distributor"; // Assuming this is the closest role
          break;
        case "DISTRIBUTOR":
          role = "distributor";
          break;
        case "WHOLESALER":
          role = "wholesaler";
          break;
        case "RETAILER":
          role = "retailer";
          break;
        default:
          role = "user";
      }
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      onboardingPreference: updatedPreference,
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
