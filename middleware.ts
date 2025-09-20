import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  console.log("Middleware running for:", request.nextUrl.pathname);

  try {
    const session = getSessionCookie(request);

    console.log("Session found:debug", !!session);

    if (!session) {
      console.log("No session, redirecting to sign-in");
      // Make sure to use the absolute URL for the redirect
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // If error, redirect to sign-in for safety
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts, /images (static files)
     * 4. /favicon.ico, /sitemap.xml (static files)
     * 5. All public routes like /sign-in, /sign-up, etc.
     */
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/:path*"
  ],
};
