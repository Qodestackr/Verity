import { useCurrency } from "@/hooks/useCurrency";
import { defaultCache } from "@serwist/next/worker";
import type {
  PrecacheEntry,
  SerwistGlobalConfig,
  SerwistPlugin,
} from "serwist";

import {
  Serwist,
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
  BackgroundSyncPlugin,
  NetworkOnly,
  NavigationRoute,
  Route,
} from "serwist";

/**
 *BackgroundSyncPlugin hooks into fetchDidFail callback, which only invokes
 * if an exception thrown, likely network failure
 */
const backgroundSync = new BackgroundSyncPlugin("bgRetryQueue", {
  maxRetentionTime: 24 * 60, // in mins
});

const syncApiQueue = new BackgroundSyncPlugin("apiSyncQueue", {
  maxRetentionTime: 60, // Retry for a max of 1 Hour
});

// Log sync events for debugging
const logPlugin = {
  requestWillFetch({ request }) {
    console.log(`[SW] Fetching: ${request.url}`);
    return request;
  },
  fetchDidSucceed({ response }) {
    console.log(`[SW] Fetch succeeded`);
    return response;
  },
  fetchDidFail({ error }) {
    console.error(`[SW] Fetch failed: ${error}`);
  },
  handlerDidRespond({ response }) {
    console.log(`[SW] Handler responded: ${response?.status}`);
    return response;
  },
} satisfies SerwistPlugin;

// General API sync plugin for other endpoints
const apiSyncPlugin = new BackgroundSyncPlugin("api-sync-queue", {
  maxRetentionTime: 12 * 60, // Retry for up to 12 hours
});

/**
 * Retries requests when a response received with a 4xx or 5xx error status by hooking into fetchDidSucceed callback
 */
const statusPlugin = {
  fetchDidSucceed({ response }) {
    if (response.status >= 500) {
      // Throwing will trigger fetchDidFail
      throw new Error("Server error.");
    }
    // If it's not 5xx, use the response as-is.
    return response;
  },
} satisfies SerwistPlugin;

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 10,
    ignoreURLParametersMatching: [],
  },
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "pages",
        networkTimeoutSeconds: 3, // 👈 Quick fallback to cache after 3s
        plugins: [
          {
            handlerDidError: async ({ request }) => {
              if (request.destination === "document") {
                return caches.match("/~offline"); // Fallback to offline page 🫰
              }
              return Response.error();
            },
          },
          backgroundSync,
        ],
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
        plugins: [syncApiQueue],
      }),
    },
    {
      matcher: ({ request }) => request.destination === "image",
      // https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions
      handler: new CacheFirst({
        cacheName: "images",
        plugins: [
          statusPlugin, // Retry 5xx errors
          backgroundSync, // TODO: Use Custom queue to manage media/images
        ],
      }),
    },
    {
      matcher: ({ request }) =>
        request.destination === "script" || request.destination === "style",
      handler: new StaleWhileRevalidate({
        cacheName: "static-resources",
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document"; // Only serve offline page for documents
        },
      },
    ],
  },
});

serwist.addEventListeners();
