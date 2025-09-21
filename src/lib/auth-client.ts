import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  twoFactorClient,
  adminClient,
  multiSessionClient,
  oidcClient,
  inferAdditionalFields,
  customSessionClient,
} from "better-auth/client/plugins";
// import { ac, admin, wholesaler, retailer, distributor } from "./permissions";

import { toast } from "sonner";

import type { Auth, auth } from "@/lib/auth";
// import { Auth } from "better-auth";

export const client = createAuthClient({
  plugins: [
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/two-factor";
      },
    }),
    adminClient({
      // roles: {
      //   wholesaler: wholesalerPermissions,
      //   retailer: retailerPermissions,
      //   distributor: distributorPermissions,
      //   user: retailerPermissions, // Default permissions for users
      // },
    }),
    multiSessionClient(),
    oidcClient(),
    inferAdditionalFields<typeof auth>({
      role: ["user", "retailer", "wholesaler", "distributor"],
    }),
    customSessionClient<typeof auth>(),
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  organization,
  useListOrganizations,
  useActiveOrganization,
  admin,
  forgetPassword,
  $fetch,
  getSession,
} = client;

client.$store.listen("$sessionSignal", async () => {
  console.log("Session Signal Fired!")
});
