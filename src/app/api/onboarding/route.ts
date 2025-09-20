import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import z from "@/lib/zod";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

const onboardingSchema = z.object({
  // businessType: z
  //   .enum(["BRAND_OWNER", "DISTRIBUTOR", "WHOLESALER", "RETAILER", "OTHER"])
  //   .optional(),
  businessName: z.string().min(2, "Business name is required"),
  businessDescription: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  address: z.string().optional(),
  warehouseName: z.string().optional(),
  importMethod: z.enum(["MANUAL", "CSV", "API"]).optional().default("API"),
  paymentMethod: z
    .enum(["MPESA", "CARD", "BANK_TRANSFER", "CASH", "OTHER"])
    .optional(),
  subscriptionPlan: z
    .enum(["BASIC", "STANDARD", "PREMIUM", "TRIAL"])
    .optional(),
  teamEmails: z.string().optional(),
  enableSMS: z.boolean().optional().default(true),
  phoneNumber: z.string().optional(),
  currentStep: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // const standardHeaders = await getStandardHeaders();

    // const session = await auth.api.getSession({
    //   headers: standardHeaders,
    // });

    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Parse and validate request body
    const body = await req.json();
    // const validatedData = onboardingSchema.parse(body);

    console.log(body, "]]]]]]]]");

    // Get or create organization for the user
    // const userId = session.user.id;
    // const userWithOrg = await prisma.user.findUnique({
    //   where: { id: userId },
    //   include: { organizationMembers: { include: { organization: true } } },
    // });

    // if (!userWithOrg || userWithOrg.organizationMembers.length === 0) {
    //   return NextResponse.json(
    //     { error: "User does not have an organization" },
    //     { status: 400 }
    //   );
    // }

    // const organizationId = userWithOrg.organizationMembers[0].organizationId;

    // Update organization with onboarding data
    // const updatedOrg = await prisma.organization.update({
    //   where: { id: organizationId },
    //   data: {
    //     name: validatedData.businessName,
    //     description: validatedData.businessDescription,
    //     businessType: validatedData.businessType as any,
    //     phoneNumber: validatedData.phoneNumber,
    //     enableSMS: validatedData.enableSMS,
    //     city: validatedData.location,
    //     address: validatedData.address,
    //     paymentMethod: validatedData.paymentMethod as any,
    //     subscriptionPlan: validatedData.subscriptionPlan as any,
    //   },
    // });

    // Create or update onboarding preferences
    // const onboardingPreference = await prisma.onboardingPreference.upsert({
    //   where: { organizationId },
    //   update: {
    //     currentStep: validatedData.currentStep ?? 0,
    //     businessType: validatedData.businessType as any,
    //     importMethod: validatedData.importMethod as any,
    //     subscriptionPlan: validatedData.subscriptionPlan as any,
    //     paymentMethod: validatedData.paymentMethod as any,
    //     teamEmails: validatedData.teamEmails,
    //     warehouseName: validatedData.warehouseName,
    //     warehouseLocation: validatedData.location,
    //   },
    //   create: {
    //     organizationId,
    //     currentStep: validatedData.currentStep ?? 0,
    //     businessType: validatedData.businessType as any,
    //     importMethod: validatedData.importMethod as any,
    //     subscriptionPlan: validatedData.subscriptionPlan as any,
    //     paymentMethod: validatedData.paymentMethod as any,
    //     teamEmails: validatedData.teamEmails,
    //     warehouseName: validatedData.warehouseName,
    //     warehouseLocation: validatedData.location,
    //   },
    // });

    return NextResponse.json({
      success: true,
      // organization: updatedOrg,
      // onboardingPreference,
    });
  } catch (error) {
    console.error("Error in onboarding API:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to process onboarding" },
      { status: 500 }
    );
  }
}

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

    // Get onboarding preferences
    const onboardingPreference = await prisma.onboardingPreference.findUnique({
      where: { organizationId },
    });

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    return NextResponse.json({
      success: true,
      onboardingPreference: onboardingPreference || null,
      organization,
    });
  } catch (error) {
    console.error("Error fetching onboarding data:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding data" },
      { status: 500 }
    );
  }
}
