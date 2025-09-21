import { type NextRequest, NextResponse } from "next/server";

import { redis } from "@/lib/redis";
import type {
  BusinessType,
  Member,
  Organization,
  Permission,
  Subscription,
  SubscriptionStatus,
} from "@prisma/client";

import { ApiError, handleApiError } from "@/utils/api/errors";
import prisma from "./prisma";
import { getStandardHeaders } from "@/utils/headers";
import { auth } from "./auth";
import { Session } from "./auth-types";

// extended organization type with members and related entities
export type WorkspaceWithMembers = Organization & {
  members: (Member & {
    permissions: Permission[];
  })[];
  subscription?: Subscription | null;
};

export type WorkspaceContext = {
  warehouseId?: string;
  channelId?: string;
  // ....
};

// handler function type
export interface WorkspaceHandlerParams {
  req: NextRequest;
  params: Record<string, string>;
  searchParams: Record<string, string>;
  headers?: Record<string, string>;
  session: Session | any;
  workspace: WorkspaceWithMembers;
  permissions: string[];
  context?: WorkspaceContext;
}

export type WorkspaceHandler = (
  params: WorkspaceHandlerParams
) => Promise<Response>;

export interface WithWorkspaceOptions {
  requiredPermissions?: string[];
  requiredBusinessTypes?: BusinessType[];
  skipPermissionChecks?: boolean;
  requireActiveSubscription?: boolean;
  subscriptionStatuses?: SubscriptionStatus[]; // Allow specific subscription statuses
  cacheResponse?: boolean;
  cacheTTL?: number; // in seconds
}

/**
 * HOF that wraps API handlers with workspace context and authentication
 */
