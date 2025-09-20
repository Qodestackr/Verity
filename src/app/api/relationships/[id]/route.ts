import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

import z from "@/lib/zod";
import type { InteractionType } from "@prisma/client";

const updateRelationshipSchema = z.object({
  status: z
    .enum(["PENDING", "ACTIVE", "REJECTED", "BLOCKED", "ARCHIVED"])
    .optional(),
  notes: z.string().optional(),
});

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

    const relationshipId = params.id;

    // Get relationship with related data
    const relationship = await prisma.businessRelationship.findUnique({
      where: { id: relationshipId },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            logo: true,
            businessType: true,
            city: true,
            description: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            logo: true,
            businessType: true,
            city: true,
            description: true,
          },
        },
        permissions: true,
        interactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }

    // Check if user has access to either organization in the relationship
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: {
          in: [relationship.requesterId, relationship.targetId],
        },
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Transform the response to make it more user-friendly
    const isRequester = membership?.organizationId === relationship.requesterId;
    const partner = isRequester ? relationship.target : relationship.requester;
    const myOrg = isRequester ? relationship.requester : relationship.target;

    const transformedRelationship = {
      id: relationship.id,
      status: relationship.status,
      type: relationship.type,
      createdAt: relationship.createdAt,
      updatedAt: relationship.updatedAt,
      lastInteractionAt: relationship.lastInteractionAt,
      notes: relationship.notes,
      direction: isRequester ? "outgoing" : "incoming",
      partner: {
        id: partner.id,
        name: partner.name,
        logo: partner.logo,
        businessType: partner.businessType,
        city: partner.city,
        description: partner.description,
      },
      myOrganization: {
        id: myOrg.id,
        name: myOrg.name,
      },
      permissions: relationship.permissions,
      interactions: relationship.interactions,
    };

    return NextResponse.json(transformedRelationship);
  } catch (error) {
    console.error("Error fetching relationship:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationship" },
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
    const relationshipId = params.id;
    const body = await req.json();

    // Validate update data
    const validatedData = updateRelationshipSchema.parse(body);

    // Get relationship to check access
    const relationship = await prisma.businessRelationship.findUnique({
      where: { id: relationshipId },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }

    // Check if user has access to either organization in the relationship
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: {
          in: [relationship.requesterId, relationship.targetId],
        },
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Special handling for status changes
    let interactionType: string | null = null;
    if (validatedData.status && validatedData.status !== relationship.status) {
      // Only the target can accept/reject a pending request
      if (
        relationship.status === "PENDING" &&
        (validatedData.status === "ACTIVE" ||
          validatedData.status === "REJECTED") &&
        membership.organizationId !== relationship.targetId
      ) {
        return NextResponse.json(
          {
            error:
              "Only the receiving organization can accept or reject a pending request",
          },
          { status: 403 }
        );
      }

      // Set interaction type based on status change
      if (
        validatedData.status === "ACTIVE" &&
        relationship.status === "PENDING"
      ) {
        interactionType = "CONNECTION_ACCEPTED";
      } else if (
        validatedData.status === "REJECTED" &&
        relationship.status === "PENDING"
      ) {
        interactionType = "CONNECTION_REJECTED";
      }
    }

    // Update relationship in a transaction
    const updatedRelationship = await prisma.$transaction(async (tx) => {
      // Update the relationship
      const updated = await tx.businessRelationship.update({
        where: { id: relationshipId },
        data: {
          ...validatedData,
          lastInteractionAt: new Date(),
        },
      });

      // Create interaction record if status changed
      if (interactionType) {
        await tx.relationshipInteraction.create({
          data: {
            relationshipId: relationshipId,
            type: interactionType as InteractionType,
            initiatedById: membership.organizationId,
          },
        });
      }

      return updated;
    });

    return NextResponse.json(updatedRelationship);
  } catch (error) {
    console.error("Error updating relationship:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update relationship" },
      { status: 500 }
    );
  }
}

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

    const relationshipId = params.id;

    // Get relationship to check access
    const relationship = await prisma.businessRelationship.findUnique({
      where: { id: relationshipId },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }

    // Check if user has access to either organization in the relationship
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: {
          in: [relationship.requesterId, relationship.targetId],
        },
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Instead of hard delete, archive the relationship
    const archivedRelationship = await prisma.businessRelationship.update({
      where: { id: relationshipId },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json(archivedRelationship);
  } catch (error) {
    console.error("Error archiving relationship:", error);
    return NextResponse.json(
      { error: "Failed to archive relationship" },
      { status: 500 }
    );
  }
}
