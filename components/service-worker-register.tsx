"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Service Worker 지원 여부 확인
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.log("[SW] Service Worker not supported");
      return;
    }

    // HTTPS 또는 localhost 환경에서만 동작
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      console.log("[SW] Service Worker requires HTTPS");
      return;
    }

    // Service Worker 등록
    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
      })
      .then((registration) => {
        console.log("[SW] Service Worker registered successfully:", registration.scope);

        // 업데이트 확인
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // 새 버전 감지
                console.log("[SW] New Service Worker available");

                // 사용자에게 알림 표시 (선택사항)
                if (confirm("새로운 버전이 있습니다. 페이지를 새로고침하시겠습니까?")) {
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                  window.location.reload();
                }
              }
            });
          }
        });

        // 주기적 업데이트 확인 (1시간마다)
        setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000
        );
      })
      .catch((error) => {
        console.error("[SW] Service Worker registration failed:", error);
      });

    // Service Worker가 활성화될 때
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("[SW] Service Worker controller changed");
      // 필요시 페이지 리로드
      // window.location.reload();
    });

    // 개발 중 캐시 디버깅 도구 (선택사항)
    if (process.env.NODE_ENV === "development") {
      // @ts-expect-error - Adding debug method to window
      window.clearServiceWorkerCache = async () => {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const channel = new MessageChannel();

          return new Promise((resolve) => {
            channel.port1.onmessage = (event) => {
              console.log("[SW] Cache cleared:", event.data);
              resolve(event.data);
            };

            registration.active?.postMessage(
              { type: "CLEAR_CACHE" },
              [channel.port2]
            );
          });
        }
      };

      // @ts-expect-error - Adding debug method to window
      window.getServiceWorkerCacheInfo = async () => {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const channel = new MessageChannel();

          return new Promise((resolve) => {
            channel.port1.onmessage = (event) => {
              console.log("[SW] Cache info:", event.data);
              resolve(event.data);
            };

            registration.active?.postMessage(
              { type: "GET_CACHE_INFO" },
              [channel.port2]
            );
          });
        }
      };

      console.log(
        "[SW] Debug tools available:\n" +
          "  - window.clearServiceWorkerCache()\n" +
          "  - window.getServiceWorkerCacheInfo()"
      );
    }
  }, []);

  return null;
}
