import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import prisma from "@/lib/prisma";
import { getStandardHeaders } from "@/utils/headers";
import * as z from "zod";
import { nanoid } from "nanoid";

// for tracking
export const generateRequestId = () => {
    return `req_${nanoid()}`;
};

// API Error types
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

// Organization context type
export interface OrganizationContext {
    organizationId: string;
    organizationSlug?: string;
    userId: string;
    userRole: string;
    permissions: string[];
    organization: any;
}

// API Handler type
export interface ApiHandlerParams {
    req: NextRequest;
    params: Record<string, string>;
    searchParams: Record<string, string>;
    context: OrganizationContext;
    requestId: string;
}

export type ApiHandler = (params: ApiHandlerParams) => Promise<Response>;

// Options for API wrapper
export interface ApiWrapperOptions {
    requireAuth?: boolean;
    requireOrganization?: boolean;
    requiredPermissions?: string[];
    cacheResponse?: boolean;
    cacheTTL?: number; // seconds
    rateLimit?: {
        requests: number;
        windowMs: number;
    };
}

// Main API wrapper function
export function withApiWrapper(
    handler: ApiHandler,
    options: ApiWrapperOptions = {}
) {
    return async (
        req: NextRequest,
        { params = {} }: { params?: Record<string, string> } = {}
    ): Promise<Response> => {
        const requestId = generateRequestId();
        const startTime = performance.now();

        // Add request ID to headers for tracking
        const responseHeaders = {
            'x-request-id': requestId,
            'x-api-version': '1.0',
        };

        try {
            // Parse search params
            const searchParams = Object.fromEntries(
                new URL(req.url).searchParams.entries()
            );

            // Log request (simplified)
            console.log(`[API] [${requestId}] ${req.method} ${req.url}`);

            // Rate limiting (simple Redis-based)
            if (options.rateLimit) {
                const rateLimitKey = `rate_limit:${req.ip || 'unknown'}`;
                const requests = await redis.incr(rateLimitKey);

                if (requests === 1) {
                    await redis.expire(rateLimitKey, Math.ceil(options.rateLimit.windowMs / 1000));
                }

                if (requests > options.rateLimit.requests) {
                    throw new ApiError(429, "Too many requests", "RATE_LIMIT_EXCEEDED");
                }
            }

            // Authentication check
            let context: OrganizationContext | null = null;

            if (options.requireAuth || options.requireOrganization) {
                const standardHeaders = await getStandardHeaders();
                const session = await auth.api.getSession({ headers: standardHeaders });

                if (!session) {
                    throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
                }

                // Get organization context if required
                if (options.requireOrganization) {
                    const organizationId = params.organizationId ||
                        searchParams.organizationId ||
                        params.organizationSlug;

                    if (!organizationId) {
                        throw new ApiError(400, "Organization identifier required", "MISSING_ORGANIZATION");
                    }

                    // Fetch organization and user membership
                    const organization = await prisma.organization.findFirst({
                        where: {
                            OR: [
                                { id: organizationId },
                                { slug: organizationId }
                            ]
                        },
                        include: {
                            members: {
                                where: { userId: session.user.id },
                                include: { permissions: true }
                            }
                        }
                    });

                    if (!organization) {
                        throw new ApiError(404, "Organization not found", "ORGANIZATION_NOT_FOUND");
                    }

                    if (organization.members.length === 0) {
                        throw new ApiError(403, "Access denied to organization", "ACCESS_DENIED");
                    }

                    const member = organization.members[0];
                    const permissions = member.permissions.map(p => p.name);

                    // Check required permissions
                    if (options.requiredPermissions?.length) {
                        const hasPermissions = options.requiredPermissions.every(
                            permission => permissions.includes(permission)
                        );

                        if (!hasPermissions) {
                            throw new ApiError(
                                403,
                                "Insufficient permissions",
                                "INSUFFICIENT_PERMISSIONS"
                            );
                        }
                    }

                    context = {
                        organizationId: organization.id,
                        organizationSlug: organization.slug,
                        userId: session.user.id,
                        userRole: member.role,
                        permissions,
                        organization
                    };
                } else {
                    // Basic auth context without organization
                    context = {
                        organizationId: '',
                        userId: session.user.id,
                        userRole: 'user',
                        permissions: [],
                        organization: null
                    };
                }
            }

            // Check cache if enabled
            if (options.cacheResponse && req.method === 'GET') {
                const cacheKey = `api_cache:${req.url}:${context?.organizationId || 'global'}`;
                const cached = await redis.get(cacheKey);

                if (cached) {
                    console.log(`[API] [${requestId}] Cache hit`);
                    return NextResponse.json(JSON.parse(cached), {
                        headers: { ...responseHeaders, 'x-cache': 'HIT' }
                    });
                }
            }

            // Call the actual handler
            const response = await handler({
                req,
                params,
                searchParams,
                context: context!,
                requestId
            });

            // Cache successful responses
            if (options.cacheResponse && response.status === 200 && req.method === 'GET') {
                const cacheKey = `api_cache:${req.url}:${context?.organizationId || 'global'}`;
                const responseData = await response.clone().json();

                await redis.set(
                    cacheKey,
                    JSON.stringify(responseData),
                    'EX',
                    options.cacheTTL || 300 // 5 minutes default
                );
            }

            // Add response headers
            Object.entries(responseHeaders).forEach(([key, value]) => {
                response.headers.set(key, value);
            });

            // Log response
            const duration = performance.now() - startTime;
            console.log(`[API] [${requestId}] ${response.status} (${duration.toFixed(0)}ms)`);

            return response;

        } catch (error) {
            const duration = performance.now() - startTime;

            // Handle known API errors
            if (error instanceof ApiError) {
                console.log(`[API] [${requestId}] ${error.statusCode} - ${error.message} (${duration.toFixed(0)}ms)`);

                return NextResponse.json(
                    {
                        error: error.message,
                        code: error.code,
                        requestId
                    },
                    {
                        status: error.statusCode,
                        headers: responseHeaders
                    }
                );
            }

            // Handle unexpected errors
            console.error(`[API] [${requestId}] 500 - Internal error:`, error);

            return NextResponse.json(
                {
                    error: "Internal server error",
                    code: "INTERNAL_ERROR",
                    requestId
                },
                {
                    status: 500,
                    headers: responseHeaders
                }
            );
        }
    };
}

// Validation wrapper using Zod
export function withValidation<T extends z.ZodType>(
    schema: T,
    handler: (data: z.infer<T>, params: ApiHandlerParams) => Promise<Response>
) {
    return async (params: ApiHandlerParams): Promise<Response> => {
        try {
            let data: any;

            if (params.req.method === 'GET') {
                data = params.searchParams;
            } else {
                data = await params.req.json();
            }

            const validatedData = schema.parse(data);
            return await handler(validatedData, params);

        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    {
                        error: "Validation failed",
                        code: "VALIDATION_ERROR",
                        details: error.errors,
                        requestId: params.requestId
                    },
                    { status: 400 }
                );
            }
            throw error;
        }
    };
}

// Helper for creating standardized responses
export function createApiResponse(
    data: any,
    status: number = 200,
    headers: Record<string, string> = {}
) {
    return NextResponse.json(data, { status, headers });
}

// Helper for paginated responses
export function createPaginatedResponse(
    data: any[],
    total: number,
    page: number,
    limit: number,
    requestId: string
) {
    return createApiResponse({
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        },
        requestId
    });
}