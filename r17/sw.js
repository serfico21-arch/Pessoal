/* App da R-17: rede primeiro (sempre a versão mais nova); sem internet, usa a cópia guardada.
   Não guarda nada do banco (Supabase), só os arquivos do próprio site. */
const CACHE = 'r17-v13';
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

/* aviso de pedido novo no celular do dono (mesmo com o app fechado) */
self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch (x) { d = { title: '🔔 Novo pedido', body: 'Toque para ver no painel' }; }
  e.waitUntil(self.registration.showNotification(d.title || '🔔 Novo pedido', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: 'pedido-' + Date.now(),
    vibrate: [600, 200, 600, 200, 600, 200, 600], requireInteraction: true, data: { url: './?painel=1#adm' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const c of l) { if (c.url.includes('#adm') || c.url.includes('painel')) return c.focus(); }
    return self.clients.openWindow('./?painel=1#adm');
  }));
});
