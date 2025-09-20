import type { admin } from "./index";
import type { BetterAuthClientPlugin } from "better-auth/types";

export const adminClient = () => {
  return {
    id: "@alcora/admin-client",
    $InferServerPlugin: {} as ReturnType<typeof admin>,
    pathMethods: {
      "/admin/list-users": "GET",
      "/admin/stop-impersonating": "POST",
    },
  } satisfies BetterAuthClientPlugin;
};
