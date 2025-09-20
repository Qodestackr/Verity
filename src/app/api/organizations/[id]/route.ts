import { type NextRequest, NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET handler for fetching organization details
 * @param request - The incoming request
 * @param params - The route parameters, including the organization ID
 * @returns Organization data or error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "https://www.alcorabooks.com",
          },
        }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "https://www.alcorabooks.com",
          },
        }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "https://www.alcorabooks.com",
          },
        }
      );
    }

    // TODO: Organization.businbusinessProfile

    // Transform the data for the response
    const organizationData = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      location: organization.address || null,
      contactPerson: null,
      phone: null,
      email: null,
      businessType: organization.businessType,
    };

    return NextResponse.json(organization, {
      headers: {
        "Access-Control-Allow-Origin": "https://www.alcorabooks.com",
      },
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests (preflight)
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "https://www.alcorabooks.com",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Pragma",
        "Access-Control-Max-Age": "86400",
      },
    }
  );
}
