const CACHE_NAME = "controle-doping-v2";

const STATIC_ASSETS = [
  "/offline",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        STATIC_ASSETS.map(async (asset) => {
          try {
            await cache.add(asset);
            console.log("Arquivo cacheado:", asset);
          } catch (error) {
            console.warn("Não foi possível cachear:", asset, error);
          }
        })
      );
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/dashboard") ||
    url.pathname.includes("auth")
  ) {
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      if (request.mode === "navigate") {
        const offlinePage = await caches.match("/offline");
        return offlinePage || Response.error();
      }

      const cachedResponse = await caches.match(request);
      return cachedResponse || Response.error();
    })
  );
});