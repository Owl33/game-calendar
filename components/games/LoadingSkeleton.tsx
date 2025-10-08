/**
 * LoadingSkeleton - 게임 로딩 스켈레톤
 */

"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { SkeletonPulse } from "@/components/motion/SkeletonPulse";

export function LoadingSkeleton() {
  return (
    <FadeIn>
      <div className="space-y-3">
        <FadeSlide
          direction="left"
          distance={20}
          delay={0.05}
          duration={0.2}
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPulse
              key={i}
              className="h-[260px] rounded-xl bg-muted/30 animate-pulse"
              delay={0.2}
            />
          ))}
        </FadeSlide>
      </div>
    </FadeIn>
  );
}
