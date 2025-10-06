/**
 * FadeSlide - 페이드 + 슬라이드 애니메이션 wrapper
 * 리스트 아이템, 카드 등에 사용
 */

import { motion } from "motion/react";
import { ReactNode } from "react";

interface FadeSlideProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
  layout?: boolean;
}

export function FadeSlide({
  children,
  direction = "up",
  distance = 20,
  delay = 0,
  duration = 0.3,
  className,
  layout = false,
}: FadeSlideProps) {
  const getDirectionValue = () => {
    switch (direction) {
      case "up":
        return { y: distance };
      case "down":
        return { y: -distance };
      case "left":
        return { x: distance };
      case "right":
        return { x: -distance };
      default:
        return { y: distance };
    }
  };

  const directionValue = getDirectionValue();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directionValue }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...directionValue }}
      transition={{
        delay,
        duration,
        ease: "easeOut",
      }}
      layout={layout}>
      {children}
    </motion.div>
  );
}
