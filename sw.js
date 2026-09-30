var CACHE = "ferramentaria-v1";

self.addEventListener("install", function(){ self.skipWaiting(); });

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.map(function(k){ return k===CACHE ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Rede primeiro: online mostra sempre a versão publicada mais recente;
// sem rede, devolve a última visitada.
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(resp){
      if(resp && resp.status===200 && resp.type==="basic"){
        var copia=resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copia); });
      }
      return resp;
    }).catch(function(){
      return caches.match(e.request).then(function(m){
        return m || caches.match("./index.html") || caches.match("./");
      });
    })
  );
});
