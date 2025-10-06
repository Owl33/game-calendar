/**
 * GameDetailSkeleton - 게임 상세 페이지 로딩 스켈레톤
 */

"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { SkeletonPulse } from "@/components/motion/SkeletonPulse";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function GameDetailSkeleton() {
  return (
    <FadeIn className="container pb-12 mx-auto min-h-screen relative">
      <div className="relative z-10">
        {/* Header */}
        <div className="mx-auto px-4 py-4">
          <SkeletonPulse className="h-9 w-24 rounded-md" delay={0} />
        </div>

        {/* Main Content */}
        <div className="mx-auto px-4">
          <div className="grid grid-cols-12 gap-x-12 gap-y-6">
            {/* Left: Media Skeleton */}
            <div className="col-span-12 lg:col-span-7 space-y-4">
              {/* Main Media */}
              <FadeSlide direction="up" delay={0.1}>
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-xl overflow-hidden">
                  <SkeletonPulse className="w-full h-full" delay={0.15} />
                </AspectRatio>
              </FadeSlide>

              {/* Thumbnails */}
              <FadeSlide direction="up" delay={0.15}>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <AspectRatio key={index} ratio={16 / 9}>
                      <SkeletonPulse className="w-full h-full rounded-lg" delay={0.2 + index * 0.05} />
                    </AspectRatio>
                  ))}
                </div>
              </FadeSlide>
            </div>

            {/* Right: Info Card Skeleton */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <FadeSlide direction="left" delay={0.2}>
                <div className="space-y-4">
                  {/* Title */}
                  <SkeletonPulse className="h-9 w-3/4" delay={0.25} />

                  {/* Release Date */}
                  <SkeletonPulse className="h-5 w-1/3" delay={0.3} />

                  {/* Popularity */}
                  <div className="space-y-2">
                    <SkeletonPulse className="h-4 w-16" delay={0.35} />
                    <SkeletonPulse className="h-7 w-20" delay={0.4} />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <SkeletonPulse className="h-4 w-20" delay={0.45} />
                    <div className="flex items-center justify-between">
                      <SkeletonPulse className="h-7 w-24" delay={0.5} />
                      <div className="flex gap-2">
                        <SkeletonPulse className="h-10 w-10 rounded-md" delay={0.55} />
                        <SkeletonPulse className="h-10 w-10 rounded-md" delay={0.6} />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <SkeletonPulse className="h-4 w-20" delay={0.65} />
                    <SkeletonPulse className="h-20 w-full" delay={0.7} />
                  </div>
                </div>
              </FadeSlide>

              {/* Developer & Publisher */}
              <FadeSlide direction="up" delay={0.3}>
                <div className="flex gap-12">
                  <div className="space-y-2">
                    <SkeletonPulse className="h-5 w-16" delay={0.75} />
                    <SkeletonPulse className="h-4 w-24" delay={0.8} />
                  </div>
                  <div className="space-y-2">
                    <SkeletonPulse className="h-5 w-16" delay={0.85} />
                    <SkeletonPulse className="h-4 w-24" delay={0.9} />
                  </div>
                </div>
              </FadeSlide>
            </div>

            {/* Bottom: Additional Info */}
            <FadeSlide direction="up" delay={0.35} className="col-span-12">
              <SkeletonPulse className="h-5 w-32" delay={0.95} />
            </FadeSlide>

            {/* Genres & Tags */}
            <FadeSlide direction="up" delay={0.4} className="col-span-12 lg:col-span-6 space-y-6">
              {/* Genres */}
              <div className="space-y-3">
                <SkeletonPulse className="h-5 w-16" delay={1.0} />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonPulse
                      key={index}
                      className="h-7 w-20 rounded-full"
                      delay={1.05 + index * 0.05}
                    />
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <SkeletonPulse className="h-5 w-16" delay={1.25} />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <SkeletonPulse
                      key={index}
                      className="h-6 w-16 rounded-full"
                      delay={1.3 + index * 0.05}
                    />
                  ))}
                </div>
              </div>
            </FadeSlide>

            {/* Languages */}
            <FadeSlide direction="up" delay={0.45} className="col-span-12 space-y-3">
              <SkeletonPulse className="h-4 w-20" delay={1.6} />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <SkeletonPulse
                    key={index}
                    className="h-6 w-12 rounded-full"
                    delay={1.65 + index * 0.05}
                  />
                ))}
              </div>
            </FadeSlide>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
