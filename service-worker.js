const CACHE_NAME = 'fitness-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // only handle same-origin GET requests
  if (event.request.method !== 'GET') return;
  const reqUrl = new URL(event.request.url);
  if (reqUrl.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResp => {
        // optionally cache the fetched response (clone) if you want:
        // const respClone = fetchResp.clone();
        // caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
        return fetchResp;
      }).catch(() => {
        // fallback: return offline page if available
        return caches.match('./index.html');
      });
    })
  );
});
