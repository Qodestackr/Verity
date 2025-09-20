import { type MetadataRoute } from "next";
import { siteConfig } from "./sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/static/", "/images/", "/css/", "/js/"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/admin/",
          "/user/",
          "/private/",
          "/login",
          "/register",
          "/reset-password",
          "/search",
        ],
      },
      {
        userAgent: "Googlebot",
        disallow: "/nogooglebot/",
      },
      {
        userAgent: "Bingbot",
        disallow: "/nobingbot/",
      },
      {
        userAgent: "BadBot",
        disallow: "/",
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
