const staticCacheName = 'site-static-v8';
const assets = [
    './',
    './index.html',
    './manifest.json',
    './research.html',
    './publications.html',
    './software.html',
    './people.html',
    './culture.html',
    './news.html',
    './opportunities.html',
    './legal.html',
    './404.html',
    './style.css',
    './pages.css',
    './assets/img/logoUND.jpeg',
    './assets/img/publications/chemically-decisive-benchmarks.png',
    './assets/img/publications/generalized-eigenvalue.jpeg',
    './assets/img/publications/quantum-krylov.png',
    './assets/img/publications/qseom-ga.gif',
    'https://fonts.googleapis.com/css?family=Lato:300,400,700'
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
// fetch event
self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request);
        })
    );
});
