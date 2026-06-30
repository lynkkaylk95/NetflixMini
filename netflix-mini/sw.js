const CACHE_NAME = "cinemx-cache-v1";
const ASSETS = [
  "/", "/index.html", "/css/style.css",
  "/js/app.js", "/js/config.js", "/js/github.js", "/js/movie.js", "/js/admin.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

// No-cache para movies.json: siempre debe traer datos frescos.
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("movies.json")) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});
