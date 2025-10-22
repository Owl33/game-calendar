// components/ui/modal-overlay.tsx
"use client";

import { motion, AnimatePresence, usePresence, type Transition } from "motion/react";
import type { MotionProps } from "motion/react";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { Button } from "../ui/button";
import { X } from "lucide-react";
type MotionLike = Pick<MotionProps, "initial" | "animate" | "exit" | "transition">;

type Variant = "centered" | "fullscreen";
type Size = "sm" | "md" | "lg" | "xl" | "2xl";

export interface ModalOverlayProps extends MotionLike {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;

  title:string | undefined;
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

  // ESC로 닫기
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEscape, onClose]);

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
        shadow && "sm:shadow-2xl",
      );
    }
    // centered: 모바일 풀스크린, 데스크톱 센터 카드
    return cn(
  "fixed inset-0 z-[105] flex flex-col overflow-hidden",
  "h-dvh w-full bg-card/95",            // 모바일(기본) 꽉 차게
  border && "border-t border-border/60",
  // centered 전환
  "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
  "lg:w-full lg:max-w-2xl",
  `lg:h-[${desktopHeight}]`,                       // 데스크탑 높이
  shadow && "lg:shadow-2xl",
  border && "lg:border lg:border-border/60 lg:rounded-2xl",
  contentClassName
    );
  }, [variant, size, border, shadow]);

 

  return (
    <AnimatePresence initial={false} mode="wait">
      {open && (
        <>
          <motion.div
            key="overlay"
            className={overlayBase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            onClick={() => closeOnBackdrop && onClose()}
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
            onClick={(e) => e.stopPropagation()}
          >
             <div className="px-5 pt-5 pb-3 border-b flex items-center justify-between">
                <h2 className="text-base font-semibold">{title}</h2>
                <Button
                  onClick={() => onClose()}
                  variant="ghost"
                  className="h-8 w-8 rounded-full inline-flex items-center justify-center "
                  aria-label={`${title} 닫기`}
                >
                  <X></X>
                </Button>
              </div>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ModalOverlay;
