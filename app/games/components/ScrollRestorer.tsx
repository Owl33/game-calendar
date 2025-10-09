"use client";

import { useEffect } from "react";

export default function ScrollRestorer({
  storageKey,
  ready, // 데이터/DOM이 그려질 준비 완료 시점
}: {
  storageKey: string; // pathname + 쿼리 조합 등으로 유니크
  ready: boolean;
}) {
  // 저장: 떠날 때/언마운트 때
  useEffect(() => {
    const key = `scroll:${storageKey}`;
    const save = () => {
      try { sessionStorage.setItem(key, String(window.scrollY)); } catch {}
    };
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
      window.removeEventListener("beforeunload", save);
    };
  }, [storageKey]);

  // 복원: 데이터 준비 후 1회
  useEffect(() => {
    if (!ready) return;
    const key = `scroll:${storageKey}`;
    const y = Number(sessionStorage.getItem(key));
    if (!Number.isNaN(y)) {
      queueMicrotask(() => window.scrollTo({ top: y, behavior: "auto" }));
    }
  }, [ready, storageKey]);

  return null;
}
