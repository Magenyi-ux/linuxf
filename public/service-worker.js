const CACHE_NAME = "examply-cache-v4";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/examply-logo.svg",
  "/question-assets/physics-vector.svg",
  "/question-assets/biology-cell.svg",
  "/question-assets/contour-map.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((error) => {
        // A single optional asset must not prevent the service worker installing.
        console.warn("[Examply SW] App shell pre-cache incomplete:", error);
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("examply-cache-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Never intercept cross-origin requests, Supabase, analytics, or API calls.
  // These may contain private account data and must not be cached by this worker.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // SPA navigations should open the cached app shell if the network is unavailable.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        return (await caches.match(request)) ||
          (await caches.match("/index.html")) ||
          new Response(
            "<!doctype html><html lang=\\\"en\\\"><meta charset=\\\"utf-8\\\"><meta name=\\\"viewport\\\" content=\\\"width=device-width,initial-scale=1\\\"><title>Examply offline</title><body><main><h1>You’re offline</h1><p>Reconnect to the internet and reopen Examply. Previously cached study content may still be available.</p></main></body></html>",
            { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 503 }
          );
      })
    );
    return;
  }

  // Cache-first for public same-origin assets. Fetch and cache on a miss; do not
  // call waitUntil from inside a later promise callback, where the event may have
  // already closed. API and cross-origin requests remain excluded above.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok && response.type === "basic") {
          const copy = response.clone();
          return caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).then(() => response);
        }
        return response;
      }).catch(() => new Response("", { status: 503, statusText: "Offline" }));
    })
  );
});
