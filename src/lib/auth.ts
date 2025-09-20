import { betterAuth, logger, type BetterAuthOptions } from "better-auth";
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
} from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";

import { mapUserRoleToBusiness } from "@/lib/role-management";
import { APP_BASE_URL } from "@/config/urls";
import { ac, admin, wholesaler, retailer, distributor } from "./permissions";
import { reactInvitationEmail } from "@/components/emails/invitation";
import { reactResetPasswordEmail } from "@/components/emails/reset-password-email";
import { resend } from "@/lib/resend";
import { nextCookies } from "better-auth/next-js";
import { initializeOrganizationPermissions } from "@/services/permission-service";
import { nanoid } from "nanoid";
import { setupSaleorResourcesForNewUser } from "@/utils/create-saleor-resources";
import { PaymentMethodType } from "@prisma/client";
import { clearOrganizationCache } from "@/utils/organization";


const ALLOWED_ROLES = [
  "retailer",
  "wholesaler",
  "distributor",
  "user",
  "driver",
  "brand_owner",
] as const;

const AUTH_CONFIG = {
  from: "online@alcorabooks.com",
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

export const auth = betterAuth({
  trustedOrigins: AUTH_CONFIG.trustedOrigins,
  appName: AUTH_CONFIG.appName,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      console.log("Middleware executed in:", ctx.path);
      // Handle newly authenticated users
      if (ctx.path.startsWith("/sign-up") || ctx.path.startsWith("/sign-in")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          ctx.setCookie(
            "Set-Cookie",
            `session_token=${ctx.context.authCookies.sessionToken}; Path=/; HttpOnly; SameSite=Strict`
          );
          // Check if user has pending onboarding
          // const org = await getOrganizationByUserId(newSession.user.id);
          const org = {} as any;
          if (org && org.metadata?.pendingOnboarding) {
            // Store onboarding state in session....
          }
        }
      }
    }),
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const role = ctx?.body?.additionalFields?.role;
          if (!ALLOWED_ROLES.includes(role)) {
            throw new Error("Invalid role assignment");
          }
          return { data: { ...user, role } };
        },
        after: async (user, ctx) => {
        }
      },
    },
    session: {
      create: {
        before: async (session) => {
          const membership = await prisma.member.findFirst({
            where: { userId: session.userId },
            include: { organization: true },
            orderBy: { createdAt: "asc" }, // prioritize oldest org if multiple
          });

          if (!membership) {
            console.warn("No organization found for user:", session.userId);
            return { data: session }; // return session as-is, no org
          }

          return {
            data: {
              ...session,
              activeOrganizationId: membership.organization.id,
            },
          };
        },
        // after: async (session, ctx) => {
        //   console.log("Its session After Create", session)
        //   try {
        //     // new user (first login after signup) then -> +Org <-> Saleor onboarding pipeline
        //     const user = await prisma.user.findUnique({
        //       where: { id: session.userId },
        //     });

        //     if (!user) return;

        //     // Skip if user already has an organization linked
        //     const existingMembership = await prisma.member.findFirst({
        //       where: { userId: user.id },
        //       include: { organization: true },
        //     });

        //     if (existingMembership) {
        //       // Set active organization if found
        //       await prisma.session.update({
        //         where: { id: session.id },
        //         data: {
        //           activeOrganizationId: existingMembership.organization.id,
        //         },
        //       });
        //       return;
        //     }

        //     const organization = await prisma.organization.create({
        //       data: {
        //         name: `${user.name}'s Organization`,
        //         slug: `${nanoid()}`,
        //         businessType: mapUserRoleToBusiness(user.role || "user"),
        //         paymentMethod: PaymentMethodType.MPESA,
        //         members: {
        //           create: {
        //             userId: user.id,
        //             role: "OWNER",
        //           },
        //         },
        //       },
        //     });

        //     // Create Saleor resources and link them to the organization
        //     // This will also update the session with the warehouse and channel IDs
        //     await setupSaleorResourcesForNewUser(
        //       user.id,
        //       organization.id,
        //       session.id
        //     );
        //   } catch (error) {
        //     console.error("Error creating Saleor channel:", error);
        //   }
        // },
        after: async (session, ctx) => {
          console.log("Session after create:", session);

          try {
            // 1) Fetch the user
            const user = await prisma.user.findUnique({
              where: { id: session.userId },
            });
            if (!user) return;

            // 2) Check for an existing org membership
            let membership = await prisma.member.findFirst({
              where: { userId: user.id },
              include: { organization: true },
            });

            // 3) If none, create the org + owner membership
            if (!membership) {
              const org = await prisma.organization.create({
                data: {
                  name: `${user.name}'s Organization`,
                  slug: nanoid(),
                  businessType: mapUserRoleToBusiness(user.role || "user"),
                  paymentMethod: PaymentMethodType.MPESA,
                  members: { create: { userId: user.id, role: "OWNER" } },
                },
              });

              // Reload membership to get the org object
              membership = await prisma.member.findFirst({
                where: { userId: user.id, organizationId: org.id },
                include: { organization: true },
              });

              // Immediately set activeOrganizationId on the session record
              await prisma.session.update({
                where: { id: session.id },
                data: { activeOrganizationId: org.id },
              });

              // Also update our local `session` object so any downstream code sees it
              session.activeOrganizationId = org.id;
            }

            // 4) At this point we definitely have session.activeOrganizationId
            // Now kick off your Saleor provisioning (async fire-and-forget or await)
            await setupSaleorResourcesForNewUser(
              user.id,
              session.activeOrganizationId!,
              session.id
            );
          } catch (error) {
            console.error("Error in session.create.after:", error);
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: true,
      },
      premium: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      // Phone number for SMS notifications not from better-auth auth plugins
      // @ref https://www.better-auth.com/docs/plugins/phone-number
      phoneNumber: {
        type: "string",
        required: false,
        input: true,
      },
      enableSMS: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: true,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (
        { user, newEmail, url, token },
        request
      ) => {
        console.log("TODO: CHANGE EMAIL");
      },
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24, // (every 1 day the session expiration is updated)
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

  emailVerification: {
    // sendOnSignUp: true,
    // autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      // const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;

      const res = await resend.emails.send({
        from: AUTH_CONFIG.from,
        to: AUTH_CONFIG.to || user.email,
        subject: "Verify your email address",
        html: `<a href="${url}">Verify your email address</a>`,
      });
      console.log(res, user.email);
    },
  },
  // account: {
  //   accountLinking: {
  //     trustedProviders: ["google", "microsoft"],
  //   },
  // },
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
    async sendResetPassword({ user, url }) {
      await resend.emails.send({
        from: AUTH_CONFIG.from,
        to: user.email,
        subject: "Reset your password",
        react: reactResetPasswordEmail({
          username: user.email,
          resetLink: url,
        }),
      });
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
  plugins: [
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
    organization({
      membershipLimit: 100,
      organizationLimit: 10,
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
      async sendInvitationEmail(data) {
        await resend.emails.send({
          from: AUTH_CONFIG.from,
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
      organizationCreation: {
        beforeCreate: async ({ organization, user }) => {
          const extendedOrg = {
            ...organization,
            slug: organization.slug || nanoid(),
            paymentMethod: PaymentMethodType.MPESA,
          }
          console.log("ext-org.user", extendedOrg, user, user.id)
          return {
            data: extendedOrg,
          };
        },
        afterCreate: async ({ organization, user }) => {
          // TODO: Attach Saleor resources
          console.log(organization, "afterCreate")
        },
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

      console.info(transformedSession)
      return transformedSession;
    }),

    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await resend.emails.send({
            from: AUTH_CONFIG.from,
            to: user.email,
            subject: "Your OTP",
            html: `Your OTP is ${otp}`,
          });
        },
      },
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
  ],
} satisfies BetterAuthOptions);

export const createAuth = () => {
  return auth;
};

export type Auth = ReturnType<typeof createAuth>;
