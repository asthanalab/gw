const staticCacheName = 'site-static-v93';
const assets = [
    './',
    './index.html',
    './manifest.json',
    './research.html',
    './funding.html',
    './outputs.html',
    './publications.html',
    './software.html',
    './people.html',
    './culture.html',
    './news.html',
    './join.html',
    './opportunities.html',
    './legal.html',
    './404.html',
    './robots.txt',
    './sitemap.xml',
    './style.css',
    './pages.css',
    './research.css',
    './assets/js/app.js',
    './assets/js/news.js',
    './assets/img/logoUND.jpeg'
];
// install event
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('caching shell assets');
            cache.addAll(assets);
        })
    );
    self.skipWaiting();
});
// activate event
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});
// When we change the name we could have multiple cache, to avoid that we need to delet the old cache, so with this function we check the key that is our cache naming, if it is different from the actual naming we delete it, in this way we will always have only the last updated cache.
self.addEventListener('fetch', evt => {
    const request = evt.request;
    const acceptsHtml = request.headers.get('accept')?.includes('text/html');

    if (request.mode === 'navigate' || acceptsHtml) {
        evt.respondWith(
            fetch(request)
                .then(networkRes => {
                    const copy = networkRes.clone();
                    caches.open(staticCacheName).then(cache => cache.put(request, copy));
                    return networkRes;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    evt.respondWith(
        caches.match(request).then(cacheRes => {
            if (cacheRes) return cacheRes;
            return fetch(request).then(networkRes => {
                if (request.url.startsWith(self.location.origin) && networkRes.ok) {
                    const copy = networkRes.clone();
                    caches.open(staticCacheName).then(cache => cache.put(request, copy));
                }
                return networkRes;
            });
        })
    );
});
