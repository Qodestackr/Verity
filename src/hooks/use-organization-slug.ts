"use client";

import { useParams } from "next/navigation";

export function useOrganizationSlug() {

  const params = useParams();
  return params.organizationSlug as string;
}
