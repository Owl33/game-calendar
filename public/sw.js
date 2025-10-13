// Service Worker for Image Caching
// Version: 1.0.0

const CACHE_VERSION = 'v1';
const CACHE_NAME = `game-calendar-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `game-images-${CACHE_VERSION}`;

// 이미지 호스트 목록
const IMAGE_HOSTS = [
  'shared.akamai.steamstatic.com',
  'media.rawg.io',
  'images.unsplash.com',
];

// 캐시할 최대 이미지 수 (메모리 관리)
const MAX_IMAGE_CACHE_SIZE = 200;

// 캐시할 정적 리소스
const STATIC_ASSETS = [
  '/fonts/PretendardVariable.woff2',
  '/fonts/SpoqaHanSansNeo-Regular.woff2',
  '/fonts/SpoqaHanSansNeo-Medium.woff2',
  '/fonts/SpoqaHanSansNeo-Bold.woff2',
];

// Install 이벤트: Service Worker 설치 시
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      // 폰트 등 정적 리소스 미리 캐싱 (선택사항)
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn('[SW] Failed to cache static assets:', error);
      });
    }).then(() => {
      // 새 Service Worker를 즉시 활성화
      return self.skipWaiting();
    })
  );
});

// Activate 이벤트: 새 Service Worker 활성화 시
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    // 이전 버전 캐시 삭제
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // 모든 클라이언트에서 즉시 Service Worker 제어 활성화
      return self.clients.claim();
    })
  );
});

// Fetch 이벤트: 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 이미지 요청인지 확인
  const isImage = IMAGE_HOSTS.some((host) => url.hostname.includes(host));

  // 이미지가 아니면 네트워크로 바로 전달
  if (!isImage) {
    return;
  }

  // 이미지 요청 처리: Cache First with Network Fallback
  event.respondWith(
    caches.open(IMAGE_CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // 캐시된 이미지가 있으면 즉시 반환
          console.log('[SW] Cache HIT:', url.pathname.slice(0, 50));
          return cachedResponse;
        }

        // 캐시에 없으면 네트워크에서 가져오기
        console.log('[SW] Cache MISS, fetching:', url.pathname.slice(0, 50));

        return fetch(event.request)
          .then((networkResponse) => {
            // 성공한 응답만 캐싱 (200 OK)
            if (networkResponse && networkResponse.status === 200) {
              // 응답을 복제하여 캐시에 저장
              cache.put(event.request, networkResponse.clone());

              // 캐시 크기 관리 (비동기로 실행)
              manageCacheSize(cache);
            }

            return networkResponse;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            // 네트워크 실패 시 기본 이미지 또는 에러 처리
            // (선택사항: 플레이스홀더 이미지 반환 가능)
            return new Response('Network error', {
              status: 408,
              statusText: 'Request Timeout',
            });
          });
      });
    })
  );
});

// 캐시 크기 관리 함수
async function manageCacheSize(cache) {
  const keys = await cache.keys();

  if (keys.length > MAX_IMAGE_CACHE_SIZE) {
    // 가장 오래된 항목 삭제 (FIFO)
    const deleteCount = keys.length - MAX_IMAGE_CACHE_SIZE;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
    console.log(`[SW] Cleaned cache: removed ${deleteCount} old images`);
  }
}

// Message 이벤트: 클라이언트로부터 메시지 수신
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // 캐시 정보 요청
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    caches.open(IMAGE_CACHE_NAME).then((cache) => {
      return cache.keys();
    }).then((keys) => {
      event.ports[0].postMessage({
        type: 'CACHE_INFO',
        count: keys.length,
        maxSize: MAX_IMAGE_CACHE_SIZE,
      });
    });
  }

  // 캐시 초기화 요청
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(IMAGE_CACHE_NAME).then(() => {
      console.log('[SW] Cache cleared by request');
      event.ports[0].postMessage({
        type: 'CACHE_CLEARED',
        success: true,
      });
    });
  }
});
