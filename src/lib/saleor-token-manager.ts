
import { COMMERCE_TOKEN_ENDPOINT } from "@/config/urls";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;
let isCurrentlyFetching = false;
let fetchPromise: Promise<string> | null = null;

const EXPIRY_BUFFER_MS = 60 * 1000;

function decodeJwtExpiry(token: string): number {
  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString("utf8")
    );
    return payload.exp * 1000;
  } catch (err) {
    console.error("Failed to decode token expiry:", err);
    return Date.now() + 5 * 60 * 1000; // fallback: 5 min valid
  }
}

async function fetchNewToken(): Promise<string> {
  console.log("🔑 Attempting to fetch new token...");

  // Prevent multiple simultaneous token requests
  if (isCurrentlyFetching && fetchPromise) {
    console.log("🔄 Token fetch already in progress, reusing promise");
    return fetchPromise;
  }

  isCurrentlyFetching = true;
  fetchPromise = (async () => {
    try {
      console.log(`📡 Fetching from: ${COMMERCE_TOKEN_ENDPOINT}`);
      const res = await fetch(COMMERCE_TOKEN_ENDPOINT, {
        method: "GET",
        headers: {},
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch Saleor token: ${res.status}`);
      }

      const json = await res.json();
      console.log(
        "📦 Token response received:",
        json.token ? "Token present" : "No token in response"
      );

      if (!json.token) {
        throw new Error("Token not present in response");
      }

      cachedToken = json.token;
      tokenExpiry = decodeJwtExpiry(json.token);
      console.log(
        `✅ New token cached, expires in ${Math.floor(
          (tokenExpiry - Date.now()) / 60000
        )} minutes`
      );

      return cachedToken as string;
    } catch (error) {
      console.error("❌ Token fetch error:", error);
      throw error;
    } finally {
      isCurrentlyFetching = false;
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export async function getValidToken(): Promise<string> {
  const now = Date.now();

  // Use cached token if it exists and is valid
  if (cachedToken && tokenExpiry && now < tokenExpiry - EXPIRY_BUFFER_MS) {
    console.log(
      `🔒 Using cached token, valid for ${Math.floor(
        (tokenExpiry - now) / 60000
      )} more minutes`
    );
    return cachedToken;
  }

  // Otherwise fetch a new token
  console.log("🔄 Cached token expired or not found, fetching new one");
  return await fetchNewToken();
}

export async function debugToken(): Promise<{
  token: string;
  isValid: boolean;
  expiresIn: string;
  decodedPayload: any;
}> {
  try {
    console.log("🔍 Starting token debug...");
    // Get current token
    const token = await getValidToken();
    console.log(
      "🎫 Got token for debugging:",
      token ? `${token.substring(0, 5)}...` : "none"
    );

    // Decode token to inspect
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // For browser environments
    let payload;
    if (typeof window !== "undefined") {
      payload = JSON.parse(atob(parts[1]));
    } else {
      // For Node.js environments
      payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    }

    console.log("🧩 Decoded token payload:", payload);

    // Calc expiry
    const expiryTime = payload.exp * 1000;
    const now = Date.now();
    const diffMs = expiryTime - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    const result = {
      token: `${token.substring(0, 10)}...${token.substring(
        token.length - 10
      )}`,
      isValid: now < expiryTime,
      expiresIn: `${diffMins}m ${diffSecs}s`,
      decodedPayload: payload,
    };

    console.log("✅ Token debug complete:", result);
    return result;
  } catch (error) {
    console.error("❌ Token debug error:", error);
    return {
      token: "ERROR",
      isValid: false,
      expiresIn: "N/A",
      decodedPayload: null,
    };
  }
}
