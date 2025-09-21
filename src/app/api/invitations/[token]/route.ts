import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    // Get invitation details
    const invitation = await prisma.connectionRequest.findUnique({
      where: { token },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            logo: true,
            businessType: true,
            city: true,
            description: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired", status: "EXPIRED" },
        { status: 400 }
      );
    }

    // Check if invitation has already been accepted or rejected
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `Invitation has already been ${invitation.status.toLowerCase()}`,
          status: invitation.status,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        sender: invitation.sender,
        recipientEmail: invitation.recipientEmail,
        recipientName: invitation.recipientName,
        recipientBusinessName: invitation.recipientBusinessName,
        message: invitation.message,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: standardHeaders,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = params.token;
    const body = await req.json();
    const { action, organizationId } = body;

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    if (action === "accept" && !organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required to accept invitation" },
        { status: 400 }
      );
    }

    // Get invitation
    const invitation = await prisma.connectionRequest.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Check if invitation has already been accepted or rejected
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `Invitation has already been ${invitation.status.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Check if user has access to the specified organization
      const membership = await prisma.member.findFirst({
        where: {
          userId: session.user.id,
          organizationId,
        },
      });

      if (!membership && session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Check if relationship already exists
      const existingRelationship = await prisma.businessRelationship.findFirst({
        where: {
          OR: [
            { requesterId: invitation.senderId, targetId: organizationId },
            { requesterId: organizationId, targetId: invitation.senderId },
          ],
        },
      });

      if (existingRelationship) {
        return NextResponse.json(
          {
            error: "A relationship between these organizations already exists",
          },
          { status: 400 }
        );
      }

      // Process the invitation acceptance in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update invitation status
        const updatedInvitation = await tx.connectionRequest.update({
          where: { token },
          data: { status: "ACCEPTED" },
        });

        // Create relationship
        const relationship = await tx.businessRelationship.create({
          data: {
            requesterId: invitation.senderId,
            targetId: organizationId,
            status: "ACTIVE", // Auto-active since it's from an invitation
            type: "GENERAL",
          },
        });

        // Create interaction record
        await tx.relationshipInteraction.create({
          data: {
            relationshipId: relationship.id,
            type: "CONNECTION_ACCEPTED",
            initiatedById: organizationId,
          },
        });

        // Create default permissions
        const defaultPermissions = [
          {
            permissionType: "VIEW_PRODUCTS",
            isGranted: true,
            scope: "ALL",
          },
          {
            permissionType: "VIEW_PRICES",
            isGranted: false,
            scope: "NONE",
          },
        ];

        await Promise.all(
          defaultPermissions.map((perm) =>
            tx.relationshipPermission.create({
              data: {
                relationshipId: relationship.id,
                permissionType: perm.permissionType as any,
                isGranted: perm.isGranted,
                scope: perm.scope as any,
                scopeIds: [],
              },
            })
          )
        );

        return { invitation: updatedInvitation, relationship };
      });

      return NextResponse.json(result);
    } else {
      // Reject invitation
      const updatedInvitation = await prisma.connectionRequest.update({
        where: { token },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({ invitation: updatedInvitation });
    }
  } catch (error) {
    console.error("Error processing invitation:", error);
    return NextResponse.json(
      { error: "Failed to process invitation" },
      { status: 500 }
    );
  }
}
