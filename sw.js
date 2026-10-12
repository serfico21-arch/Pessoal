/* Service worker do Painel FCosta.
   Estratégia: rede primeiro (você sempre vê a versão mais nova do GitHub);
   se estiver sem internet, usa a cópia guardada. Só mexe em arquivos do próprio site. */
const CACHE = 'painel-fcosta-v1';
const BASICO = ['./', './index.html', './manifest.json', './icone-tela-inicial-192.png', './icone-tela-inicial-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASICO)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // sites externos: o navegador resolve
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
