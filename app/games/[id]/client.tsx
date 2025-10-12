"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { gameKeys, fetchGameDetail } from "@/lib/queries/game";
import { GameDetailSkeleton } from "@/app/games/components/GameDetailSkeleton"; // 기존 경로 유지
import GameHero from "./components/GameHero";
import GameMediaGallery from "./components/GameMediaGallery";
import GameInfoPanel from "./components/GameInfoPanel";
import GameStatCard from "./components/GameStatCard";
import GameDescription from "./components/GameDescription";
import Image from "next/image";
import { ThumbsUp, Trophy, UserPlus, ArrowLeft } from "lucide-react";
import { useImagePreload } from "@/hooks/useImagePreload";
import { cn } from "@/lib/utils";

export default function GameDetailClient({ gameId }: { gameId: string }) {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: gameKeys.detail(gameId),
    queryFn: ({ signal }) => fetchGameDetail(gameId, signal),
    enabled: !!gameId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // fetcher가 envelope 또는 data만 반환하는 경우를 모두 포용
  const game: any = (data as any)?.data ?? (data as any);
  // 미디어 리스트
  const mediaList = useMemo(
    () => [
      ...(game?.videoUrl ? [{ type: "video" as const, url: game.videoUrl }] : []),
      ...(Array.isArray(game?.screenshots)
        ? game.screenshots.map((url: string) => ({ type: "image" as const, url }))
        : []),
    ],
    [game?.videoUrl, game?.screenshots]
  );

  const backgroundImage: string | undefined = Array.isArray(game?.screenshots)
    ? game.screenshots[0]
    : undefined;

  // 프리로드 (최초 6장 + 배경)
  const preloadTargets = useMemo(() => {
    const set = new Set<string>();
    if (backgroundImage) set.add(backgroundImage);
    mediaList.slice(0, 6).forEach((m) => m.type === "image" && set.add(m.url));
    return Array.from(set);
  }, [backgroundImage, mediaList]);
  const isImagesReady = useImagePreload(preloadTargets, 4000);

  if (isLoading) return <GameDetailSkeleton />;
  if (error || !game) {
    return (
      <div className="container mx-auto min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive text-lg">게임 정보를 불러올 수 없습니다.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
        </div>
      </div>
    );
  }
  if (!isImagesReady) return <GameDetailSkeleton />;

  return (
    <div className="relative">
      {backgroundImage && (
        <div
          className={cn(
            // 절대배치 + 부모 기준 꽉 채우기
            "absolute inset-0 top-0 -z-10 lg:-m-8 -m-4",
            // 높이(원하는 값으로 조정)
            "h-[76vh] lg:h-[64vh]",
            // 가로 넘침 방지 + 페인트 경계 고정
            "overflow-x-clip [contain:paint]"
          )}
          style={
            {
              // 페이드/블러 조정 변수
              "--fadePx": "56px", // 하단 페이드 길이
              "--blurHeight": "12px", // 블러 스트립 높이
              "--blurFeatherTop": "2px", // 블러 시작 페더
              "--topShade": 0.65, // 상단 음영 강도
            } as React.CSSProperties
          }>
          {/* 1) 이미지 래퍼: 마스크 + 오버플로우 클립 */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0, black calc(100% - var(--fadePx)), transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, black 0, black calc(100% - var(--fadePx)), transparent 100%)",
            }}>
            <Image
              key={`bg-${backgroundImage}`}
              src={backgroundImage}
              alt={`${backgroundImage} background`}
              fill
              // 스케일 제거(누수 방지). 필요하면 scale-[1.02] 정도만.
              className="object-cover opacity-40 will-change-transform"
              sizes="50vw"
              priority
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNhYWFhYWE7c3RvcC1vcGFjaXR5OjAuMiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzcwNzA3MDtzdG9wLW9wYWNpdHk6MC4yIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMjUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4="
            />

            {/* 상단 음영 (하단 25%는 마스크로 잘려 아래와 겹치지 않음) */}
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

          {/* 2) 블러 스트립: backdrop-filter는 종종 페인트 넘침 → 클립 유지 */}
          <div
            className="pointer-events-none absolute inset-x-0 [isolation:isolate] overflow-x-clip"
            style={{
              bottom: 0,
              height: "var(--blurHeight)",
              backdropFilter: "blur(22px) saturate(108%)",
              WebkitBackdropFilter: "blur(22px) saturate(108%)",
              WebkitMaskImage: `linear-gradient(to bottom,
                rgba(0,0,0,0) 0,
                rgba(0,0,0,0.08) var(--blurFeatherTop),
                rgba(0,0,0,0.22) calc(var(--blurFeatherTop) + 24px),
                rgba(0,0,0,0.5)  calc(var(--blurFeatherTop) + 60px),
                rgba(0,0,0,0.75) calc(var(--blurFeatherTop) + 96px),
                black 100%)`,
              maskImage: `linear-gradient(to bottom,
                rgba(0,0,0,0) 0,
                rgba(0,0,0,0.08) var(--blurFeatherTop),
                rgba(0,0,0,0.22) calc(var(--blurFeatherTop) + 24px),
                rgba(0,0,0,0.5)  calc(var(--blurFeatherTop) + 60px),
                rgba(0,0,0,0.75) calc(var(--blurFeatherTop) + 96px),
                black 100%)`,
            }}
          />
        </div>
      )}
      <div className="container  mx-auto ">
        {/* 상단 바 */}
        <div className="flex items-center justify-between py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 1, y: -200 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}>
          <div className="mt-4 mb-6 grid grid-cols-12 gap-4 max-[580px]:gap-3">
            <GameHero game={game} />
            {/* 통계 3종 */}
            <div className="col-span-12 grid grid-cols-3 max-[580px]:grid-cols-1 sm:grid-cols-3 gap-3">
              <GameStatCard
                icon={<ThumbsUp className="w-5 h-5" />}
                title="Steam 리뷰"
                game={game}
                kind="reviews"
              />
              <GameStatCard
                icon={<UserPlus className="w-5 h-5" />}
                title="Steam Followers"
                game={game}
                kind="followers"
              />
              <GameStatCard
                icon={<Trophy className="w-5 h-5" />}
                title="Metacritic"
                game={game}
                kind="metacritic"
              />
            </div>
          </div>
        </motion.div>

        {/* 본문 */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-10 max-[580px]:gap-x-4">
          <div className="col-span-12 xl:col-span-7">
            <motion.div
              initial={{ opacity: 1, x: -200, scale: 1 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, type: "spring" }}>
              <GameMediaGallery
                gameName={game.name}
                backgroundImage={backgroundImage}
                mediaList={mediaList}
                headerImage={game.headerImage}
              />
              <GameDescription html={game.description} />
            </motion.div>
          </div>
          <div className="col-span-12 xl:col-span-5">
            <motion.div
              initial={{ opacity: 1, x: 200, scale: 1 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="bg-card/40 rounded-2xl xl:sticky xl:top-6 ">
              <GameInfoPanel game={game} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
