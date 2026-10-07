// ============================================
// sw.js — Network-Only Service Worker
// PWA installable, TAPI butuh internet
// Iklan Google tetap kehitung ✅
// ============================================

const SW_VERSION = 'byd-pwa-v1';
const OFFLINE_URL = './offline.html';

const BYPASS_HOSTS = [
  'googlesyndication.com',
  'googleadservices.com',
  'doubleclick.net',
  'googletagmanager.com',
  'google-analytics.com',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'gstatic.com',
  'cloudinary.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.tailwindcss.com',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'i.ibb.co.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SW_VERSION).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== SW_VERSION).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (BYPASS_HOSTS.some((h) => url.hostname.includes(h))) return;
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => res)
      .catch(() => {
        if (req.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        return new Response('', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});
