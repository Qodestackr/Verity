import { headers as nextHeaders } from "next/headers";
import isServer from "./is-server";

/**
 * Safely converts Next.js ReadonlyHeaders to standard Headers object
 * Only works in server components/API routes
 *
 * @returns Standard Headers object with all headers from the request
 * @throws Error if called on the client
 */
export async function _getStandardHeaders(): Promise<Headers> {
  if (typeof window !== "undefined") {
    throw new Error(
      "getStandardHeaders can only be used in server components or API routes"
    );
  }

  try {
    const headersList = await nextHeaders(); // await here since nextHeaders() might be async in newer versions
    const standardHeaders = new Headers();

    // Copy all headers from the readonly object to the standard Headers
    headersList.forEach((value: string, key: string) => {
      standardHeaders.append(key, value);
    });

    return standardHeaders;
  } catch (error) {
    console.error("Error converting headers:", error);
    return new Headers();
  }
}

export async function getStandardHeaders(): Promise<Headers> {
  const nextHeadersList = await nextHeaders();
  const standardHeaders = new Headers();

  // Explicitly forward the cookie header for session identification
  const cookie = nextHeadersList.get("cookie");
  if (cookie) {
    standardHeaders.set("cookie", cookie);
  }

  // Optionally forward other headers if needed
  return standardHeaders;
}

/**
 * Safe wrapper for Next.js headers() function that checks if we're on the server first
 *
 * @returns ReadonlyHeaders from Next.js or null if on client
 */
export async function getReadonlyHeaders() {
  if (!isServer) {
    return null; // client, we can't access headers
  }

  try {
    return await nextHeaders();
  } catch (error) {
    console.error("Error getting headers:", error);
    return null;
  }
}
