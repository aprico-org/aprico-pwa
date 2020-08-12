var CACHE = 'v0.1.0b27';

// On install, cache some resources.
self.addEventListener('install', function(evt) {
	// [debug] console.log('[SW]: The service worker is being installed. Version ' + CACHE);

	// install next version
	self.skipWaiting();

	// Ask the service worker to keep installing until the returning promise
	// resolves.
	evt.waitUntil(precache());
});

// On fetch, use cache first strategy.
self.addEventListener('fetch', function(evt) {
	evt.respondWith(fromCache(evt.request));
});

// Open a cache and use `addAll()` with an array of assets to add all of them
// to the cache. Return a promise resolving when all the assets are added.
// Adding versioning to URLS. Omg, caching is hard...
function precache() {
	return caches.open(CACHE).then(function(cache) {
		return cache.addAll([
			'/?' + CACHE,
			'/dist/css/index.css?' + CACHE,
			'/dist/js/bundle.js?' + CACHE,
			'/site.webmanifest?' + CACHE,
			'/favicon.ico?' + CACHE
		]);
	});
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
	// [debug] console.log('[SW]: Handling request for: ', request.url, request);
	return caches.open(CACHE).then(function(cache) {
		// The `ignoreSearch` means that query params will be ignored
		// Man, naming is hard too!
		return cache.match(request, { 'ignoreSearch': true }).then(function(response) {

			if (response !== undefined) {
				// [debug] console.log('[SW]: Response from cache for: ', response.url, response);
				return response;
			} else {

				return fetch(request).then(function(response) {
					// response may be used only once
					// we need to save clone to put one copy in cache
					// and serve second one
					let responseClone = response.clone();
					// [debug] console.log('[SW]: Response from network for ', responseClone.url, responseClone);

					caches.open(CACHE).then(function(cache) {
						cache.put(request, responseClone);
					});
					return response;
				})
			}
		});
	}).catch((error) => {

		console.log('[SW]: Fetch error. ', error);

		// responds with a redirect to the app as fallback,
		// there is nothing else one can do here anyway...
		return Response.redirect('/', 302);
	});
}


// delete old cache keys
self.addEventListener('activate', (event) => {
	var cacheKeeplist = CACHE;

	event.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(keyList.map((key) => {
				if (cacheKeeplist.indexOf(key) === -1) {
					// [debug] console.log('[SW]: Deleting old cache key: ' + key);
					return caches.delete(key);
				}
			}));
		})
	);
});