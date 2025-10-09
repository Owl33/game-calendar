"use client";

import { memo, useMemo, useState } from "react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AnimatePresence, motion } from "motion/react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { getYouTubeEmbedUrl } from "@/utils/media";

type Media = { type: "image" | "video"; url: string };

function GameMediaGallery({
  gameName,
  backgroundImage,
  headerImage,
  mediaList,
}: {
  gameName: string;
  backgroundImage?: string;
  headerImage?: string | null;
  mediaList: Media[];
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const dedupedMedia = useMemo(() => {
    const map = new Map<string, Media>();
    for (const m of mediaList) {
      map.set(`${m.type}:${m.url}`, m);
    }
    return Array.from(map.values());
  }, [mediaList]);
  const safeIdx = selectedIdx < dedupedMedia.length ? selectedIdx : 0;
  const selected = dedupedMedia[safeIdx];
  const mainImageSrc = useMemo(() => {
    if (selected?.type === "image" && selected.url) return selected.url;
    if (headerImage && headerImage.trim().length > 0) return headerImage;
    return undefined;
  }, [selected, headerImage]);

  return (
    <>
      {/* 히어로 배경 (옵션) */}
      {backgroundImage && (
        <div
          className="absolute inset-x-0 -m-4 h-[76vh] lg:-mx-8 lg:-mt-8 top-0  lg:h-[64vh]  -z-10"
          style={
            {
              // 한 번에 튜닝할 수 있게 변수화
              "--fadePx": "50px", // 이미지 하단 페이드 길이(px)
              "--blurHeight": "10px", // 블러 스트립 높이(px)
              "--blurFeatherTop": "1px", // 블러 시작 지점의 프리-페더(px)
              "--topShade": 0.65, // 상단 음영 강도(0~1)
            } as React.CSSProperties
          }>
          {/* 1) 이미지 래퍼: 하단을 투명으로 깎기(색 섞지 않음) */}
          <div
            className="absolute inset-0"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0, black calc(100% - var(--fadePx)), transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, black 0, black calc(100% - var(--fadePx)), transparent 100%)",
            }}>
            <Image
              key={`bg-${backgroundImage}`}
              fill
              src={backgroundImage}
              alt={` background`}
              className="object-cover opacity-40 scale-[1.06] will-change-transform"
              sizes="100%"
              priority
            />

            {/* 1-1) 상단 음영 — 하단 25%는 아예 ‘마스크로’ 잘라, 아래쪽과 절대 겹치지 않게 */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(to bottom,
              rgba(0,0,0,var(--topShade)) 0%,
              rgba(0,0,0,0.4) 40%,
              rgba(0,0,0,0.15) 60%,
              rgba(0,0,0,0.06) 70%,
              transparent 80%)`,
                WebkitMaskImage: "linear-gradient(to bottom, black 0, black 75%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, black 0, black 75%, transparent 100%)",
              }}
            />
          </div>

          {/* 2) 블러 스트립: 실제 뒤 배경을 흐림(backdrop) + 상단 12px 프리-페더로 ‘툭’ 제거 */}
          <div
            className="pointer-events-none absolute inset-x-0 [isolation:isolate]"
            style={{
              bottom: "calc(var(--blurOverlap) * -1)",
              height: "var(--blurHeight)",
              backdropFilter: "blur(22px) saturate(108%)",
              WebkitBackdropFilter: "blur(22px) saturate(108%)",
              // 상단은 완전 투명 → 12px까지 아주 살짝 → 아래로 갈수록 서서히
              WebkitMaskImage: `linear-gradient(to bottom,
            rgba(0,0,0,0) 0,
            rgba(0,0,0,0.06) var(--blurFeatherTop),
            rgba(0,0,0,0.22) calc(var(--blurFeatherTop) + 24px),
            rgba(0,0,0,0.5)  calc(var(--blurFeatherTop) + 60px),
            rgba(0,0,0,0.75) calc(var(--blurFeatherTop) + 96px),
            black 100%)`,
              maskImage: `linear-gradient(to bottom,
            rgba(0,0,0,0) 0,
            rgba(0,0,0,0.06) var(--blurFeatherTop),
            rgba(0,0,0,0.22) calc(var(--blurFeatherTop) + 24px),
            rgba(0,0,0,0.5)  calc(var(--blurFeatherTop) + 60px),
            rgba(0,0,0,0.75) calc(var(--blurFeatherTop) + 96px),
            black 100%)`,
            }}
          />

          {/* 3) 바닥 세이프가드: 블러가 완전 투명으로 끝난 '아래'에서만 노출 */}
          {/* <div
            className="pointer-events-none absolute inset-x-0"
            style={{
              // 블러 스트립보다 더 아래에서 시작(겹침 방지)
              bottom: "calc((var(--blurOverlap) + 24px) * -1)",
              height: "calc(var(--blurHeight) + 72px)",
              background: "var(--background)",
            }}
          /> */}
        </div>
      )}

      {mediaList.length > 0 && (
        <>
          <AspectRatio
            ratio={16 / 9}
            className="bg-black/90 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-xl">
            <AnimatePresence mode="wait">
              {selected?.type === "video" ? (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full">
                  <iframe
                    src={getYouTubeEmbedUrl(selected.url)}
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    key={`${selected.url}-${gameName}-${Math.random()}`}
                    title={`${gameName} Trailer`}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`image-${selectedIdx}`}
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full h-full">
                  {mainImageSrc ? (
                    <Image
                      key={`main-${mainImageSrc}`}
                      fill
                      src={mainImageSrc}
                      alt={gameName}
                      className="object-cover"
                      sizes="(max-width: 1280px) 100%, 60vw"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-xs text-muted-foreground">
                      이미지 없음
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </AspectRatio>

          {/* 썸네일 (데스크톱) */}
          <div className="mt-3 hidden sm:grid grid-cols-6 gap-2">
            {dedupedMedia.map((m, i) => (
              <button
                key={`${m.type}-${m.url}-d-${i}`} // 2) index 포함해 유니크 보장
                className={cn(
                  "rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02]",
                  safeIdx === i
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-white/10"
                )}
                onClick={() => setSelectedIdx(i)}>
                <AspectRatio ratio={16 / 9}>
                  {m.type === "video" ? (
                    <div className="w-full h-full bg-black/80 flex items-center justify-center">
                      <Play className="w-6 h-6" />
                    </div>
                  ) : (
                    <Image
                      fill
                      src={m.url}
                      alt={`${gameName} media ${i + 1}`}
                      className="object-cover"
                      sizes="200px"
                      loading="eager"
                    />
                  )}
                </AspectRatio>
              </button>
            ))}
          </div>

          {/* 썸네일 (모바일) */}
          <div className="sm:hidden -mx-3 px-3 mt-3">
            <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none]">
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {dedupedMedia.map((m, i) => (
                <button
                  key={`${m.type}-${m.url}-m-${i}`} // 2) index 포함
                  className={cn(
                    "min-w-[46%] snap-start rounded-xl overflow-hidden border-2 transition-all",
                    safeIdx === i ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                  )}
                  onClick={() => setSelectedIdx(i)}>
                  <AspectRatio ratio={16 / 9}>
                    {m.type === "video" ? (
                      <div className="w-full h-full bg-black/80 flex items-center justify-center">
                        <Play className="w-6 h-6" />
                      </div>
                    ) : (
                      <Image
                        fill
                        src={m.url}
                        alt={`${gameName} media ${i + 1}`}
                        className="object-cover"
                        sizes="50vw"
                      />
                    )}
                  </AspectRatio>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default memo(GameMediaGallery);
