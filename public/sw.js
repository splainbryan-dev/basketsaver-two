// public/sw.js
// PriceSmart Compare — Service Worker
// Strategy: Cache-first for app shell assets, network-first for API calls.

const CACHE_NAME = "pricesmart-v1";

// App shell — everything needed to render offline
const SHELL_ASSETS = [
  "/",
  "/Browse",
  "/Cart",
  "/PriceComparison",
  "/ScanProduct",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ── Install: pre-cache the app shell ──────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll fails if any asset 404s — use individual adds to be resilient
      return Promise.allSettled(
        SHELL_ASSETS.map((url) => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for assets, network-first for API ──────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always go network for Kroger API calls (real-time data)
  if (url.pathname.startsWith("/kroger-api") || url.pathname.startsWith("/kroger-auth")) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: "Offline" }), {
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  // Network-first for navigation requests (so new deploys are picked up)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("/") || caches.match("/Browse"))
    );
    return;
  }

  // Cache-first for everything else (JS bundles, CSS, images)
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
    )
  );
});
// cache bust 
