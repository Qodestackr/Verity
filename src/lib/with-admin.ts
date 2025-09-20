import { NextResponse } from "next/server";
import { useCurrency } from "@/hooks/useCurrency";
import type { UserRole } from "@prisma/client";
import prisma from "./prisma";
import { getStandardHeaders } from "@/utils/headers";
import { auth } from "./auth";

// Constants
export const ALCORA_ADMIN_WORKSPACE_ID =
  process.env.ALCORA_ADMIN_WORKSPACE_ID || "org_admin";

export enum AdminAccessLevel {
  FULL = "FULL", // Complete admin access (admin role)
  ELEVATED = "ELEVATED", // Higher visibility (brand owners)
  NONE = "NONE", // No admin access
}

// Define the handler interface
type WithAdminHandler = ({
  req,
  params,
  searchParams,
  accessLevel,
}: {
  req: Request;
  params: Record<string, string>;
  searchParams: Record<string, string>;
  accessLevel: AdminAccessLevel;
}) => Promise<Response>;

// Options for the withAdmin HOC
interface WithAdminOptions {
  // Minimum access level required for this endpoint
  requiredAccessLevel?: AdminAccessLevel;
  // Allow specific user roles to access this endpoint
  allowedRoles?: UserRole[];
  // Custom access check function for complex scenarios
  customAccessCheck?: (userId: string, role: UserRole) => Promise<boolean>;
}

/**
 * Check if a user is an Alcora admin
 */
export const isAlcoraAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Check if user is a member of the admin organization
    const adminMember = await prisma.member.findFirst({
      where: {
        userId,
        organizationId: ALCORA_ADMIN_WORKSPACE_ID,
        role: "admin", // Ensure they have admin role in the admin org
      },
    });

    // Check if user has admin role directly
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return !!adminMember || user?.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Determine the admin access level for a user
 */
export const getAdminAccessLevel = async (
  userId: string
): Promise<{ accessLevel: AdminAccessLevel; role: UserRole }> => {
  try {
    // Get the user with their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return { accessLevel: AdminAccessLevel.NONE, role: "user" };
    }

    // Check if user is a full admin
    if (user.role === "admin") {
      return { accessLevel: AdminAccessLevel.FULL, role: user.role };
    }

    // Check if user is a brand owner (elevated access)
    if (user.role === "brand_owner") {
      return { accessLevel: AdminAccessLevel.ELEVATED, role: user.role };
    }

    // All other roles have no admin access
    return { accessLevel: AdminAccessLevel.NONE, role: user.role };
  } catch (error) {
    console.error("Error determining admin access level:", error);
    return { accessLevel: AdminAccessLevel.NONE, role: "user" };
  }
};

/**
 * Higher-order function for admin-protected routes
 * Supports different access levels for admins vs brand owners
 */
export const withAdmin = (
  handler: WithAdminHandler,
  options: WithAdminOptions = {}
) => {
  return async (
    req: Request,
    { params = {} }: { params: Record<string, string> | undefined }
  ) => {
    try {
      const standardHeaders = await getStandardHeaders();

      const session = await auth.api.getSession({
        headers: standardHeaders,
      });

      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Get the user's admin access level
      const { accessLevel, role } = await getAdminAccessLevel(session.user.id);

      // Check if user has the required access level
      const requiredLevel =
        options.requiredAccessLevel || AdminAccessLevel.FULL;

      // Access level check logic
      let hasAccess = false;

      if (requiredLevel === AdminAccessLevel.FULL) {
        hasAccess = accessLevel === AdminAccessLevel.FULL;
      } else if (requiredLevel === AdminAccessLevel.ELEVATED) {
        hasAccess =
          accessLevel === AdminAccessLevel.FULL ||
          accessLevel === AdminAccessLevel.ELEVATED;
      }

      // Check allowed roles if specified
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        hasAccess = hasAccess || options.allowedRoles.includes(role);
      }

      // Run custom access check if provided
      if (options.customAccessCheck) {
        const customAccessGranted = await options.customAccessCheck(
          session.user.id,
          role
        );
        hasAccess = hasAccess || customAccessGranted;
      }

      if (!hasAccess) {
        return NextResponse.json(
          {
            error: "Unauthorized: Insufficient permissions.",
            requiredLevel,
            yourLevel: accessLevel,
          },
          { status: 403 }
        );
      }

      // Parse search parameters
      const url = new URL(req.url);
      const searchParams = Object.fromEntries(url.searchParams.entries());

      // Call the handler with the access level
      return handler({ req, params, searchParams, accessLevel });
    } catch (error) {
      console.error("Admin middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
};

/**
 * Utility function to check if a user has admin access to a specific organization
 * Useful for organization-specific admin actions
 */
export const hasOrganizationAdminAccess = async (
  userId: string,
  organizationId: string
): Promise<boolean> => {
  try {
    // Check if user is a system admin
    const { accessLevel } = await getAdminAccessLevel(userId);
    if (accessLevel === AdminAccessLevel.FULL) {
      return true;
    }

    // Check if user is an admin of the specific organization
    const member = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return member?.role === "admin";
  } catch (error) {
    console.error("Error checking organization admin access:", error);
    return false;
  }
};
