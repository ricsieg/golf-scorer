const CACHE='rgm-v4';
const ASSETS=['/','/index.html','/manifest.webmanifest',
  '/icons/icon-72.png','/icons/icon-96.png','/icons/icon-128.png',
  '/icons/icon-144.png','/icons/icon-152.png','/icons/icon-192.png',
  '/icons/icon-384.png','/icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(cached=>{if(cached)return cached;return fetch(e.request).then(res=>{if(res&&res.status===200&&res.type==='basic'){const cl=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}return res;}).catch(()=>caches.match('/index.html'));}));});
