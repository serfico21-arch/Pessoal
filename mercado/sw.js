/* App do cliente Pinheiro & Costa.
   Rede primeiro: o cliente sempre vê preços e produtos novos.
   Sem internet, abre a última cópia guardada. Não guarda nada do banco (Supabase). */
const CACHE = 'pinheiro-costa-v13';
const BASICO = ['./', './index.html', './qrcode.js', './manifest.webmanifest',
  './img/icone-192.png', './img/loja-mercearia-p.webp', './img/fcosta-sistemas-96.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICO)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(n => Promise.all(n.filter(x => x.startsWith('pinheiro-costa-') && x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/painel/') || url.pathname.includes('/instalador/')) return; // a Central não entra no app do cliente
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match('./index.html')))
  );
});
