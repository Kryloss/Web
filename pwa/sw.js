const CACHE_NAME = 'gym-planner-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './db.js',
    './canvas-ui/engine.js',
    './canvas-ui/screens/weeks.js',
    './canvas-ui/screens/planning.js',
    './canvas-ui/screens/nutrition.js',
    './pwa/manifest.json'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});