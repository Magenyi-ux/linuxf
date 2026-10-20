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

  // SPA navigations should open the cached app shell if the device is offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy)));
        }
        return response;
      }).catch(async () => {
        return (await caches.match(request)) ||
          (await caches.match("/index.html")) ||
          new Response(
            "<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Examply offline</title><body><main><h1>You’re offline</h1><p>Reconnect to the internet and reopen Examply. Previously cached study content may still be available.</p></main></body></html>",
            { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 503 }
          );
      })
    );
    return;
  }

  // Cache-first for previously fetched same-origin assets; update cache in the
  // background after a successful network response. This preserves the last
  // downloaded app assets when connectivity drops.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkUpdate = fetch(request).then((response) => {
        if (response && response.ok && response.type === "basic") {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
        }
        return response;
      });
      return cached || networkUpdate.catch(() => new Response("", { status: 503, statusText: "Offline" }));
    })
  );
});
