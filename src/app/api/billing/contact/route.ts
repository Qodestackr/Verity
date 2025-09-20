import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
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

    // Get billing contact
    const billingContact = await prisma.billingContact.findUnique({
      where: { organizationId },
    });

    if (!billingContact) {
      // Return organization info as fallback
      const organization = userWithOrg.organizationMembers[0].organization;
      return NextResponse.json({
        name: organization.name,
        email: userWithOrg.email,
        phone: organization.phoneNumber,
        address: organization.address,
        city: organization.city,
        country: "Kenya",
        taxId: organization.taxId,
      });
    }

    return NextResponse.json(billingContact);
  } catch (error) {
    console.error("Error fetching billing contact:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing contact" },
      { status: 500 }
    );
  }
}

// Update billing contact
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
    const { name, email, phone, address, city, postalCode, country, taxId } =
      body;

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

    // Update or create billing contact
    const billingContact = await prisma.billingContact.upsert({
      where: { organizationId },
      update: {
        name,
        email,
        phone,
        address,
        city,
        postalCode,
        country,
        taxId,
      },
      create: {
        organizationId,
        name,
        email,
        phone,
        address,
        city,
        postalCode,
        country: country || "Kenya",
        taxId,
      },
    });

    return NextResponse.json(billingContact);
  } catch (error) {
    console.error("Error updating billing contact:", error);
    return NextResponse.json(
      { error: "Failed to update billing contact" },
      { status: 500 }
    );
  }
}
