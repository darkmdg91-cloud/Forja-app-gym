/* Service worker de Forja: funciona sin conexión y muestra el aviso diario */
importScripts('phrases.js');
const CACHE = 'forja-v4';
const CDN_CACHE = 'forja-cdn';
const CDN_HOSTS = ['cdn.jsdelivr.net', 'storage.googleapis.com'];
const ASSETS = ['./', 'index.html', 'phrases.js', 'music.js', 'hunt.js', 'train.js', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== CDN_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// Red primero (para recibir actualizaciones); si no hay conexión, caché.
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // detector de flexiones (librería y modelo): caché primero, para que funcione sin conexión
  if (CDN_HOSTS.includes(u.host)) {
    e.respondWith(caches.open(CDN_CACHE).then(async (c) => {
      const m = await c.match(r); if (m) return m;
      const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res;
    }));
    return;
  }
  if (u.origin !== location.origin) return;
  e.respondWith(
    fetch(r)
      .then((res) => {
        if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); }
        return res;
      })
      .catch(() => caches.match(r).then((m) => m || caches.match('index.html')))
  );
});

function getProfile() {
  return new Promise((res) => {
    const o = indexedDB.open('forja', 1);
    o.onupgradeneeded = () => o.result.createObjectStore('kv');
    o.onerror = () => res(null);
    o.onsuccess = () => {
      try {
        const g = o.result.transaction('kv').objectStore('kv').get('profile');
        g.onsuccess = () => res(g.result || null);
        g.onerror = () => res(null);
      } catch (err) { res(null); }
    };
  });
}

self.addEventListener('push', (e) => {
  e.waitUntil((async () => {
    let data = {};
    try { data = e.data ? e.data.json() : {}; } catch (err) {}
    let msg;
    if (data.title) msg = data;
    else { let p = null; try { p = await getProfile(); } catch (err) {} msg = self.forjaDaily(p, new Date()); }
    await self.registration.showNotification(msg.title, {
      body: msg.body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'forja-daily'
    });
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
      for (const c of cs) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow('./');
    })
  );
});
