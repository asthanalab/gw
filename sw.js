const staticCacheName = 'site-static-v75';
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
    './assets/img/logoUND.jpeg',
    './assets/img/optimized/group24-1600-v2.jpg',
    './assets/img/optimized/group24_24-1400.jpg',
    './assets/img/optimized/pacs-1200.jpg',
    './assets/img/optimized/gpAPS-1200.jpg',
    './assets/img/optimized/grp2-1200.jpg',
    './assets/img/optimized/bday1-1200.jpg',
    './assets/img/optimized/bday2-1200.jpg',
    './assets/img/optimized/catan-1200.jpg',
    './assets/img/optimized/groupacs-1200.jpg',
    './assets/img/optimized/sri-700.jpg',
    './assets/img/optimized/Mushir-700.jpg',
    './assets/img/optimized/adan-700.jpg',
    './assets/img/4.png',
    './assets/img/theme1.png',
    './assets/img/research-photoisomerism-martinez-no-title.png',
    './assets/img/research/heavy-element-orbitals-no-title.jpg',
    './assets/img/publications/chemically-decisive-benchmarks.png',
    './assets/img/publications/generalized-eigenvalue.jpeg',
    './assets/img/publications/quantum-krylov.png',
    './assets/img/publications/qseom-ga.gif',
    './assets/img/funding/arpa-e-logo.png',
    './assets/img/funding/nsf-logo.svg',
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
            return cacheRes || fetch(request);
        })
    );
});
