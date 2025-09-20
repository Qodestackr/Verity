import { type MetadataRoute } from "next";
import { useCurrency } from "@/hooks/useCurrency";
import { APP_BASE_URL } from "@/config/urls";

export const siteConfig = {
  name: "BreEdge",
  description: "Thirsty Distribution Platform.",
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : APP_BASE_URL,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Core telehealth pages
  const coreRoutes = [
    "",
    "/about-us",
    "/services",
    "/how-it-works",
    "/find-a-provider",
    "/pricing",
    "/bnpl",
    "/faq",
    "/accessibility",
    "/locations",
  ];

  // Legal/Compliance pages (critical for medical sites)
  const legalRoutes = [
    "/privacy-policy",
    "/terms-of-service",
    "/hipaa-compliance",
    "/notice-of-privacy-practices",
  ];

  const routeEntries = [...coreRoutes, ...legalRoutes].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // (highest priority)
  const homeEntry: MetadataRoute.Sitemap[0] = {
    url: siteConfig.url,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: 1,
  };

  // Provider Portal (limited public info)
  const providerEntry: MetadataRoute.Sitemap[0] = {
    url: `${siteConfig.url}/for-providers`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.5,
  };

  // We remove sensitive pages from sitemap completely:
  // - /register, /login, /join* (keep these out of search indexes), //!!auth flows private

  return [homeEntry, providerEntry, ...routeEntries];
}
