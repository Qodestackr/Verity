import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import z from "@/lib/zod";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

const updatePermissionsSchema = z.array(
  z.object({
    id: z.string().optional(), // Optional for new permissions
    permissionType: z.enum([
      "VIEW_PRODUCTS",
      "VIEW_PRICES",
      "VIEW_INVENTORY",
      "PLACE_ORDERS",
      "VIEW_ANALYTICS",
      "VIEW_PROMOTIONS",
      "VIEW_CONTACTS",
    ]),
    isGranted: z.boolean(),
    scope: z.enum(["ALL", "SELECTED", "NONE"]),
    scopeIds: z.array(z.string()).optional(),
  })
);

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

    // Get relationship to check access
    const relationship = await prisma.businessRelationship.findUnique({
      where: { id: relationshipId },
      include: {
        permissions: true,
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

    return NextResponse.json(relationship.permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Validate permissions data
    const validatedData = updatePermissionsSchema.parse(body);

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

    // Check if user has access to the requester organization (only requester can set permissions)
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: relationship.requesterId,
      },
    });

    if (!membership && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only the requesting organization can set permissions" },
        { status: 403 }
      );
    }

    // Update permissions in a transaction
    const updatedPermissions = await prisma.$transaction(async (tx) => {
      // Delete existing permissions
      await tx.relationshipPermission.deleteMany({
        where: { relationshipId },
      });

      // Create new permissions
      const newPermissions = await Promise.all(
        validatedData.map((perm) =>
          tx.relationshipPermission.create({
            data: {
              relationshipId,
              permissionType: perm.permissionType,
              isGranted: perm.isGranted,
              scope: perm.scope,
              scopeIds: perm.scopeIds || [],
            },
          })
        )
      );

      // Update relationship last interaction
      await tx.businessRelationship.update({
        where: { id: relationshipId },
        data: { lastInteractionAt: new Date() },
      });

      // Create interaction record
      await tx.relationshipInteraction.create({
        data: {
          relationshipId,
          type: "PERMISSION_CHANGED",
          initiatedById: relationship.requesterId,
        },
      });

      return newPermissions;
    });

    return NextResponse.json(updatedPermissions);
  } catch (error) {
    console.error("Error updating permissions:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update permissions" },
      { status: 500 }
    );
  }
}
