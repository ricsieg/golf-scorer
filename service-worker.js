// Rob's Golf Mob — Service Worker v17
const CACHE = 'rgm-v17';
const ASSETS = [
  '/golf-scorer/',
  '/golf-scorer/index.html',
  '/golf-scorer/manifest.webmanifest',
  '/golf-scorer/icons/icon-72.png',
  '/golf-scorer/icons/icon-96.png',
  '/golf-scorer/icons/icon-128.png',
  '/golf-scorer/icons/icon-144.png',
  '/golf-scorer/icons/icon-152.png',
  '/golf-scorer/icons/icon-192.png',
  '/golf-scorer/icons/icon-384.png',
  '/golf-scorer/icons/icon-512.png'
];

// Install — cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — only delete OLD caches, keep current
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — never intercept Firebase or Google API requests
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Let ALL external requests go directly to network — never cache them
  if (!url.startsWith(self.location.origin)) {
    e.respondWith(fetch(e.request));
    return;
  }

  // For our own files — network first, fall back to cache
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
