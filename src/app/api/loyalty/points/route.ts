import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  addLoyaltyPoints,
  getCustomerTransactions,
  redeemLoyaltyPoints,
} from "@/services/loyalty-service";

// Get customer transactions
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const customerId = searchParams.get("customerId")?.replace(/["\s']/g, "");

  if (!customerId) {
    return NextResponse.json(
      { success: false, error: "Customer ID is required" },
      { status: 400 }
    );
  }

  try {
    const transactions = await getCustomerTransactions(customerId);
    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customerId, points, type, description, orderId } = await req.json();

    // Validation
    if (!customerId || !points || !type || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["EARNED", "BONUS"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid points type" },
        { status: 400 }
      );
    }

    const success = await addLoyaltyPoints(
      customerId,
      points,
      type as "EARNED" | "BONUS",
      description,
      orderId
    );

    return success
      ? NextResponse.json({ success: true, message: `${points} points added` })
      : NextResponse.json(
          { success: false, error: "Failed to add points" },
          { status: 400 }
        );
  } catch (error) {
    console.error("Error adding points:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Redeem points for discount
export async function PUT(req: NextRequest) {
  try {
    const { customerId, points, description, /**orderId,*/ redeemedFrom } =
      await req.json();

    if (!customerId || !points || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer ID, points, and description are required",
        },
        { status: 400 }
      );
    }

    const success = await redeemLoyaltyPoints(
      customerId,
      points,
      description
      //   orderId
    );

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to redeem points",
        },
        { status: 500 }
      );
    }

    return success
      ? NextResponse.json({
          success: true,
          message: `${points} points redeemed`,
        })
      : NextResponse.json(
          { success: false, error: "Redemption failed" },
          { status: 400 }
        );
  } catch (error) {
    console.error("Error redeeming points:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to redeem points",
      },
      { status: 500 }
    );
  }
}
