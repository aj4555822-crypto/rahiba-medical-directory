const CACHE_NAME = 'raheba-medical-cache-v1';
const urlsToCache = [
  '/',
  '/index.html', // اسم ملف الـ HTML الخاص بك
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@200;400;600;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// تثبيت الـ Service Worker وتخزين الملفات
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// تفعيل الـ Service Worker وحذف الكاش القديم
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// جلب الملفات من الكاش أو من الإنترنت
self.addEventListener('fetch', event => {
  // تجاهل طلبات Firebase و OneSignal حتى لا تتداخل مع آلياتهما الخاصة
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('onesignal.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // تحقق من صحة الاستجابة قبل تخزينها
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      }).catch(() => {
        // يمكن هنا إضافة صفحة Offline احتياطية
      })
  );
});
