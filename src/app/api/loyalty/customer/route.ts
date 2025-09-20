export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getCustomerByPhone,
  searchCustomers,
  createCustomer,
  getCustomerById,
} from "@/services/loyalty-service";

function sanitizePhone(phone: string | null): string | null {
  if (!phone) return null;

  // Remove any quotes, spaces, and non-digit characters except the + sign
  let sanitized = phone.replace(/["\s']/g, "");

  // If the first character is now a +, keep it, otherwise handle differently
  if (sanitized.startsWith("+")) {
    return sanitized;
  } else {
    // Handle the case when + is encoded or removed in the URL
    // Check if it's likely a complete phone number without +
    if (sanitized.length > 9) {
      // Add + if it's missing for international format
      return "+" + sanitized;
    }
    return sanitized;
  }
}

// Get customer by phone
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const rawPhone = searchParams.get("phone");
  const query = searchParams.get("query");
  const rawCustomerId = searchParams.get("id");

  // Sanitize inputs
  const phone = sanitizePhone(rawPhone);
  const customerId = rawCustomerId?.replace(/["\s']/g, ""); // Remove quotes and spaces

  console.log("Received raw phone:", rawPhone);
  if (phone) console.log("Sanitized Phone:", phone);
  if (customerId) console.log("Sanitized ID:", customerId);

  try {
    if (phone) {
      // Try searching with the sanitized phone
      let customer = await getCustomerByPhone(phone);

      // If not found, try without the + prefix
      if (!customer && phone.startsWith("+")) {
        console.log("Trying phone without +:", phone.substring(1));
        customer = await getCustomerByPhone(phone.substring(1));
      }

      // If still not found, try with + prefix
      if (!customer && !phone.startsWith("+")) {
        console.log("Trying phone with +:", "+" + phone);
        customer = await getCustomerByPhone("+" + phone);
      }

      if (!customer) {
        return NextResponse.json(
          { success: false, error: "Customer not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, customer });
    } else if (query) {
      // Search customers
      const customers = await searchCustomers(query);
      return NextResponse.json({ success: true, customers });
    } else if (customerId) {
      // Get customer by ID
      const customer = await getCustomerById(customerId);
      if (!customer) {
        return NextResponse.json(
          { success: false, error: "Customer not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, customer });
    } else {
      return NextResponse.json(
        { success: false, error: "Missing phone, query, or id parameter" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// Create new customer
export async function POST(req: NextRequest) {
  try {
    const { name, phone, organizationId } = await req.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const customer = await createCustomer(name, phone, organizationId);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Failed to create customer" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error("Error creating customer:", error);

    if (error.message?.includes("already exists")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
