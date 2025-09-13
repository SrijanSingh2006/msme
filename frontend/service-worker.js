const CACHE = 'msme-v1';
const assets = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/cashbook.html',
  '/payroll.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(assets)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
