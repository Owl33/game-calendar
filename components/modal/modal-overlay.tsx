// components/ui/modal-overlay.tsx
"use client";

import { motion, AnimatePresence, usePresence, type Transition } from "motion/react";
import type { MotionProps } from "motion/react";
import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type MotionLike = Pick<MotionProps, "initial" | "animate" | "exit" | "transition">;

type Variant = "centered" | "fullscreen";
type Size = "sm" | "md" | "lg" | "xl" | "2xl";

export interface ModalOverlayProps extends MotionLike {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;

  title?: string;
  /** 기본값으로도 충분하도록 내부 프리셋 제공 */
  variant?: Variant; // "centered"(모바일 풀, 데스크톱 센터 카드) | "fullscreen"
  size?: Size; // centered일 때만 적용 (max-w)
  desktopHeight?: string; // 예: "540px" | "90vh" (centered일 때만)

  /** 시각 옵션(오버레이/콘텐츠) */
  blur?: boolean; // overlay blur, 기본 true
  border?: boolean; // content border, 기본 true
  shadow?: boolean; // content shadow, 기본 true

  /** 필요 시 세부 커스텀 */
  contentClassName?: string;
  overlayClassName?: string;

  role?: "dialog" | "alertdialog";
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  closeOnBack?: boolean; // ← 추가: 뒤로가기로 닫기
  lockScroll?: boolean;
}

const DEFAULT_INITIAL = { opacity: 0, y: 16 };
const DEFAULT_ANIMATE = { opacity: 1, y: 0 };
const DEFAULT_EXIT = { opacity: 0, y: 8 };
const DEFAULT_TRANSITION: Transition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] };

