const BASE = "/tabela-copa-2026";
const CACHE_STATIC = "copa-2026-static-v2";
const CACHE_HISTORY = "copa-2026-historia-v2";

const STATIC_ASSETS = [
  `${BASE}/`,
  `${BASE}/historia`,
  `${BASE}/sedes`,
  `${BASE}/manifest.json`,
  `${BASE}/icons/icon-192.svg`,
  `${BASE}/icons/icon-512.svg`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_HISTORY)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (!url.pathname.startsWith(BASE)) return;

  const isHistory =
    url.pathname === `${BASE}/historia` ||
    url.pathname.startsWith(`${BASE}/historia/`);

  if (isHistory) {
    event.respondWith(
      caches.open(CACHE_HISTORY).then(async (cache) => {
        try {
          const network = await fetch(request);
          if (network.ok) cache.put(request, network.clone());
          return network;
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          const fallback = await caches.match(`${BASE}/historia`);
          if (fallback) return fallback;
          return new Response(
            "<!DOCTYPE html><html lang='pt-BR'><body><h1>História offline</h1></body></html>",
            { headers: { "Content-Type": "text/html" } }
          );
        }
      })
    );
    return;
  }

  if (
    url.pathname.startsWith(`${BASE}/_next/static`) ||
    url.pathname.match(/\.(js|css|woff2?|png|svg|ico)$/)
  ) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const network = await fetch(request);
          if (network.ok) cache.put(request, network.clone());
          return network;
        } catch {
          return cached || Response.error();
        }
      })
    );
  }
});
