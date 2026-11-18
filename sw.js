const CACHE = 'agenda-v1';
const ARQS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const guardar = r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; };
  if (u.origin === location.origin) {
    // rede primeiro (pega atualizações), cache se estiver offline
    e.respondWith(fetch(e.request).then(guardar).catch(() => caches.match(e.request)));
  } else if (u.hostname === 'www.gstatic.com') {
    // bibliotecas do Firebase: cache primeiro
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(guardar)));
  }
});
