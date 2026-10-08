/* BornClock service worker — installable PWA + offline shell.
 *
 * Deliberately conservative to avoid the stale-HTML hazard documented in
 * functions/_worker.ts: HTML page shells carry hashed JS/CSS references, so a cached
 * shell can pin a stale bundle. Therefore this SW NEVER caches HTML navigations — they
 * are network-first and only fall back to a dedicated /offline.html when the device is
 * actually offline. Hashed, immutable static assets are cached stale-while-revalidate.
 * API calls (/api/*) are always passed straight through to the network.
 *
 * Bump CACHE_VERSION to force clients onto a fresh cache.
 */
const CACHE_VERSION = 'bornclock-v1';
const PRECACHE = `${CACHE_VERSION}-precache`;
const RUNTIME = `${CACHE_VERSION}-runtime`;

// Minimal, stable (non-hashed) shell assets.
const PRECACHE_URLS = [
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/bornclock-logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;    // leave cross-origin (fonts/analytics) alone
  if (url.pathname.startsWith('/api/')) return;        // never cache API responses

  // HTML navigations: network-first, offline.html fallback. Never cache the shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html', { ignoreSearch: true })),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.open(RUNTIME).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((resp) => {
          if (resp && resp.status === 200 && resp.type === 'basic') cache.put(request, resp.clone());
          return resp;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
