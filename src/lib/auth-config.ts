
import { resend } from "@/lib/resend";
import { redis } from "./redis";
import { type Account, type Session, type User, type GenericEndpointContext, betterAuth, type BetterAuthOptions } from "better-auth";
import {
    bearer,
    admin as adminPlugin,
    multiSession,
    organization,
    twoFactor,
    oAuthProxy,
    openAPI,
    oidcProvider,
    customSession,
    createAuthMiddleware,
    phoneNumber,
} from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
// import { getSocialProviders } from "./auth-providers";
import { APP_BASE_URL } from "@/config/urls";
import { nextCookies } from "better-auth/next-js";
import { ac, admin, wholesaler, retailer, distributor } from "./permissions";
import { reactInvitationEmail } from "@/components/emails/invitation";

import { mapUserRoleToBusiness } from "@/lib/role-management";
import { initializeOrganizationPermissions } from "@/services/permission-service";
import { nanoid } from "nanoid";
import { setupSaleorResourcesForNewUser } from "@/utils/create-saleor-resources";
import { PaymentMethodType } from "@prisma/client";

export const ALLOWED_ROLES = [
    "retailer",
    "wholesaler",
    "distributor",
    "user",
    "driver",
    "brand_owner",
] as const;


const from = process.env.BETTER_AUTH_EMAIL || "online@alcorabooks.com";
const to = process.env.TEST_EMAIL || "";

const AUTH_CONFIG = {
    from: process.env.BETTER_AUTH_EMAIL || "online@alcorabooks.com",
    to: process.env.TEST_EMAIL || "",
    trustedOrigins: [
        "http://46.202.130.243:3000",
        "http://46.202.130.243:7700",
        "http://46.202.130.243:8000",
        "https://commerce.alcorabooks.com",
        "https://search.alcorabooks.com",
        "https://alcorabooks.com",
        "alcorabooks.com",
        "https://www.alcorabooks.com",
    ],
    appName: "Alcorabooks",
    allowedRoles: ALLOWED_ROLES,
};

