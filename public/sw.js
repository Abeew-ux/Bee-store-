// Bee Store Service Worker - Offline Cache & PWA Support
const CACHE_NAME = 'bee-store-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Install: Pre-cache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache non-fatal error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate for images / static assets, Network-First for dynamic data with Cache Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests or chrome-extension URLs
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Bypass Firestore or external write APIs to allow Firebase SDK to handle its own offline persistence
  if (request.url.includes('firestore.googleapis.com') || request.url.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  // For images / icons / static assets: Cache first or Stale-While-Revalidate
  const isImageOrFont =
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.url.match(/\.(png|jpg|jpeg|svg|webp|gif|woff2?)$/i);

  if (isImageOrFont) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // For HTML / Navigation: Network first, fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Default: Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for custom messages (e.g. force skip waiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
