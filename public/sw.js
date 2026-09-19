// Service worker de FinAPP: deja la app funcionando sin internet.
// Los archivos que genera Vite llevan un codigo en el nombre, asi que se
// guardan al usarlos, y la pagina principal se pide primero a internet para
// que las actualizaciones lleguen solas.
const CACHE = 'finapp-v1';
const BASE = '/FinAPP/';
const BASICOS = [BASE, BASE + 'manifest.webmanifest', BASE + 'icon-192.png', BASE + 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(BASICOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // Pagina principal: primero internet, y si no hay, la ultima copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(BASE, copia));
          return res;
        })
        .catch(() => caches.match(BASE))
    );
    return;
  }

  // Resto de archivos: primero la copia guardada, y si no existe, internet.
  e.respondWith(
    caches.match(req).then(
      (guardado) =>
        guardado ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return res;
        })
    )
  );
});
