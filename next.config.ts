import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  // globDirectory: "dist/static",
  // additionalPrecacheEntries: [""],
  cacheOnNavigation: true,
  maximumFileSizeToCacheInBytes: 1024 * 1024 * 7,
  disable: false,
  additionalPrecacheEntries: ["/~offline"],
});

const nextConfig: NextConfig = {
  generateBuildId: async () => {
    return process.env.GIT_COMMIT_SHA || Date.now().toString();
  },
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ["store-dvup9a9c.saleor.cloud"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  serverExternalPackages: ["import-in-the-middle", "require-in-the-middle"],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://www.alcorabooks.com"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, DELETE, OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Pragma"
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
