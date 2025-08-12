// pwa/sw.js - basic app shell caching
const CACHE_NAME = 'gym-planner-v1';
const ASSETS = [
  './',
  '../index.html',
  '../core/util.js',
  '../core/engine.js',
  '../core/gestures.js',
  '../core/layout.js',
  '../core/sprites.js',
  '../core/inputOverlay.js',
  '../features/undo.js',
  '../features/settings.js',
  '../features/navigation.js',
  '../features/weeks.js',
  '../features/planning.js',
  '../features/nutrition.js',
  '../features/importExport.js',
  '../db.js',
  '../app.js',
  '../assets/icons.png',
  '../assets/icons/icon-192.png',
  '../assets/icons/icon-512.png'
];
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if(url.origin === location.origin){
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
  }
});
