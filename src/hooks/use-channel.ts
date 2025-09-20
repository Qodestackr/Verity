"use client";

import { usePathname } from "next/navigation";

export function useChannel() {

  const pathname = usePathname();
  const pathSegments = pathname?.split("/").filter(Boolean) || [];

  const isAdminRoute = pathSegments[1] === "admin";
  const saleorChannel = isAdminRoute ? null : pathSegments[1];

  return {
    saleorChannel,
    isAdminRoute,
    pathSegments,
  };
}
