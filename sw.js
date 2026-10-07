const CACHE = 'little-sky-v2';
const FILES = ['./', './index.html', './style.css', './app.js', './games.js', './art.js', './audio.js', './manifest.webmanifest', './icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('little-sky-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
self.addEventListener('message', event => {
  if (event.data === 'CHECK_OFFLINE') {
    event.waitUntil(caches.open(CACHE).then(async cache => {
      const ready = (await Promise.all(FILES.map(file => cache.match(new URL(file, self.registration.scope).href)))).every(Boolean);
      event.source?.postMessage({ type: 'OFFLINE_STATUS', ready });
    }));
  }
});
