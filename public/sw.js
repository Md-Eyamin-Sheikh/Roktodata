// Roktodata Service Worker for Offline Fallback & Web Push Notifications
const CACHE_NAME = 'roktodata-v3';
const isDev = typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
const STATIC_ASSETS = isDev ? ['/manifest.json'] : ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Don't cache API or supabase requests
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase.co')) {
    return;
  }
  // Intercept and swallow stale woff2 font requests from previous versions
  if (event.request.url.includes('.woff2')) {
    event.respondWith(
      fetch(event.request).then((res) => {
        if (!res.ok) {
          return new Response(new Uint8Array([]), {
            status: 200,
            headers: { 'Content-Type': 'font/woff2' },
          });
        }
        return res;
      }).catch(() => {
        return new Response(new Uint8Array([]), {
          status: 200,
          headers: { 'Content-Type': 'font/woff2' },
        });
      })
    );
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Push notification receiver
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: event.data.text() };
    }
  }

  const showNotificationPromise = (async () => {
    // If title is missing, fallback to fetching latest notification from API
    if (!data.title) {
      try {
        const res = await fetch('/api/notifications');
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const latest = json.data[0];
          data.title = latest.title;
          data.body = latest.description;
        }
      } catch (e) {
        data.title = '🚨 রক্তদাতা — জরুরি রক্তের ডাক';
        data.body = 'আপনার এলাকায় নতুন রক্তের অনুরোধ এসেছে!';
      }
    }

    const title = data.title || '🚨 রক্তদাতা — জরুরি রক্তের ডাক';
    const options = {
      body: data.body || 'আপনার এলাকায় জরুরি রক্তের প্রয়োজন!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200, 100, 200],
      tag: data.tag || 'roktodata-alert',
      renotify: true,
      data: { url: data.url || '/' },
      actions: [
        { action: 'open', title: 'অ্যাপ খুলুন' },
        { action: 'dismiss', title: 'বাতিল' },
      ],
    };

    return self.registration.showNotification(title, options);
  })();

  event.waitUntil(showNotificationPromise);
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
