/**
 * FadeIn - 단순 페이드 인/아웃 애니메이션
 * 컨테이너, 섹션 등에 사용
 */

import { motion } from "motion/react";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.3,
  className,
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        delay,
        duration,
        ease: "easeOut",
      }}>
      {children}
    </motion.div>
  );
}
