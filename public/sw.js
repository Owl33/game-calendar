// // Service Worker for Image Caching
// // Version: 1.1.0

// const CACHE_VERSION = 'v1';
// const CACHE_NAME = `game-calendar-${CACHE_VERSION}`;
// const IMAGE_CACHE_NAME = `game-images-${CACHE_VERSION}`;

// const MAX_IMAGE_CACHE_SIZE = 200;

// const STATIC_ASSETS = [
//   '/fonts/PretendardVariable.woff2',
//   '/fonts/SpoqaHanSansNeo-Regular.woff2',
//   '/fonts/SpoqaHanSansNeo-Medium.woff2',
//   '/fonts/SpoqaHanSansNeo-Bold.woff2',
// ];

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => cache.addAll(STATIC_ASSETS))
//       .catch((err) => console.warn('[SW] Failed to cache static assets:', err))
//       .then(() => self.skipWaiting())
//   );
// });

// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((names) =>
//       Promise.all(
//         names
//           .filter((n) => n !== CACHE_NAME && n !== IMAGE_CACHE_NAME)
//           .map((n) => caches.delete(n))
//       )
//     ).then(() => self.clients.claim())
//   );
// });

// self.addEventListener('fetch', (event) => {
//   const { request } = event;
//   const url = new URL(request.url);

//   // 1) GET만 처리
//   if (request.method !== 'GET') return;

//   // 2) 이미지 요청 판별 (가장 안정적)
//   const isImageDestination = request.destination === 'image';

//   // 3) Next/Image 최적화 경로도 캐싱
//   const isNextImage = url.pathname.startsWith('/_next/image');

//   // 4) 직접 확장자 매칭(프록시/리라이트 대비)
//   const isImageLikePath = /\.(png|jpe?g|webp|avif|gif|ico)$/i.test(url.pathname);

//   if (!(isImageDestination || isNextImage || isImageLikePath)) {
//     // 이미지가 아니면 패스
//     return;
//   }

//   event.respondWith(
//     caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
//       const cached = await cache.match(request);
//       if (cached) {
//         console.log('[SW] Cache HIT:', url.pathname.slice(0, 80));
//         // Stale-While-Revalidate를 원하면 여기서 백그라운드 업데이트도 가능
//         // cache.add(request).catch(() => {});
//         return cached;
//       }

//       console.log('[SW] Cache MISS, fetching:', url.pathname.slice(0, 80));

//       try {
//         const networkResponse = await fetch(request);

//         // ✅ opaque(0) 응답도 캐시에 저장 (CORS 없는 CDN 대응)
//         if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
//           cache.put(request, networkResponse.clone());
//           manageCacheSize(cache); // fire-and-forget
//         }

//         return networkResponse;
//       } catch (err) {
//         console.error('[SW] Fetch failed:', err);
//         // 필요시 placeholder 이미지 반환 가능
//         return new Response('Network error', { status: 408, statusText: 'Request Timeout' });
//       }
//     })
//   );
// });

// async function manageCacheSize(cache) {
//   try {
//     const keys = await cache.keys();
//     if (keys.length > MAX_IMAGE_CACHE_SIZE) {
//       const deleteCount = keys.length - MAX_IMAGE_CACHE_SIZE;
//       for (let i = 0; i < deleteCount; i++) {
//         await cache.delete(keys[i]);
//       }
//       console.log(`[SW] Cleaned cache: removed ${deleteCount} old images`);
//     }
//   } catch (e) {
//     console.warn('[SW] Cache trim error:', e);
//   }
// }

// self.addEventListener('message', (event) => {
//   if (event.data?.type === 'SKIP_WAITING') {
//     self.skipWaiting();
//   }

//   if (event.data?.type === 'GET_CACHE_INFO') {
//     caches.open(IMAGE_CACHE_NAME)
//       .then((cache) => cache.keys())
//       .then((keys) => {
//         event.ports[0]?.postMessage({
//           type: 'CACHE_INFO',
//           count: keys.length,
//           maxSize: MAX_IMAGE_CACHE_SIZE,
//         });
//       });
//   }

//   if (event.data?.type === 'CLEAR_CACHE') {
//     caches.delete(IMAGE_CACHE_NAME).then(() => {
//       console.log('[SW] Cache cleared by request');
//       event.ports[0]?.postMessage({ type: 'CACHE_CLEARED', success: true });
//     });
//   }
// });
