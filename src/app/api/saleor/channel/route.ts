import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  // Retrieve the session from the request using Better Auth
  const session = await auth.api.getSession(request);

  if (!session?.activeOrganizationId) {
    return NextResponse.json(
      { error: "No active organization in session" },
      { status: 400 }
    );
  }

  // Query for the active SaleorChannel using the organization's id
  const saleorChannel = await prisma.saleorChannel.findFirst({
    where: {
      organizationId: session.activeOrganizationId,
      isActive: true,
    },
  });

  if (!saleorChannel) {
    return NextResponse.json(
      { error: "Saleor channel not found" },
      { status: 404 }
    );
  }

  // Return the slug or other details as needed
  return NextResponse.json({
    slug: saleorChannel.slug,
    channelId: saleorChannel.saleorChannelId,
  });
}
