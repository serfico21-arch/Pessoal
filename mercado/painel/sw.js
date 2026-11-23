/* Endereço mudou para /pdv/. Este service worker apaga a cópia antiga e se desliga. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(n => Promise.all(n.filter(x => x.startsWith('pinheiro-costa-') || x.startsWith('central-pc-')).map(x => caches.delete(x))))
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll()).then(cs => cs.forEach(c => c.navigate(c.url))));
});
