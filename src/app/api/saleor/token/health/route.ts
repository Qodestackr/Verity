export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { debugToken } from "@/lib/saleor-token-manager";

export async function GET(req: NextRequest) {
  console.log("🔍 Health check endpoint called");

  try {
    console.log("🔄 Requesting token debug info");
    const tokenInfo = await debugToken();
    console.log("✅ Token debug info received");

    // Calc if token is valid
    const isValid = tokenInfo.isValid;
    console.log(`🔐 Token validity: ${isValid ? "Valid" : "Invalid"}`);

    return NextResponse.json({
      status: isValid ? "healthy" : "expired",
      tokenValid: isValid,
      expiresIn: tokenInfo.expiresIn,
      tokenSnippet: tokenInfo.token,
      userInfo: {
        email: tokenInfo.decodedPayload?.email || "N/A",
        userId: tokenInfo.decodedPayload?.user_id || "N/A",
      },
    });
  } catch (error) {
    console.error("❌ Health check error:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        error: (error as any).message,
      },
      { status: 500 }
    );
  }
}
