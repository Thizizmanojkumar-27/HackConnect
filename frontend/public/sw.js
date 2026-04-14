/* eslint-disable no-restricted-globals */

// Minimal Service Worker to enable PWA "Add to Home Screen"
const CACHE_NAME = 'hackconnect-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through for now to satisfy PWA requirements without complex caching
  event.respondWith(fetch(event.request));
});