export function ModalOverlay({
  open,
  onClose,
  children,
  title,
  // animation
  initial = DEFAULT_INITIAL,
  animate = DEFAULT_ANIMATE,
  exit = DEFAULT_EXIT,
  transition = DEFAULT_TRANSITION,
  // behavior
  role = "dialog",
  closeOnBackdrop = true,
  closeOnEscape = true,
  closeOnBack = true,
  lockScroll = true,
  // presets
  variant = "centered",
  size = "xl",
  desktopHeight,
  // visuals
  blur = true,
  border = true,
  shadow = true,
  // class overrides
  contentClassName,
  overlayClassName,
}: ModalOverlayProps) {
  // exit 동안에도 스크롤락 유지
  const [isPresent] = usePresence();
  useBodyScrollLock(lockScroll && (open || !isPresent));

  // --- 히스토리 관리용 ref들
  const pushedRef = useRef(false); // 이 모달이 열리며 pushState를 했는지
  const closingRef = useRef(false); // programmatic back() 중복 방지
  const popHandledRef = useRef(false); // popstate로 onClose 중복 호출 방지

  // 공통 닫기 요청(히스토리 정리 + onClose)
  const requestClose = useCallback(() => {
    // 우리가 pushState를 했다면, back()으로 되돌리고 popstate에서 onClose 처리
    if (closeOnBack && pushedRef.current && !closingRef.current) {
      closingRef.current = true;
      try {
        history.back();
      } catch {
        // 혹시 실패하면 직접 닫기
        onClose();
      } finally {
        // back()이 popstate를 트리거하므로 즉시 리셋하지 않고 다음 틱에서
        setTimeout(() => {
          closingRef.current = false;
        }, 0);
      }
      return;
    }
    // 히스토리 연동이 없으면 그냥 닫기
    onClose();
  }, [closeOnBack, onClose]);

  // ESC로 닫기
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEscape, requestClose]);

  // 뒤로가기(popstate)로 닫기 + 모달 열릴 때 히스토리 엔트리 push
  useEffect(() => {
    if (!closeOnBack) return;

    const onPopState = () => {
      // 모달이 열린 상태에서 우리가 푸시한 엔트리가 pop되면 → 모달 닫기
      if (open && pushedRef.current && !popHandledRef.current) {
        popHandledRef.current = true; // 중복 방지
        pushedRef.current = false;
        onClose();
      }
    };

    if (open) {
      try {
        history.pushState({ __modal: true, ts: Date.now() }, "", window.location.href);
        pushedRef.current = true;
      } catch {
        pushedRef.current = false; // 실패시 히스토리 연동 비활성
      }
      window.addEventListener("popstate", onPopState);
    }

    return () => {
      window.removeEventListener("popstate", onPopState);
      popHandledRef.current = false;

      // 모달이 닫히거나 언마운트될 때, 우리가 push했던 엔트리가 남아있으면 하나 되돌려 정리
      if (closeOnBack && pushedRef.current) {
        pushedRef.current = false;
        try {
          closingRef.current = true;
          history.back();
        } finally {
          setTimeout(() => {
            closingRef.current = false;
          }, 0);
        }
      }
    };
  }, [open, closeOnBack, onClose]);

  const overlayBase = cn(
    "fixed inset-0 z-[104] bg-black/60",
    blur && "backdrop-blur-sm",
    overlayClassName
  );

  const contentBase = useMemo(() => {
    if (variant === "fullscreen") {
      return cn(
        "fixed inset-0 z-[105] flex flex-col overflow-hidden",
        "bg-card/95",
        border && "border-t border-border/60 sm:border sm:rounded-none",
        shadow && "sm:shadow-2xl"
      );
    }
    // centered: 모바일 풀스크린, 데스크톱 센터 카드
    const desktopHeightClass = desktopHeight ? undefined : "lg:h-[540px]"; // desktopHeight가 있으면 인라인 style로 처리
    return cn(
      "fixed inset-0 z-[105] flex flex-col overflow-hidden",
      "sm:h-dvh w-full bg-card/95", // 모바일(기본) 꽉 차게
      border && "border-t border-border/60",
      // centered 전환
      "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
      "lg:w-full",
      "lg:h-[540px]",
      size === "sm" && "lg:max-w-sm",
      size === "md" && "lg:max-w-md",
      size === "lg" && "lg:max-w-lg",
      size === "xl" && "lg:max-w-2xl",
      size === "2xl" && "lg:max-w-3xl",
      desktopHeightClass,
      shadow && "lg:shadow-2xl",
      border && "lg:border lg:border-border/60 lg:rounded-2xl"
    );
  }, [variant, size, border, shadow, desktopHeight]);

  return (
    <AnimatePresence
      initial={false}
      mode="wait">
      {open && (
        <>
          <motion.div
            key="overlay"
            className={overlayBase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            onClick={() => closeOnBackdrop && requestClose()}
            style={{ pointerEvents: open ? "auto" : "none" }}
          />
          <motion.div
            key="content"
            role={role}
            aria-modal="true"
            tabIndex={-1}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={transition}
            className={cn(contentBase, contentClassName)}
            style={
              // desktopHeight가 주어졌으면 데스크톱에서만 적용
              variant === "centered" && desktopHeight
                ? ({ height: undefined } as React.CSSProperties)
                : undefined
            }
            onClick={(e) => e.stopPropagation()}>
            <div
              className="px-5 pt-5 pb-3 border-b flex items-center justify-between"
              style={
                variant === "centered" && desktopHeight ? ({} as React.CSSProperties) : undefined
              }>
              <h2 className="text-base font-semibold">{title}</h2>
              <Button
                onClick={requestClose}
                variant="ghost"
                className="h-8 w-8 rounded-full inline-flex items-center justify-center"
                aria-label={title ? `${title} 닫기` : "모달 닫기"}>
                <X />
              </Button>
            </div>

            {/* 콘텐츠 영역 */}
            <div
              className={cn(
                "flex-1 overflow-auto",
                variant === "centered" ? "lg:overflow-auto" : ""
              )}
              style={
                variant === "centered" && desktopHeight
                  ? ({ height: desktopHeight } as React.CSSProperties)
                  : undefined
              }>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ModalOverlay;