export const withWorkspaceContext = (
  handler: WorkspaceHandler,
  options: WithWorkspaceOptions = {}
) => {
  return async (
    req: NextRequest,
    { params = {} }: { params: Record<string, string> }
  ): Promise<Response> => {
    const searchParams = Object.fromEntries(new URL(req.url).searchParams);
    const headers: Record<string, string> = {};
    let workspace: WorkspaceWithMembers | undefined;
    const context: WorkspaceContext = {};

    try {
      // Extract organization identifier from various possible sources
      const organizationId =
        params.organizationId ||
        searchParams.organizationId ||
        params.workspaceId ||
        searchParams.workspaceId;

      const organizationSlug =
        params.slug ||
        searchParams.slug ||
        params.organizationSlug ||
        searchParams.organizationSlug;

      if (!organizationId && !organizationSlug) {
        throw new ApiError({
          code: "bad_request",
          message:
            "Organization identifier is required. Please provide organizationId or slug.",
        });
      }

      const standardHeaders = await getStandardHeaders();

      const session = await auth.api.getSession({
        headers: standardHeaders,
      });

      if (!session?.user?.id) {
        throw new ApiError({
          code: "unauthorized",
          message: "Unauthorized: Login required.",
        });
      }

      // TODO: Check for rate limiting

      // Fetch the workspace with members and their permissions
      workspace = (await prisma.organization.findUnique({
        where: {
          id: organizationId || undefined,
          slug: organizationSlug || undefined,
        },
        include: {
          subscriptionPlan: true,

          members: {
            where: {
              userId: session.user.id,
            },
            include: {
              permissions: true,
            },
          },
          ...(options.requireActiveSubscription && {
            subscription: true,
          }),
        },
      })) as WorkspaceWithMembers;

      // Check if workspace exists
      if (!workspace) {
        throw new ApiError({
          code: "not_found",
          message: "Organization not found.",
        });
      }

      // Check if user is a member of the workspace
      if (workspace.members.length === 0) {
        // Check for pending invitations
        const pendingInvite = await prisma.invitation.findFirst({
          where: {
            email: session.user.email,
            organizationId: workspace.id,
            status: "PENDING",
          },
        });

        if (pendingInvite) {
          if (new Date(pendingInvite.expiresAt) < new Date()) {
            throw new ApiError({
              code: "invite_expired",
              message: "Organization invite expired.",
            });
          } else {
            throw new ApiError({
              code: "invite_pending",
              message: "Organization invite pending.",
            });
          }
        } else {
          throw new ApiError({
            code: "forbidden",
            message: "You don't have access to this organization.",
          });
        }
      }

      // Check business type requirements if specified
      if (
        options.requiredBusinessTypes &&
        options.requiredBusinessTypes.length > 0
      ) {
        if (!options.requiredBusinessTypes.includes(workspace.businessType)) {
          throw new ApiError({
            code: "forbidden",
            message: `This action is only available for ${options.requiredBusinessTypes.join(
              ", "
            )} business types.`,
          });
        }
      }

      if (options.requireActiveSubscription) {
        // Fetch subscription if not already included
        const subscription =
          workspace.subscription ||
          (await prisma.subscription.findUnique({
            where: { organizationId: workspace.id },
          }));

        if (!subscription) {
          throw new ApiError({
            code: "subscription_required",
            message: "This action requires an active subscription.",
          });
        }

        // Check if subscription status is acceptable
        const acceptableStatuses = options.subscriptionStatuses || [
          "ACTIVE",
          "TRIALING",
        ];
        if (!acceptableStatuses.includes(subscription.status)) {
          throw new ApiError({
            code: "subscription_inactive",
            message: `This action requires a subscription with status: ${acceptableStatuses.join(
              ", "
            )}.`,
          });
        }
      }

      // Extract permissions from the member
      const userPermissions = workspace.members[0].permissions.map(
        (p) => p.name
      );

      // Check required permissions
      if (
        !options.skipPermissionChecks &&
        options.requiredPermissions &&
        options.requiredPermissions.length > 0
      ) {
        const hasAllPermissions = options.requiredPermissions.every(
          (permission) => userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
          throw new ApiError({
            code: "forbidden",
            message:
              "You don't have the necessary permissions to perform this action.",
          });
        }
      }

      // Handle additional context (warehouse, channel)
      if (params.warehouseId || searchParams.warehouseId) {
        const warehouseId = params.warehouseId || searchParams.warehouseId;
        const warehouse = await prisma.warehouse.findUnique({
          where: {
            id: warehouseId,
            organizationId: workspace.id,
          },
        });

        if (!warehouse) {
          throw new ApiError({
            code: "not_found",
            message: "Warehouse not found.",
          });
        }

        context.warehouseId = warehouseId;
      }

      if (params.channelId || searchParams.channelId) {
        const channelId = params.channelId || searchParams.channelId;
        const channel = await prisma.saleorChannel.findUnique({
          where: {
            id: channelId,
            organizationId: workspace.id,
          },
        });

        if (!channel) {
          throw new ApiError({
            code: "not_found",
            message: "Channel not found.",
          });
        }

        context.channelId = channelId;
      }

      // Check if we should use cached response
      if (options.cacheResponse) {
        const cacheKey = generateCacheKey(
          req.url,
          workspace.id,
          session.user.id,
          context
        );
        const cachedResponse = await redis.get(cacheKey);

        if (cachedResponse) {
          return NextResponse.json(JSON.parse(cachedResponse), { headers });
        }
      }

      // Call the handler with all the context
      const response = await handler({
        req,
        params,
        searchParams,
        headers,
        session,
        workspace,
        permissions: userPermissions,
        context,
      });

      // Cache the response if needed
      if (options.cacheResponse && response.status === 200) {
        const cacheKey = generateCacheKey(
          req.url,
          workspace.id,
          session.user.id,
          context
        );
        const responseData = await response.json();

        await redis.set(
          cacheKey,
          JSON.stringify(responseData),
          "EX",
          options.cacheTTL || 360_0 // Default 1hr
        );

        return NextResponse.json(responseData, { headers });
      }

      return response;
    } catch (error) {
      console.error("Workspace context error:", error);
      return handleApiError(error, headers);
    }
  };
};

/**
 * Generate a cache key based on the request and context
 */
function generateCacheKey(
  url: string,
  workspaceId: string,
  userId: string,
  context: WorkspaceContext
): string {
  const urlObj = new URL(url);
  const baseKey = `api:${urlObj.pathname}:${workspaceId}:${userId}`;

  // Add context to the key if present
  const contextParts = [];
  if (context.warehouseId)
    contextParts.push(`warehouse:${context.warehouseId}`);
  if (context.channelId) contextParts.push(`channel:${context.channelId}`);

  // Add search params to the key
  const searchParamsStr = urlObj.searchParams.toString();

  return [baseKey, ...contextParts, searchParamsStr].filter(Boolean).join(":");
}
