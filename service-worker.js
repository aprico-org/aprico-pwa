var CACHE = 'v0.1.0beta3';

// On install, cache some resources.
self.addEventListener('install', function(evt) {
  console.log('The service worker is being installed.');

  // Ask the service worker to keep installing until the returning promise
  // resolves.
  evt.waitUntil(precache());
});

// On fetch, use cache only strategy.
self.addEventListener('fetch', function(evt) {
  //console.log('The service worker is serving the asset.');
  evt.respondWith(fromCache(evt.request));
});

// Open a cache and use `addAll()` with an array of assets to add all of them
// to the cache. Return a promise resolving when all the assets are added.
function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll([
      './',
      './dist/css/index.css',
      './dist/js/bundle.js',
      './site.webmanifest'
    ]);
  });
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request,{'ignoreSearch':true}).then(function (response) {
      
      //return matching || Promise.reject('no-match');
    if (response !== undefined) {
      console.log('response from cache',response);
      return response;
    } else {
      return fetch(request).then(function (response) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        let responseClone = response.clone();
        console.log('response from network',responseClone);

        caches.open(CACHE).then(function (cache) {
          cache.put(request, responseClone);
        });
        return response;
      })
    }
    });
  });
}

// Update consists in opening the cache, performing a network request and
// storing the new response data.
function update(request) {
  //return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  //});
}