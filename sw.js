/* Service worker do Painel FCosta.
   Estratégia: rede primeiro (você sempre vê a versão mais nova do GitHub);
   se estiver sem internet, usa a cópia guardada. Só mexe em arquivos do próprio site. */
const CACHE = 'painel-fcosta-v4';
// Guarda só páginas e arquivos pequenos. Vídeos, o manual do carro e fotos grandes
// NÃO são guardados, para não encher o armazenamento do celular.
const MAX_ITENS = 80;
const NAO_GUARDAR = /\.(mp4|webm|mov|m4v|mp3|wav|pdf|zip|exe)$|manual-fiat-idea-2012\.html$|\/v-[^/]+\.(jpg|png)$/i;
const BASICO = ['./', './index.html', './manifest.json', './icone-tela-inicial-192.png', './icone-tela-inicial-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASICO)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('painel-fcosta-') && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // sites externos: o navegador resolve
  // O Mercado (pasta mercado/) tem o próprio app e a própria cópia guardada.
  // O painel não mexe nele, senão, sem internet, o Mercado abria o painel no lugar.
  if (url.pathname.indexOf('/mercado/') > -1 || /\/mercado$/.test(url.pathname)) return;
  // vídeos e arquivos grandes: o navegador busca direto, sem guardar cópia
  if (req.headers.has('range') || req.destination === 'video' || req.destination === 'audio' || NAO_GUARDAR.test(url.pathname)) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const tam = +(res.headers.get('content-length') || 0);
        if (res && res.ok && res.type === 'basic' && tam < 3000000) {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copia).then(() => c.keys()).then((ks) => {
            // mantém no máximo MAX_ITENS cópias (apaga as mais antigas)
            if (ks.length > MAX_ITENS) return Promise.all(ks.slice(0, ks.length - MAX_ITENS).map((k) => c.delete(k)));
          })).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
