// Rob's Golf Mob — Service Worker v9 (GPS distance edition)
const CACHE = 'rgm-v9';
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

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never cache Firebase API calls — always go live
  if (e.request.url.includes('firebasedatabase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic.com/firebasejs')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/golf-scorer/index.html'));
    })
  );
});
