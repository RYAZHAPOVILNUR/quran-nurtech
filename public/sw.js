// Service worker: офлайн-доступ к прочитанным страницам + шелл/шрифты/данные.
// Стратегия: ассеты/шрифты — cache-first; данные — stale-while-revalidate;
// HTML/навигация — network-first (свежесть онлайн, кэш офлайн). Внешние (аудио CDN) не трогаем.
const V = 'quran-v6-mushaf-sajda-flow';
const ASSET = /\/(assets|fonts)\//;
const DATA = /\/data\//;
const MUSHAF_FONT_HOST = 'verses.quran.foundation';
const pendingWrites = new Set();

function storeResponse(event, cache, request, response) {
  const write = cache.put(request, response.clone()).catch(() => false);
  pendingWrites.add(write);
  event.waitUntil(write.then(() => { pendingWrites.delete(write); }));
}

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'MUSHAF_CACHE_STATUS' || !event.ports[0]) return;
  event.waitUntil((async () => {
    try {
      const urls = event.data.urls;
      if (!Array.isArray(urls) || urls.length !== 1322 || urls.some((value) => {
        const url = new URL(value);
        return url.origin !== self.location.origin && url.hostname !== MUSHAF_FONT_HOST;
      })) throw new Error('Invalid offline manifest');
      await Promise.all([...pendingWrites]);
      const cache = await caches.open(V);
      const saved = new Set((await cache.keys()).map((request) => request.url));
      event.ports[0].postMessage({ version: V, missing: urls.filter((url) => !saved.has(url)) });
    } catch {
      event.ports[0].postMessage({ error: 'Cache unavailable' });
    }
  })());
});

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== V).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin && url.hostname !== MUSHAF_FONT_HOST) return; // аудио-CDN и прочие внешние — мимо

  if (url.hostname === MUSHAF_FONT_HOST && url.pathname.includes('/fonts/quran/hafs/')) {
    e.respondWith(cacheFirst(req, e));
    return;
  }

  if (ASSET.test(url.pathname)) {
    e.respondWith(cacheFirst(req, e));
  } else if (DATA.test(url.pathname)) {
    e.respondWith(staleWhileRevalidate(req, e));
  } else if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(networkFirst(req, e));
  } else {
    e.respondWith(cacheFirst(req, e));
  }
});

async function cacheFirst(req, event) {
  const c = await caches.open(V);
  const hit = await c.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) storeResponse(event, c, req, res);
    return res;
  } catch {
    return hit || Response.error();
  }
}
async function networkFirst(req, event) {
  const c = await caches.open(V);
  try {
    const res = await fetch(req);
    if (res.ok) storeResponse(event, c, req, res);
    return res;
  } catch {
    return (await c.match(req)) || (await c.match('/')) || Response.error();
  }
}
async function staleWhileRevalidate(req, event) {
  const c = await caches.open(V);
  const hit = await c.match(req);
  const net = fetch(req)
    .then((res) => {
      if (res.ok) storeResponse(event, c, req, res);
      return res;
    })
    .catch(() => hit);
  event.waitUntil(net.then(() => {}));
  return hit || net;
}
