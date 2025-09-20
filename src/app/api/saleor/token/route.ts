export const dynamic = "force-dynamic";
import { useCurrency } from "@/hooks/useCurrency";
import { APP_COMMERCE_URL } from "@/config/urls";
import { NextRequest, NextResponse } from "next/server";

/**
 * Generates a Saleor authentication token
 */
async function generateSaleorToken() {
  try {
    const response = await fetch(`${APP_COMMERCE_URL}/graphql/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation TokenAuth($email: String!, $password: String!) {
            tokenCreate(email: $email, password: $password) {
              token
              refreshToken
              csrfToken
              user {
                id
                email
              }
              errors {
                field
                message
              }
            }
          }
        `,
        variables: {
          email: "mcsystems2020@gmail.com",
          password: "alcora@;F_@bN!$$",
        },
      }),
    });

    const data = await response.json();

    if (data.data?.tokenCreate?.token) {
      return data.data.tokenCreate.token;
    } else if (data.data?.tokenCreate?.errors) {
      throw new Error(
        `Saleor auth error: ${data.data.tokenCreate.errors[0]?.message || "Unknown error"
        }`
      );
    } else {
      throw new Error("Failed to obtain token from Saleor");
    }
  } catch (error) {
    console.error("Token generation error:", error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  console.log("📣 Token endpoint called");

  try {
    const token = await generateSaleorToken();
    console.log("✅ Successfully generated token");

    // Return it
    return NextResponse.json(
      { token },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Content-Type": "application/json",
          "Access-Control-Allow-Headers":
            "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization",
          "Access-Control-Expose-Headers": "Content-Length,Content-Range",
        },
      }
    );
  } catch (error) {
    console.error("❌ Token generation failed:", error);
    return NextResponse.json(
      { error: (error as any).message || "Failed to generate token" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://www.alcorabooks.com",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization",
          "Access-Control-Expose-Headers": "Content-Length,Content-Range",
        },
      }
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
