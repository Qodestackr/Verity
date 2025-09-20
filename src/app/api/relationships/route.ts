import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import z from "@/lib/zod";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";
import { headers } from "next/headers";
import { cookies } from "next/headers";

// Schema for creating a relationship
const createRelationshipSchema = z.object({
  targetId: z.string().min(1, "Target organization ID is required"),
  type: z.enum([
    "GENERAL",
    "SUPPLIER_BUYER",
    "DISTRIBUTOR_RETAILER",
    "PRODUCER_DISTRIBUTOR",
    "COMPETITOR",
    "PARTNER",
  ]),
  notes: z.string().optional(),
  permissions: z
    .array(
      z.object({
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
    )
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const standardHeaders = await getStandardHeaders();

    const session = await auth.api.getSession({
      headers: req.headers,
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

    if (!membership /**&& session.user.role !== "OWNER" */) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optional filters
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const direction = searchParams.get("direction") || "both"; // "incoming", "outgoing", or "both"

    // Build query
    const query: any = {
      where: {
        OR: [
          ...(direction === "both" || direction === "outgoing"
            ? [{ requesterId: organizationId }]
            : []),
          ...(direction === "both" || direction === "incoming"
            ? [{ targetId: organizationId }]
            : []),
        ],
        ...(status && { status }),
        ...(type && { type }),
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            logo: true,
            businessType: true,
            city: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            logo: true,
            businessType: true,
            city: true,
          },
        },
        permissions: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    };

    const relationships = await prisma.businessRelationship.findMany(query);

    // Transform the response to make it more user-friendly
    const transformedRelationships = relationships.map((rel) => {
      const isRequester = rel.requesterId === organizationId;
      const partner = isRequester ? rel.target : rel.requester;
      const direction = isRequester ? "outgoing" : "incoming";

      return {
        id: rel.id,
        partnerId: partner.id,
        partnerName: partner.name,
        partnerLogo: partner.logo,
        partnerBusinessType: partner.businessType,
        partnerLocation: partner.city,
        status: rel.status,
        type: rel.type,
        direction,
        createdAt: rel.createdAt,
        updatedAt: rel.updatedAt,
        lastInteractionAt: rel.lastInteractionAt,
        notes: rel.notes,
        permissions: rel.permissions,
      };
    });

    return NextResponse.json(transformedRelationships);
  } catch (error) {
    console.error("Error fetching relationships:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationships" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // const standardHeaders = await getStandardHeaders();

    // const session = await auth.api.getSession({
    //   headers: standardHeaders,
    // });

    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();
    const { organizationId, permissions, ...relationshipData } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: "session.user.id",
        organizationId,
      },
    });

    // if (!membership && session.user.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Validate relationship data
    const validatedData = createRelationshipSchema.parse({
      ...relationshipData,
      permissions,
    });

    // Check if relationship already exists
    const existingRelationship = await prisma.businessRelationship.findFirst({
      where: {
        OR: [
          { requesterId: organizationId, targetId: validatedData.targetId },
          { requesterId: validatedData.targetId, targetId: organizationId },
        ],
      },
    });

    if (existingRelationship) {
      return NextResponse.json(
        {
          error: "A relationship with this organization already exists",
          relationshipId: existingRelationship.id,
        },
        { status: 400 }
      );
    }

    // Check if target organization exists
    const targetOrg = await prisma.organization.findUnique({
      where: { id: validatedData.targetId },
    });

    if (!targetOrg) {
      return NextResponse.json(
        { error: "Target organization not found" },
        { status: 404 }
      );
    }

    // Create relationship with permissions in a transaction
    const relationship = await prisma.$transaction(async (tx) => {
      // Create the relationship
      const newRelationship = await tx.businessRelationship.create({
        data: {
          requesterId: organizationId,
          targetId: validatedData.targetId,
          type: validatedData.type,
          notes: validatedData.notes,
          status: "PENDING",
        },
      });

      // Create interaction record
      await tx.relationshipInteraction.create({
        data: {
          relationshipId: newRelationship.id,
          type: "CONNECTION_REQUEST",
          initiatedById: organizationId,
        },
      });

      // Create permissions if provided
      if (permissions && permissions.length > 0) {
        await Promise.all(
          permissions.map((perm) =>
            tx.relationshipPermission.create({
              data: {
                relationshipId: newRelationship.id,
                permissionType: perm.permissionType,
                isGranted: perm.isGranted,
                scope: perm.scope,
                scopeIds: perm.scopeIds || [],
              },
            })
          )
        );
      }

      return newRelationship;
    });

    return NextResponse.json(relationship, { status: 201 });
  } catch (error) {
    console.error("Error creating relationship:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create relationship" },
      { status: 500 }
    );
  }
}
