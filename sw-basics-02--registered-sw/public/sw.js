self.addEventListener("install", (event) => {
  console.log("[Service Worker] installed", event);
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] activated", event);
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  console.log("[Service Worker] fetched", event);
  event.respondWith(fetch(event.request));
});
