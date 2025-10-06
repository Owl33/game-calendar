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
        {Array.from({ length: 5 }).map((_, index) => (
          <FadeSlide
            key={index}
            direction="left"
            distance={20}
            delay={index * 0.05}
            duration={0.2}>
            <div className="flex items-center gap-3 p-3">
              <SkeletonPulse
                className="h-12 w-12 rounded-lg"
                delay={0}
              />
              <div className="flex-1">
                <SkeletonPulse
                  className="h-4 mb-2"
                  width="75%"
                  delay={0.15}
                />
                <SkeletonPulse
                  className="h-3"
                  width="50%"
                  delay={0.3}
                />
              </div>
            </div>
          </FadeSlide>
        ))}
      </div>
    </FadeIn>
  );
}
