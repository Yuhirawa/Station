// Service worker: funciona offline e sempre busca a versão mais nova quando há internet.
// Ao publicar uma versão nova, troque o número abaixo e o ?v= no index.html.
const CACHE = 'filling-v19';
const ASSETS = ['./', './index.html', './style.css?v=19', './app.js?v=19', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const sameOrigin = new URL(e.request.url).origin === location.origin;
  // mesma origem: sempre revalida com o servidor (evita misturar arquivos antigos e novos)
  const req = sameOrigin && e.request.mode !== 'navigate' ? new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }) : e.request;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && sameOrigin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
