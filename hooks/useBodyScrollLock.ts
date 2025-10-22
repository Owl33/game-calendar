// hooks/useBodyScrollLock.ts
"use client";

import { useEffect, useRef } from "react";

/**
 * 전역 wheel/touchmove/keydown 이벤트만 막아서
 * 배경 스크롤을 못 하게 합니다.
 * - 스크롤바(우측 gutter)는 건드리지 않음 (깜빡임 X)
 * - 모달 내부 스크롤러([data-modal-scroller="true"])는 그대로 스크롤 허용
 * - iOS 터치 바운스 방지
 */
export function useBodyScrollLock(locked: boolean) {
  const touchStartY = useRef(0);

  useEffect(() => {
    if (!locked) return;

    const KEY_BLOCK = new Set([
      "ArrowUp",
      "ArrowDown",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      " ",
    ]);

    const isEditable = (el: HTMLElement | null) => {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      const editableTags = ["input", "textarea", "select"];
      return (
        editableTags.includes(tag) ||
        (el as HTMLElement).isContentEditable === true
      );
    };

    const findScrollable = (start: HTMLElement | null): HTMLElement | null => {
      // 명시적으로 표기한 스크롤러를 우선 허용
      const marked = start?.closest?.("[data-modal-scroller='true']") as
        | HTMLElement
        | null;
      if (marked) return marked;

      // fallback: 스크롤 가능한 조상 탐색
      let el: HTMLElement | null = start;
      while (el && el !== document.body) {
        const style = window.getComputedStyle(el);
        const canScrollY =
          /(auto|scroll)/.test(style.overflowY) &&
          el.scrollHeight > el.clientHeight;
        if (canScrollY) return el;
        el = el.parentElement;
      }
      return null;
    };

    const canScroll = (el: HTMLElement, deltaY: number) => {
      if (el.scrollHeight <= el.clientHeight) return false;
      if (deltaY < 0) {
        // 위로 스크롤
        return el.scrollTop > 0;
      } else if (deltaY > 0) {
        // 아래로 스크롤
        return el.scrollTop + el.clientHeight < el.scrollHeight;
      }
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
      const deltaY = touchStartY.current - currentY; // +면 아래로 스크롤 의도

      if (!scroller || !canScroll(scroller, deltaY)) {
        // 배경/꼭대기/바닥에서의 바운스 방지
        e.preventDefault();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!KEY_BLOCK.has(e.key)) return;
      const target = e.target as HTMLElement | null;
      if (isEditable(target)) return; // 입력 중에는 허용

      // 방향키/스페이스 등으로 배경 스크롤되는 것 차단.
      // 포커스된 요소가 스크롤러 위라면, 스크롤 가능할 때만 허용
      const scroller = findScrollable(target);
      if (!scroller) {
        e.preventDefault();
        return;
      }
      // 키 방향을 delta로 매핑
      const keyDelta =
        e.key === "ArrowUp" || e.key === "PageUp" || e.key === "Home"
          ? -1
          : 1;
      if (!canScroll(scroller, keyDelta)) {
        e.preventDefault();
      }
    };

    // passive: false 여야 preventDefault 가능
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
