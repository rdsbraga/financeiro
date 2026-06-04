// Financeiro Família — Service Worker v3
// Muda o número da versão para forçar atualização do cache

var CACHE = 'ff-v3';

// Recursos estáticos para cache offline
var STATIC = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-512.png'
];

// NUNCA cachear estes arquivos — precisam sempre vir do servidor
var NEVER_CACHE = [
  '/manifest.json',
  '/sw.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll(STATIC);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;

  // Nunca intercepta chamadas ao Apps Script ou Google
  if(url.indexOf('script.google.com') > -1) return;
  if(url.indexOf('googleapis.com') > -1) return;
  if(url.indexOf('gstatic.com') > -1) return;

  // Nunca cacheia manifest.json e sw.js — sempre busca do servidor
  var path = new URL(url).pathname;
  if(NEVER_CACHE.indexOf(path) > -1){
    e.respondWith(fetch(e.request));
    return;
  }

  // Para o resto: tenta rede primeiro, cai no cache se offline
  e.respondWith(
    fetch(e.request).then(function(res){
      // Cacheia recursos estáticos atualizados
      if(res && res.status === 200){
        var clone = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
      }
      return res;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
