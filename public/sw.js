// Service Worker для PlantShop (v1.2.0)
const CACHE_NAME = 'plantshop-v1.2.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
  // Примітка: JS та CSS файли не додаємо до cache - вони будуть завантажені динамічно
  // це запобігає проблемам з версіонуванням при оновленнях
];

// Встановлення Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активація Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехоплення запитів
self.addEventListener('fetch', event => {
  // Адмінку не кешуємо (уникаємо офлайн-кеша для admin.html)
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && url.pathname === '/admin.html') {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Повертаємо кешовану версію, якщо вона є
        if (response) {
          return response;
        }
        
        // Інакше робимо мережевий запит
        return fetch(event.request).then(response => {
          // Перевіряємо, чи є валідний відгук
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Клонуємо відгук
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Повертаємо fallback для HTML сторінок
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Обробка push повідомлень
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Нові рослини в каталозі!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Переглянути',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Закрити',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('PlantShop', options)
  );
});

// Обробка кліків по повідомленнях
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Обробка синхронізації в фоновому режимі
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Функція для фонової синхронізації
function doBackgroundSync() {
  return new Promise((resolve, reject) => {
    // Тут можна додати логіку синхронізації даних
    console.log('Background sync completed');
    resolve();
  });
} 