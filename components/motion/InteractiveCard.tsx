/**
 * InteractiveCard - 호버/탭/조건부 애니메이션 카드
 * GameCard, CalendarDay 등에 사용
 */

import { motion } from "motion/react";
import { ReactNode, memo, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
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

export const InteractiveCard = memo(
  forwardRef<HTMLDivElement, InteractiveCardProps>(function InteractiveCard({
  children,
  className,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
  delay = 0,
  duration = 0.15,
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
}: InteractiveCardProps, ref) {
    // 조건부 애니메이션 (isActive가 있을 경우) - 최적화
    const animateProps =
      isActive !== undefined
        ? isActive
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
            }
        : { opacity: 1, y: 0, scale: 1 };

    // 호버 애니메이션 - 최적화
    const hoverProps: Record<string, number | string | string[]> = {
      scale: hoverScale,
      y: hoverY,
      ...(hoverRotateX && { rotateX: hoverRotateX }),
      ...(hoverRotateY && { rotateY: hoverRotateY }),
      ...(hoverShadow && { boxShadow: hoverShadow }),
    };

    // transition 설정 - 최적화
    const transition = Array.isArray(hoverShadow)
      ? {
          delay,
          scale: { duration, ease: "easeOut" as const },
          y: { duration, ease: "easeOut" as const },
          boxShadow: {
            duration: duration * 3,
            ease: "easeOut" as const,
            times: [0, 0.3, 1],
          },
        }
      : {
          delay,
          scale: { duration, ease: "easeOut" as const },
          y: { duration, ease: "easeOut" as const },
        };

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        initial={false}
        animate={animateProps}
        whileHover={hoverProps}
        whileTap={{ scale: tapScale }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        transition={transition}
        style={{
          willChange: "transform",
          ...(preserve3d ? { transformStyle: "preserve-3d" } : {}),
          ...style,
        }}
        onClick={onClick}>
        {children}
      </motion.div>
    );
  })
);
