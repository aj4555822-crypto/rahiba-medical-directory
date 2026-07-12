const CACHE_NAME = 'raheba-med-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // عدم اعتراض طلبات Firebase أو Google Maps أبداً
  if (url.origin.includes('firebaseio.com') || 
      url.origin.includes('googleapis.com') || 
      url.origin.includes('gstatic.com') || 
      url.origin.includes('google.com') || 
      url.origin.includes('googleMaps')) {
    return; // دع الطلب يمر مباشرة للإنترنت
  }

  // اعتراض باقي الطلبات (ملفات الموقع) والبحث عنها في الكاش
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
