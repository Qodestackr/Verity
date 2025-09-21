import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import z from "@/lib/zod";

import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";

const createIssueSchema = z.object({
  issueType: z.enum([
    "STOCK_SHORTAGE",
    "VEHICLE_BREAKDOWN",
    "CUSTOMER_UNAVAILABLE",
    "WRONG_ADDRESS",
    "PAYMENT_ISSUE",
    "OTHER",
  ]),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

const updateIssueSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  resolution: z.string().optional(),
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

    const deliveryId = params.id;

    // Get delivery to check organization
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this organization or is the assigned driver
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: delivery.organizationId,
      },
    });

    const driver = await prisma.driver.findFirst({
      where: {
        userId: session.user.id,
        id: delivery.driverId || "",
      },
    });

    if (!membership && !driver && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get issues for this delivery
    const issues = await prisma.deliveryIssue.findMany({
      where: { deliveryId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error("Error fetching delivery issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery issues" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const deliveryId = params.id;
    const body = await req.json();

    // Validate issue data
    const validatedData = createIssueSchema.parse(body);

    // Get delivery to check organization
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this organization or is the assigned driver
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: delivery.organizationId,
      },
    });

    const driver = await prisma.driver.findFirst({
      where: {
        userId: session.user.id,
        id: delivery.driverId || "",
      },
    });

    if (!membership && !driver && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create issue
    const issue = await prisma.deliveryIssue.create({
      data: {
        deliveryId,
        issueType: validatedData.issueType,
        description: validatedData.description,
        reportedBy: session.user.id,
      },
    });

    // Update delivery status to indicate there's an issue
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: "FAILED",
        failureReason: validatedData.description,
      },
    });

    // If this delivery is linked to an order, update the order status
    if (delivery.orderId) {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: {
          status: "PROCESSING", // Keep as processing since it might be retried
          // Don't change fulfillment status
        },
      });
    }

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error("Error creating delivery issue:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create delivery issue" },
      { status: 500 }
    );
  }
}
