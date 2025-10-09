// components/ScrollRestorer.tsx
"use client";
import { useEffect } from "react";
export default function ScrollRestorer({
  storageKey, ready, disabled = false,
}: { storageKey: string; ready: boolean; disabled?: boolean }) {
  useEffect(() => {
    if (disabled) return;
    const key = `scroll:${storageKey}`;
    const save = () => { try { sessionStorage.setItem(key, String(window.scrollY)); } catch {} };
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
      window.removeEventListener("beforeunload", save);
    };
  }, [storageKey, disabled]);
  useEffect(() => {
    if (disabled || !ready) return;
    const key = `scroll:${storageKey}`;
    const y = Number(sessionStorage.getItem(key));
    if (!Number.isNaN(y)) queueMicrotask(() => window.scrollTo({ top: y, behavior: "auto" }));
  }, [ready, storageKey, disabled]);
  return null;
}
