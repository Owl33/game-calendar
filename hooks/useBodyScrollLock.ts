// hooks/useBodyScrollLock.ts
"use client";

import { useEffect, useRef } from "react";

export function useBodyScrollLock(locked: boolean) {
  const touchStartY = useRef(0);

  useEffect(() => {
    if (!locked) return;

    const KEY_BLOCK = new Set(["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," "]);

    const isEditable = (el: HTMLElement | null) => {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return ["input","textarea","select"].includes(tag) || el.isContentEditable === true;
    };

    const isScrollable = (el: HTMLElement | null) => {
      if (!el) return false;
      const style = getComputedStyle(el);
      const oy = style.overflowY;
      return /(auto|scroll)/.test(oy) && el.scrollHeight > el.clientHeight;
    };

    /**
     * 모달 영역 한정 탐색 규칙
     * - 1순위: 타겟 기준 가장 가까운 [data-modal-scroller] 중 "스크롤 가능한" 요소
     * - 2순위: 타겟→조상으로 올라가며 "스크롤 가능한" 요소
     * - 3순위: 근처 모달 루트([data-modal-root]) 안에서 명시된 스크롤러를 찾아 스크롤 가능한지 확인
     */
    const findScrollable = (start: HTMLElement | null): HTMLElement | null => {
      const root = start?.closest?.("[data-modal-root='true']") as HTMLElement | null;

      // 1) 가장 가까운 명시 스크롤러가 실제로 스크롤 가능한지
      const markedClosest = start?.closest?.("[data-modal-scroller='true']") as HTMLElement | null;
      if (isScrollable(markedClosest)) return markedClosest;

      // 2) 조상 방향으로 스크롤 가능한 요소 찾기 (root를 경계로)
      let el: HTMLElement | null = start;
      while (el && el !== document.body && (!root || el !== root)) {
        if (isScrollable(el)) return el;
        el = el.parentElement;
      }

      // 3) 루트 안에서 명시된 스크롤러를 찾아보되, 스크롤 가능한지 검증
      if (root) {
        const fallbackMarked = root.querySelector("[data-modal-scroller='true']") as HTMLElement | null;
        if (isScrollable(fallbackMarked)) return fallbackMarked;
      }
      return null;
    };
const epsilon = 1; // 1px 오차 허용

const canScroll = (el: HTMLElement, deltaY: number) => {
  if (el.scrollHeight <= el.clientHeight) return false;
  if (deltaY < 0) return el.scrollTop > epsilon; // 위
  if (deltaY > 0) return el.scrollTop + el.clientHeight + epsilon < el.scrollHeight; // 아래
  return true;
};

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      const scroller = findScrollable(target);
      if (!scroller || !canScroll(scroller, e.deltaY)) {
        e.preventDefault();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches?.[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      const scroller = findScrollable(target);
      const currentY = e.touches?.[0]?.clientY ?? 0;
      const deltaY = touchStartY.current - currentY;
      if (!scroller || !canScroll(scroller, deltaY)) {
        e.preventDefault();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!KEY_BLOCK.has(e.key)) return;
      const target = e.target as HTMLElement | null;
      if (isEditable(target)) return;

      const scroller = findScrollable(target);
      if (!scroller) {
        e.preventDefault();
        return;
      }
      const keyDelta =
        e.key === "ArrowUp" || e.key === "PageUp" || e.key === "Home" ? -1 : 1;
      if (!canScroll(scroller, keyDelta)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("touchstart", onTouchStart as any);
      window.removeEventListener("touchmove", onTouchMove as any);
      window.removeEventListener("keydown", onKeyDown as any);
    };
  }, [locked]);
}
