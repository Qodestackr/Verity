import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getStandardHeaders } from "@/utils/headers";
import { invoiceService } from "@/services/invoice-service";

// Generate and download invoice PDF
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

    const invoiceId = params.id;

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

    // Verify invoice belongs to organization
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      include: {
        organization: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        payments: {
          where: {
            status: "SUCCEEDED",
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const billingContact = await prisma.billingContact.findUnique({
      where: { organizationId },
    });

    const pdfBuffer = await invoiceService.generateInvoicePdf(
      invoice,
      billingContact
    );

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
