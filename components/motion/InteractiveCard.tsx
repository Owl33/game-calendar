/**
 * InteractiveCard - 호버/탭/조건부 애니메이션 카드
 * GameCard, CalendarDay 등에 사용
 */

import { motion } from "motion/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  // 기본 애니메이션
  initialY?: number;
  initialScale?: number;
  delay?: number;
  duration?: number;

  // 호버 애니메이션
  hoverScale?: number;
  hoverY?: number;
  hoverRotateX?: number;
  hoverRotateY?: number;
  hoverShadow?: string | string[];

  // 탭 애니메이션
  tapScale?: number;

  // 조건부 애니메이션 (CalendarDay용)
  isActive?: boolean;
  activeScale?: number;
  activeY?: number;
  activeShadow?: string;
  inactiveShadow?: string;

  // 3D 효과
  preserve3d?: boolean;
}

export function InteractiveCard({
  children,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  initialY = 20,
  initialScale = 0.9,
  delay = 0,
  duration = 0.2,
  hoverScale = 1.05,
  hoverY = -6,
  hoverRotateX = 0,
  hoverRotateY = 0,
  hoverShadow,
  tapScale = 0.95,
  isActive,
  activeScale,
  activeY,
  activeShadow,
  inactiveShadow,
  preserve3d = false,
}: InteractiveCardProps) {
  // 조건부 애니메이션 (isActive가 있을 경우)
  const getAnimateProps = () => {
    if (isActive !== undefined) {
      return isActive
        ? {
            opacity: 1,
            scale: activeScale ?? hoverScale,
            y: activeY ?? hoverY,
            boxShadow: activeShadow,
          }
        : {
            opacity: 1,
            scale: 1,
            y: 0,
            boxShadow: inactiveShadow,
          };
    }
    return { opacity: 1, y: 0, scale: 1 };
  };

  // 호버 애니메이션
  const getHoverProps = () => {
    const baseHover: any = {
      scale: hoverScale,
      y: hoverY,
    };

    if (hoverRotateX) baseHover.rotateX = hoverRotateX;
    if (hoverRotateY) baseHover.rotateY = hoverRotateY;

    // boxShadow 배열 지원
    if (hoverShadow) {
      baseHover.boxShadow = hoverShadow;
    }

    return baseHover;
  };

  // transition 설정
  const getTransition = () => {
    const baseTransition = {
      delay,
      scale: { duration, ease: "easeOut" as const },
      y: { duration, ease: "easeOut" as const },
    };

    // boxShadow 배열일 경우 특별한 transition
    if (Array.isArray(hoverShadow)) {
      return {
        ...baseTransition,
        boxShadow: {
          duration: duration * 3,
          ease: "easeOut" as const,
          times: [0, 0.3, 1],
        },
      };
    }

    return baseTransition;
  };

  return (
    <motion.div
      className={cn(className, )}
      initial={{ opacity: 0, y: initialY, scale: initialScale }}
      animate={getAnimateProps()}
      exit={{ opacity: 0, y: -initialY, scale: initialScale }}
      whileHover={getHoverProps()}
      whileTap={{ scale: tapScale }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      transition={getTransition()}
      style={preserve3d ? { transformStyle: "preserve-3d" } : undefined}
      onClick={onClick}>
      {children}
    </motion.div>
  );
}
