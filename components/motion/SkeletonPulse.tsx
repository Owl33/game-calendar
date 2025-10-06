/**
 * SkeletonPulse - 스켈레톤 로딩 펄스 애니메이션
 * 로딩 상태 표시에 사용
 */

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface SkeletonPulseProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  delay?: number;
  duration?: number;
}

export function SkeletonPulse({
  className,
  width,
  height,
  delay = 0,
  duration = 1.2,
}: SkeletonPulseProps) {
  return (
    <motion.div
      className={cn("rounded bg-gray-200 dark:bg-gray-700", className)}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}
