// components/games/GameMediaGallery.tsx
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
    for (const m of mediaList) map.set(`${m.type}:${m.url}`, m);
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
      {/* ==== HERO BACKGROUND (No horizontal overflow) ==== */}

      {/* ==== MAIN MEDIA (Video / Image) ==== */}
      {dedupedMedia.length > 0 && (
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
                    key={`${selected.url}-${gameName}`}
                    src={getYouTubeEmbedUrl(selected.url)}
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={`${gameName} Trailer`}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`image-${safeIdx}`}
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full h-full">
                  {mainImageSrc ? (
                    <Image
                      key={`main-${mainImageSrc}`}
                      src={mainImageSrc}
                      alt={gameName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 100vw, 60vw"
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

          {/* ==== THUMBNAILS — DESKTOP ==== */}
          <div className="mt-3 hidden sm:grid grid-cols-6 gap-2">
            {dedupedMedia.map((m, i) => (
              <button
                key={`${m.type}-${m.url}-d-${i}`}
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
                      src={m.url}
                      alt={`${gameName} media ${i + 1}`}
                      fill
                      className="object-cover"
                      priority
                      sizes="200px"
                    />
                  )}
                </AspectRatio>
              </button>
            ))}
          </div>

          {/* ==== THUMBNAILS — MOBILE (safe: no negative margins) ==== */}
          <div className="sm:hidden px-3 mt-3">
            <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none]">
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {dedupedMedia.map((m, i) => (
                <button
                  key={`${m.type}-${m.url}-m-${i}`}
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
                        src={m.url}
                        alt={`${gameName} media ${i + 1}`}
                        fill
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
