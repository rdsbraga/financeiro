var CACHE = 'ff-v5';
var STATIC = [
  '/financeiro/',
  '/financeiro/index.html',
  '/financeiro/icon-192.png',
  '/financeiro/icon-512.png'
];
var NEVER_CACHE = [
  '/financeiro/manifest.json',
  '/financeiro/sw.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(STATIC); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  if(url.indexOf('script.google.com')>-1) return;
  if(url.indexOf('googleapis.com')>-1) return;
  if(url.indexOf('gstatic.com')>-1) return;
  var path = new URL(url).pathname;
  if(NEVER_CACHE.indexOf(path)>-1){ e.respondWith(fetch(e.request)); return; }
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res && res.status===200){
        var clone=res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request,clone); });
      }
      return res;
    }).catch(function(){ return caches.match(e.request); })
  );
});
