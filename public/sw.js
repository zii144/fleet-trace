const CACHE_NAME = "questionnaire-platform-v2";
const urlsToCache = [
  "/login",
  "/dashboard",
  "/admin",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache opened");
      return cache.addAll(urlsToCache);
    })
  );
});

// Intercept requests
self.addEventListener("fetch", (event) => {
  // Handle navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, {
        redirect: "follow", // Explicitly follow redirects
      })
        .then((response) => {
          // If the response is a redirect, follow it
          if (response.redirected) {
            return response;
          }

          // For the root path, always redirect to login
          if (
            event.request.url.endsWith("/") ||
            event.request.url.endsWith("/index.html")
          ) {
            return Response.redirect("/login", 302);
          }

          return response;
        })
        .catch(() => {
          // If fetch fails, try to serve from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If not in cache and it's the root path, redirect to login
            if (
              event.request.url.endsWith("/") ||
              event.request.url.endsWith("/index.html")
            ) {
              return Response.redirect("/login", 302);
            }
            // For other pages, return a fallback
            return caches.match("/login");
          });
        })
    );
    return;
  }

  // For non-navigation requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request, {
        redirect: "follow", // Explicitly follow redirects
      }).then((response) => {
        // Don't cache redirects
        if (response.redirected) {
          return response;
        }

        // Cache successful responses for static assets
        if (
          response.status === 200 &&
          event.request.destination !== "document"
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});

// Update Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
