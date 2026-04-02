// Cache version — Vercel injects VERCEL_GIT_COMMIT_SHA at build time
// This means every new deployment gets a unique cache name → old cache cleared automatically
const CACHE = 'affordit-' + (self.CACHE_VERSION || Date.now());

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install — cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // activate immediately, don't wait
  );
});

// Activate — delete ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE) // keep only current cache
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim()) // take control immediately
  );
});

// Fetch — network first, fall back to cache
// Network-first means users always get fresh content when online
self.addEventListener('fetch', e => {
  // Skip non-GET and API calls — never cache those
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Clone and update cache with fresh version
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => {
        // Offline fallback — serve from cache
        return caches.match(e.request);
      })
  );
});
