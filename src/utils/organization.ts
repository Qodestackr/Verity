import prisma from "@/lib/prisma";

// Cache for organization data to reduce database queries
const organizationCache = new Map<string, { id: string; slug: string }>();

/**
 * Get organization ID from slug
 * @param slug Organization slug
 * @returns Organization ID
 */
export async function getOrganizationIdFromSlug(slug: string): Promise<string> {
  // Check cache first
  if (organizationCache.has(slug)) {
    return organizationCache.get(slug)?.id || "";
  }

  // Query database if not in cache
  const organization = await prisma.organization.findFirst({
    where: { slug },
    select: { id: true, slug: true },
  });

  if (!organization) {
    return "";
  }

  // Cache the result
  organizationCache.set(organization.slug, {
    id: organization.id,
    slug: organization.slug,
  });
  organizationCache.set(organization.id, {
    id: organization.id,
    slug: organization.slug,
  });

  return organization.id;
}

/**
 * Get organization slug from ID
 * @param id Organization ID
 * @returns Organization slug
 */
export async function getOrganizationSlugFromId(
  id: string
): Promise<string | null> {
  // Check cache first
  if (organizationCache.has(id)) {
    return organizationCache.get(id)?.slug || null;
  }

  // Query database if not in cache
  const organization = await prisma.organization.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!organization) {
    return null;
  }

  // Cache the result
  organizationCache.set(organization.id, {
    id: organization.id,
    slug: organization.slug,
  });
  organizationCache.set(organization.slug, {
    id: organization.id,
    slug: organization.slug,
  });

  return organization.slug;
}

/**
 * Clear organization cache
 */
export function clearOrganizationCache() {

  organizationCache.clear();
}
