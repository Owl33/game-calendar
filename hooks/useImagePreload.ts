"use client";

import { useEffect, useState } from "react";

export function useImagePreload(urls: string[], totalTimeoutMs = 4000, perImageTimeoutMs = 8000) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    if (!urls || urls.length === 0) {
      setReady(true);
      return;
    }

    const unique = Array.from(new Set(urls.filter(Boolean)));
    const loadOne = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        let done = false;
        const finish = () => {
          if (!done) {
            done = true;
            resolve();
          }
        };
        const timer = window.setTimeout(finish, perImageTimeoutMs);
        img.onload = () => {
          window.clearTimeout(timer);
          finish();
        };
        img.onerror = () => {
          window.clearTimeout(timer);
          finish();
        };
        img.src = src;
      });

    const globalTimer = window.setTimeout(() => !cancelled && setReady(true), totalTimeoutMs);

    Promise.all(unique.map(loadOne))
      .then(() => !cancelled && setReady(true))
      .finally(() => window.clearTimeout(globalTimer));

    return () => {
      cancelled = true;
      window.clearTimeout(globalTimer);
    };
  }, [urls, totalTimeoutMs, perImageTimeoutMs]);

  return ready;
}
