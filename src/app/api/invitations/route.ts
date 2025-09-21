import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

import z from "@/lib/zod";
import { nanoid } from "nanoid";

// Schema for creating an invitation
const createInvitationSchema = z.object({
  recipientEmail: z.string().email("Invalid email address"),
  recipientName: z.string().optional(),
  recipientBusinessName: z.string().optional(),
  message: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get organization ID from session or query params
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optional filters
    const status = searchParams.get("status");

    // Build query
    const query: any = {
      where: {
        senderId: organizationId,
        ...(status && { status }),
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    const invitations = await prisma.connectionRequest.findMany(query);

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

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
    const { organizationId, ...invitationData } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate invitation data
    const validatedData = createInvitationSchema.parse(invitationData);

    // Check if invitation already exists
    const existingInvitation = await prisma.connectionRequest.findFirst({
      where: {
        senderId: organizationId,
        recipientEmail: validatedData.recipientEmail,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        {
          error: "A pending invitation to this email already exists",
          invitationId: existingInvitation.id,
        },
        { status: 400 }
      );
    }

    // Create invitation
    const invitation = await prisma.connectionRequest.create({
      data: {
        senderId: organizationId,
        recipientEmail: validatedData.recipientEmail,
        recipientName: validatedData.recipientName,
        recipientBusinessName: validatedData.recipientBusinessName,
        message: validatedData.message,
        token: nanoid(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    // TODO: Send email to recipient

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error("Error creating invitation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
