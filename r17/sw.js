/* App da R-17: rede primeiro (sempre a versão mais nova); sem internet, usa a cópia guardada.
   Não guarda nada do banco (Supabase), só os arquivos do próprio site. */
const CACHE = 'r17-v8';
const BASICO = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './fcosta.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICO)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(n => Promise.all(n.filter(x => x.startsWith('r17-') && x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== self.location.origin) return;
  e.respondWith(fetch(req, {cache: 'no-cache'}).then(res => { if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; })
    .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