export const createAuthConfig = () => {
    return {
        trustedOrigins: AUTH_CONFIG.trustedOrigins,
        appName: AUTH_CONFIG.appName,

        database: prismaAdapter(prisma, {
            provider: "postgresql",
        }),

        secondaryStorage: {
            get: async (key: string) => {
                return ((await redis.get(key)) as string) ?? null;
            },
            set: async (key: string, value: string, ttl?: number) => {
                if (ttl) await redis.set(key, value,);
                else await redis.set(key, value);
            },
            delete: async (key: string) => {
                await redis.del(key);
            },
        },
        advanced: {
            ipAddress: {
                disableIpTracking: true,
            },
            cookiePrefix: process.env.NODE_ENV === 'development' ? 'better-auth-dev' : 'better-auth',
            crossSubDomainCookies: {
                enabled: true,
                domain: process.env.COOKIE_DOMAIN,
            },
        },
        baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
        session: {
            cookieCache: {
                enabled: true,
                maxAge: 60 * 60 * 24 * 7, // 7 days
            },
            expiresIn: 60 * 60 * 24 * 7, // 7 days
            updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
            additionalFields: {
                saleorChannelId: {
                    type: "string",
                    required: false,
                },
                saleorChannelSlug: {
                    type: "string",
                    required: false,
                },
                organizationId: {
                    type: "string",
                    required: false,
                },
                organizationName: {
                    type: "string",
                    required: false,
                },
                organizationSlug: {
                    type: "string",
                    required: false,
                },
                businessType: {
                    type: "string",
                    required: false,
                },
                warehouseId: {
                    type: "string",
                    required: false,
                },
            },
        },
        socialProviders: {
            facebook: {
                clientId: process.env.FACEBOOK_CLIENT_ID || "",
                clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
            },
            google: {
                clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            },
            microsoft: {
                clientId: process.env.MICROSOFT_CLIENT_ID || "",
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
            },
        },
        // socialProviders: getSocialProviders(process.env as unknown as Record<string, string>),
        account: {
            accountLinking: {
                enabled: true,
                allowDifferentEmails: true,
                trustedProviders: ['google', 'microsoft'],
            },
        },
        plugins: [
            organization({
                membershipLimit: 100,
                organizationLimit: 5,
                // ac: ac,
                roles: {
                    // ownerAc
                    // owner,
                    // admin,
                    // member
                },
                // Custom schema configuration for Organization
                schema: {
                    organization: {
                        fields: {
                            // Define how organization.metadata maps to our custom fields
                            metadata: "metadata",
                        },
                        // Additional fields/columns not automatically handled by the plugin
                        additionalFields: {
                            businessType: {
                                type: "string",
                                required: false,
                                defaultValue: "",
                            },
                            description: {
                                type: "string",
                                required: false,
                            },
                            logo: {
                                type: "string",
                                required: false,
                            },
                            city: {
                                type: "string",
                                required: false,
                            },
                            address: {
                                type: "string",
                                required: false,
                            },
                            phoneNumber: {
                                type: "string",
                                required: false,
                            },
                            enableSMS: {
                                type: "boolean",
                                required: false,
                                defaultValue: true,
                            },
                            paymentMethod: {
                                type: "string",
                                required: false,
                            },
                            subscriptionPlan: {
                                type: "string",
                                required: false,
                            },
                            onboardingComplete: {
                                type: "boolean",
                                required: false,
                                defaultValue: false,
                            },
                            channel: {
                                type: "string",
                                required: false,
                                defaultValue: true,
                            },
                        },
                    },
                },
                allowUserToCreateOrganization: async (user) => {
                    try {
                        const allowedRoles = ["retailer", "distributor", "wholesaler"];
                        return true;
                    } catch (error) {
                        console.error(
                            "Error checking organization creation eligibility:",
                            error
                        );
                        // Fail closed for security - deny on error
                        return false;
                    }
                },
                async sendInvitationEmail(data) {
                    await resend.emails.send({
                        from,
                        to: data.email,
                        subject: "You've been invited to join an organization",
                        react: reactInvitationEmail({
                            username: data.email,
                            invitedByUsername: data.inviter.user.name,
                            invitedByEmail: data.inviter.user.email,
                            teamName: data.organization.name,
                            inviteLink:
                                process.env.NODE_ENV === "development"
                                    ? `http://localhost:3000/accept-invitation/${data.id}`
                                    : `${process.env.BETTER_AUTH_URL || APP_BASE_URL
                                    }/accept-invitation/${data.id}`,
                        }),
                    });
                },
            }),
            customSession(async ({ user, session }) => {
                // First, get the organization from the active organization ID
                const org = await prisma.organization.findUnique({
                    where: { id: (session as any)?.activeOrganizationId || "" },
                    include: {
                        saleorChannels: { where: { isActive: true }, take: 1 },
                        warehouses: { take: 1 },
                    },
                });

                // Get the default channel
                const defaultChannel = org?.saleorChannels?.[0];
                const defaultWarehouse = org?.warehouses?.[0];

                const transformedSession: any = { ...session };

                transformedSession.user = user;
                transformedSession.role = (user as any)?.role;
                transformedSession.organizationId = org?.id;
                transformedSession.organizationName = org?.name;
                transformedSession.organizationSlug = org?.slug;
                transformedSession.businessType = org?.businessType;

                // Adding chann properties last to ensure they aren't overridden
                if (defaultChannel) {
                    transformedSession.saleorChannelId = defaultChannel.saleorChannelId;
                    transformedSession.saleorChannelSlug = defaultChannel.slug;
                }

                if (defaultWarehouse) {
                    transformedSession.warehouseId = defaultWarehouse.saleorWarehouseId;
                }
                return transformedSession;
            }),
            twoFactor({
                otpOptions: {
                    async sendOTP({ user, otp }) {
                        await resend.emails.send({
                            from,
                            to: user.email,
                            subject: "Your OTP",
                            html: `Your OTP is ${otp}`,
                        });
                    },
                },
            }),
            phoneNumber({
                allowedAttempts: 3,
                sendOTP: ({ phoneNumber, code }, request) => {
                    // ...
                },
                signUpOnVerification: {
                    getTempEmail: (phoneNumber) => {
                        return `${phoneNumber}@my-site.com`
                    },
                    getTempName: (phoneNumber) => {
                        return phoneNumber //default, uses the phone number as the name
                    }
                },
                callbackOnVerification: async ({ phoneNumber, user }, request) => {
                    // ...
                }
            }),
            openAPI(),
            bearer(),
            adminPlugin({
                ac: ac,
                roles: {
                    admin,
                    wholesaler,
                    retailer,
                    distributor,
                },
                adminRoles: ["admin"],
                impersonationSessionDuration: 60 * 60 * 24 * 7,
            }),
            multiSession(),
            oAuthProxy(),
            nextCookies(),
            oidcProvider({
                loginPage: "/sign-in",
                requirePKCE: true,
                consentPage: "/oauth/consent",
                metadata: {
                    issuer: APP_BASE_URL,
                    authorization_endpoint: `${APP_BASE_URL}/oauth/authorize`,
                    token_endpoint: `${APP_BASE_URL}/oauth/token`,
                    userinfo_endpoint: `${APP_BASE_URL}/userinfo`,
                    jwks_uri: `${APP_BASE_URL}/.well-known/jwks.json`,
                    response_types_supported: ["code"],
                    subject_types_supported: ["public"],
                    id_token_signing_alg_values_supported: ["RS256"],
                },
                // Allow Saleor as a client
                allowDynamicClientRegistration: true,
            }),
        ],
    } satisfies BetterAuthOptions;
};


export const UserConnectionHandlerHook = async (user: User, ctx?: GenericEndpointContext) => {
    const role = ctx?.body.additionalFields.role;

    if (!ALLOWED_ROLES.includes(role)) {
        throw new Error("Invalid role assignment");
    }

    return { data: { ...user, role } };
}

export const SessionConnectionHandlerHook = async (session: Session, ctx?: GenericEndpointContext) => {
    try {
        // new user (first login after signup) then -> +Org <-> Saleor onboarding pipeline
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        if (!user) return;

        // Skip if user already has an organization linked
        const existingMembership = await prisma.member.findFirst({
            where: { userId: user.id },
            include: { organization: true },
        });

        if (existingMembership) {
            // Set active organization if found
            await prisma.session.update({
                where: { id: session.id },
                data: {
                    activeOrganizationId: existingMembership.organization.id,
                },
            });
            return;
        }

        // Create organization for new user
        const organization = await prisma.organization.create({
            data: {
                name: `${user.name}'s Organization`,
                slug: `${nanoid()}`,
                businessType: mapUserRoleToBusiness(user.role || "user"),
                paymentMethod: PaymentMethodType.MPESA,
                members: {
                    create: {
                        userId: user.id,
                        role: "OWNER",
                    },
                },
            },
        });

        // Create Saleor resources and link them to the organization
        // This will also update the session with the warehouse and channel IDs
        await setupSaleorResourcesForNewUser(
            user.id,
            organization.id,
            session.id
        );
    } catch (error) {
        console.error("Error creating Saleor channel:", error);
    }
}