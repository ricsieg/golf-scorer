// Rob's Golf Mob — Service Worker v13
const CACHE = 'rgm-v13';
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
      Promise.all(keys.map(k => {
        console.log('Deleting cache:', k);
        return caches.delete(k); // delete ALL caches including current
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firebasedatabase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic.com/firebasejs')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Network first — always try fresh, fall back to cache
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
