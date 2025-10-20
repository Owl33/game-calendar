/**
 * GameDetailSkeleton - 게임 상세 페이지 로딩 스켈레톤 (실제 UI와 동일한 구조)
 */

"use client";

import { SkeletonPulse } from "@/components/motion/SkeletonPulse";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function GameDetailSkeleton() {
  return (
    <div className="relative">
      {/* 배경 히어로 스켈레톤 */}
      <div className="fixed inset-x-0 top-0 h-[64vh] max-[580px]:h-[52vh] -z-10">
        <SkeletonPulse className="w-full h-full" delay={0} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
      </div>

      <div className="container mx-auto ">
        {/* 상단 바 - 뒤로가기 버튼 */}
        <div className="flex items-center justify-between py-4">
          <SkeletonPulse className="h-9 w-24 rounded-md" delay={0.1} />
        </div>

        <div className="mt-4 mb-6 grid grid-cols-12 gap-4 max-[580px]:gap-3">
          {/* 타이틀 섹션 */}
          <div className="col-span-12">
            <div className="text-white flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="space-y-3">
                {/* 게임 제목 + 웹사이트 버튼 */}
                <div className="flex items-center gap-4">
                  <SkeletonPulse className="h-10 w-64 rounded-md" delay={0.15} />
                  <SkeletonPulse className="h-9 w-32 rounded-md" delay={0.2} />
                </div>

                {/* 출시일 배지 */}
                <div className="flex items-center gap-3">
                  <SkeletonPulse className="h-7 w-32 rounded-md" delay={0.25} />
                  <SkeletonPulse className="h-7 w-20 rounded-md" delay={0.3} />
                  <SkeletonPulse className="h-4 w-64 rounded-md" delay={0.35} />
                </div>
              </div>

              {/* 플랫폼 아이콘 */}
              <div className="flex items-center gap-2 flex-wrap">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonPulse
                    key={index}
                    className="h-5 w-5 rounded-sm"
                    delay={0.4 + index * 0.05}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 통계 카드 3개 */}
          <div className="col-span-12 grid grid-cols-3 max-[580px]:grid-cols-1 sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <SkeletonPulse className="h-8 w-8 rounded-md" delay={0.5 + index * 0.1} />
                  <SkeletonPulse className="h-4 w-20 rounded-md" delay={0.55 + index * 0.1} />
                </div>
                <SkeletonPulse className="h-8 w-32 rounded-md" delay={0.6 + index * 0.1} />
                <SkeletonPulse className="h-3 w-24 rounded-md mt-2" delay={0.65 + index * 0.1} />
              </div>
            ))}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-10 max-[580px]:gap-x-4">
          {/* 왼쪽: 미디어 */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* 메인 미디어 */}
            <AspectRatio ratio={16 / 9} className="bg-black/90 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-xl">
              <SkeletonPulse className="w-full h-full" delay={0.8} />
            </AspectRatio>

            {/* 썸네일 그리드 (데스크톱) */}
            <div className="hidden sm:grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <AspectRatio key={index} ratio={16 / 9}>
                  <SkeletonPulse className="w-full h-full rounded-xl" delay={0.85 + index * 0.05} />
                </AspectRatio>
              ))}
            </div>

            {/* 썸네일 스크롤 (모바일) */}
            <div className="sm:hidden flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="min-w-[46%] snap-start">
                  <AspectRatio ratio={16 / 9}>
                    <SkeletonPulse className="w-full h-full rounded-xl" delay={0.85 + index * 0.05} />
                  </AspectRatio>
                </div>
              ))}
            </div>

            {/* 게임 소개 */}
            <section className="mt-6 rounded-2xl p-5 space-y-3">
              <SkeletonPulse className="h-6 w-24 rounded-md" delay={1.1} />
              <div className="space-y-2">
                <SkeletonPulse className="h-4 w-full rounded-md" delay={1.15} />
                <SkeletonPulse className="h-4 w-full rounded-md" delay={1.2} />
                <SkeletonPulse className="h-4 w-3/4 rounded-md" delay={1.25} />
              </div>
            </section>
          </div>

          {/* 오른쪽: 정보 패널 */}
          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* 출시 가격 */}
              <section className="rounded-2xl p-5 space-y-3">
                <SkeletonPulse className="h-4 w-20 rounded-md" delay={1.3} />
                <div className="flex items-center justify-between">
                  <SkeletonPulse className="h-7 w-32 rounded-md" delay={1.35} />
                  <div className="flex gap-2">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <SkeletonPulse
                        key={index}
                        className="h-8 w-20 rounded-md"
                        delay={1.4 + index * 0.05}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* 개발사/배급사 */}
              <section className="rounded-2xl p-5">
                <div className="grid sm:grid-cols-2 gap-6">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <SkeletonPulse className="h-4 w-4 rounded-sm" delay={1.5 + index * 0.1} />
                        <SkeletonPulse className="h-5 w-16 rounded-md" delay={1.55 + index * 0.1} />
                      </div>
                      <SkeletonPulse className="h-4 w-24 rounded-md" delay={1.6 + index * 0.1} />
                    </div>
                  ))}
                </div>
              </section>

              {/* 장르/태그/언어 */}
              <section className="rounded-2xl p-5 space-y-6">
                {/* 장르 */}
                <div className="space-y-3">
                  <SkeletonPulse className="h-5 w-12 rounded-md" delay={1.7} />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <SkeletonPulse
                        key={index}
                        className="h-6 w-16 rounded-md"
                        delay={1.75 + index * 0.05}
                      />
                    ))}
                  </div>
                </div>

                {/* 태그 */}
                <div className="space-y-3">
                  <SkeletonPulse className="h-5 w-12 rounded-md" delay={1.95} />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <SkeletonPulse
                        key={index}
                        className="h-6 w-14 rounded-md"
                        delay={2.0 + index * 0.05}
                      />
                    ))}
                  </div>
                </div>

                {/* 지원 언어 */}
                <div className="space-y-3">
                  <SkeletonPulse className="h-5 w-20 rounded-md" delay={2.4} />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <SkeletonPulse
                        key={index}
                        className="h-6 w-12 rounded-md"
                        delay={2.45 + index * 0.05}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* DLC */}
              <section className="rounded-2xl p-5 space-y-3">
                <SkeletonPulse className="h-6 w-40 rounded-md" delay={2.9} />
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <SkeletonPulse className="h-4 w-32 rounded-md" delay={2.95 + index * 0.1} />
                      <SkeletonPulse className="h-3 w-20 rounded-md" delay={3.0 + index * 0.1} />
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
