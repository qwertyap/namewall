const CACHE = "namewall-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./firebase-config.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-maskable.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Never cache backend traffic - it must always hit the network.
  if (url.hostname.includes("googleapis.com") ||
      url.hostname.includes("firebaseio.com") ||
      url.hostname.includes("supabase.co") ||
      url.hostname.includes("esm.sh")) return;

  // App shell: network-first for navigations, cache-first for static assets.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("./index.html")));
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        const copy = res.clone();
        if (res.ok && url.origin === location.origin) {
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
    )
  );
});


