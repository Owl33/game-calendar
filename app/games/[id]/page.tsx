"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import DOMPurify from "isomorphic-dompurify";
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import Steam from "@/public/icon/steam.png";
import Xbox from "@/public/icon/xbox.png";
import Psn from "@/public/icon/psn.png";
import Nintendo from "@/public/icon/nintendo.png";
import {
  ArrowLeft,
  Calendar,
  Play,
  Globe,
  Building2,
  Users,
  Trophy,
  ThumbsUp,
  UserPlus,
} from "lucide-react";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { GameDetailApiResponse } from "../types/game.types";
import { GameDetailSkeleton } from "../components/GameDetailSkeleton";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ---------- 유틸 ----------
function getYouTubeEmbedUrl(url: string | undefined) {
  if (!url) return undefined;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return m?.[1] ? `https://www.youtube.com/embed/${m[1]}` : undefined;
}

function findLogo(store: string) {
  switch (store) {
    case "steam":
      return Steam;
    case "psn":
      return Psn;
    case "playstation":
      return Psn;
    case "xbox":
      return Xbox;
    case "nintendo":
      return Nintendo;
    default:
      return Steam;
  }
}

function formatNumber(n?: number | null) {
  if (n === null || n === undefined) return "데이터 없음";
  return new Intl.NumberFormat("ko-KR").format(n);
}

/** 고유 이미지 URL들을 사전에 프리로드 (중복 컴포넌트 로드 방지) */
function preloadImages(urls: string[], perImageTimeoutMs = 8000): Promise<void> {
  if (typeof window === "undefined" || urls.length === 0) return Promise.resolve();
  const unique = Array.from(new Set(urls));
  const loadOne = (src: string) =>
    new Promise<void>((resolve) => {
      const img = new window.Image();
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      const timer = window.setTimeout(done, perImageTimeoutMs);
      img.onload = () => {
        window.clearTimeout(timer);
        done();
      };
      img.onerror = () => {
        window.clearTimeout(timer);
        done();
      };
      img.src = src;
    });
  return Promise.all(unique.map(loadOne)).then(() => undefined);
}

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [isImagesReady, setIsImagesReady] = useState(false);
  const [releaseDate, setReleaseDate] = useState(dayjs());
  // API
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["game", gameId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/games/${gameId}`);
      if (!response.ok) throw new Error("Failed to fetch game details");
      return response.json() as Promise<GameDetailApiResponse>;
    },
    enabled: !!gameId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const game = apiResponse?.data;
  console.log(game);
  // 미디어
  const mediaList = useMemo(
    () => [
      ...(game?.videoUrl ? [{ type: "video" as const, url: game.videoUrl }] : []),
      ...(game?.screenshots?.map((url: string) => ({ type: "image" as const, url })) || []),
    ],
    [game?.videoUrl, game?.screenshots]
  );

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const selectedMedia = mediaList[selectedMediaIndex];
  console.log(selectedMedia);
  const backgroundImage = game?.screenshots?.[0];

  // 프리로드
  const preloadUrls = useMemo(() => {
    if (!game) return [];
    const set = new Set<string>();
    if (backgroundImage) set.add(backgroundImage);
    const first = mediaList[0];
    if (first?.type === "image") set.add(first.url);
    mediaList.slice(0, 6).forEach((m) => m.type === "image" && set.add(m.url));
    return Array.from(set);
  }, [game, backgroundImage, mediaList]);

  useEffect(() => {
    let cancelled = false;
    setIsImagesReady(false);
    if (!game) return;
    const globalTimeout = window.setTimeout(() => {
      if (!cancelled) setIsImagesReady(true);
    }, 4000);
    preloadImages(preloadUrls)
      .then(() => !cancelled && setIsImagesReady(true))
      .finally(() => window.clearTimeout(globalTimeout));
    // setReleaseDate(dayjs.tz(game.releaseDate).tz("Asia/Seoul"));
    console.log(releaseDate);
    return () => {
      cancelled = true;
      window.clearTimeout(globalTimeout);
    };
  }, [game, preloadUrls]);

  // 로딩/에러
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

  // 통계 데이터(없으면 “데이터 없음”)
  const totalReviews = game.totalReviews ?? null;
  const reviewScoreDesc = game.reviewScoreDesc ?? null;
  const followers =
    (game as any).followers ?? (game as any).followersCache ?? (game as any).steamFollowers ?? null;
  const metacritic = game.metacriticScore ?? null;

  const translateReviewDesc = () => {
    switch (reviewScoreDesc) {
      case "Overwhelmingly Positive":
        return <span style={{ color: "#308ABE" }}>압도적으로 긍정적</span>;
      case "Very Positive":
        return <span style={{ color: "#308ABE" }}>매우 긍정적</span>;
      case "Mostly Positive":
        return <span style={{ color: "#308ABE" }}>대체로 긍정적</span>;
      case "Positive":
        return <span style={{ color: "#308ABE" }}>긍정적</span>;
      case "Mixed":
        return <span style={{ color: "#90774B" }}>복합적</span>;
      case "Negative":
        return <span style={{ color: "##DF7544" }}>부정적</span>;
      case "Mostly Negative":
        return <span style={{ color: "##DF7544" }}>대체로 부정적</span>;
      case "Very Negative":
        return <span style={{ color: "##DF7544" }}>매우 부정적</span>;
      case "Overwhelmingly Negative":
        return <span style={{ color: "##DF7544" }}>압도적으로 부정적</span>;
      default:
        return <span>{"유저 리뷰 없음"}</span>;
    }
  };

  const reviewHtml = () => {
    return (
      <div className="">
        {translateReviewDesc()}
        <span className="ml-2 text-xl font-medium">{`(${formatNumber(totalReviews)})`}</span>
      </div>
    );
  };

  const calcDday = () => {
    console.log("typeof releaseDate:", typeof game.releaseDate); // 'string' ? 'object'(Date) ?
    const d = new Date(game.releaseDate as any);
    console.log("new Date(...).toISOString():", d.toISOString()); // 실제 절대시각
    console.log("dayjs raw parse:", dayjs(game.releaseDate as any).format());
    console.log(
      'new Date(game.releaseDate).toLocaleDateString("ko-KR")',
      new Date(game.releaseDate).toLocaleDateString("ko-KR")
    );
  };
  calcDday();
  return (
    <div className="relative">
      {/* 배경 히어로 */}
      {backgroundImage && (
        <div
          className="fixed inset-x-0 top-0 h-[64vh] max-[580px]:h-[52vh] -z-10"
          style={
            {
              // 한 번에 튜닝할 수 있게 변수화
              "--fadePx": "150px", // 이미지 하단 페이드 길이(px)
              "--blurHeight": "10px", // 블러 스트립 높이(px)
              "--blurFeatherTop": "32px", // 블러 시작 지점의 프리-페더(px)
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
              alt={`${game.name} background`}
              className="object-cover opacity-40 scale-[1.06] will-change-transform"
              sizes="100vw"
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
          <div
            className="pointer-events-none absolute inset-x-0"
            style={{
              // 블러 스트립보다 더 아래에서 시작(겹침 방지)
              bottom: "calc((var(--blurOverlap) + 24px) * -1)",
              height: "calc(var(--blurHeight) + 72px)",
              background: "var(--background)",
            }}
          />
        </div>
      )}

      <div className="container mx-auto  px-3 sm:px-4 md:px-6">
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
          initial={{ opacity: 1, y: -200, scale: 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: "spring" }}>
          {/* 타이틀 + 핵심 통계 카드 */}

          <div className="mt-4 mb-6 grid grid-cols-12 gap-4 max-[580px]:gap-3">
            <div className="bg-card/40  p-4 py-6 rounded-2xl col-span-12">
              <div className=" flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl sm:text-4xl font-extrabold tracking-tight">
                      {game.name}
                    </h1>
                    {game.website && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2"
                        onClick={() => window.open(game.website!, "_blank")}>
                        <Globe className="w-4 h-4" /> 공식 웹사이트
                      </Button>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-muted-foreground">
                    <Badge
                      variant="secondary"
                      className="ml-2 text-sm">
                      {game.releaseDate
                        ? new Date(game.releaseDate).toLocaleDateString("ko-KR")
                        : "출시일 정보 없음"}
                    </Badge>
                    {game.comingSoon && (
                      <div>
                        <Badge
                          variant="outline"
                          className="text-sm">
                          출시예정
                        </Badge>
                      </div>
                    )}
                    <p className="text-xs">해당 날짜는 실제 출시 날짜와 차이날 수 있습니다.</p>
                  </div>
                </div>

                {/* 메인 액션/스토어 */}
                <div className="flex items-center gap-2 flex-wrap">
                  {game.platforms?.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {game.platforms.map((platform: string) => (
                        <div
                          className="flex items-center gap-2"
                          key={platform}>
                          <Image
                            src={findLogo(platform)}
                            alt={platform}
                            width={18}
                            height={18}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 통계 3종 카드 */}
            <div className="col-span-12 grid grid-cols-3 max-[580px]:grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard
                icon={<ThumbsUp className="w-5 h-5" />}
                title="Steam 리뷰"
                value={reviewHtml()}
                hint={totalReviews ? "스팀 리뷰 평가" : undefined}
              />
              <StatCard
                icon={<UserPlus className="w-5 h-5" />}
                title="Steam Followers"
                value={formatNumber(followers)}
                hint={followers ? "커뮤니티 팔로워" : undefined}
              />
              <StatCard
                icon={<Trophy className="w-5 h-5" />}
                title="Metacritic"
                value={metacritic === null ? "데이터 없음" : metacritic}
                valueClass={
                  metacritic !== null
                    ? metacritic >= 80
                      ? "text-green-600"
                      : metacritic >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                    : ""
                }
                hint={metacritic !== null ? "평단 점수" : undefined}
              />
            </div>
          </div>
        </motion.div>
        {/* 콘텐츠 영역 */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-10 max-[580px]:gap-x-4">
          {/* 왼쪽: 미디어 */}

          <div className="col-span-12 xl:col-span-7">
            <motion.div
              initial={{ opacity: 1, x: -200, scale: 1 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, type: "spring" }}>
              {mediaList.length > 0 && (
                <>
                  <AspectRatio
                    ratio={16 / 9}
                    className="bg-black/90 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-xl">
                    <AnimatePresence mode="wait">
                      {selectedMedia?.type === "video" ? (
                        <motion.div
                          key="video"
                          initial={{ opacity: 0, filter: "blur(8px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(8px)" }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="w-full h-full">
                          <iframe
                            src={getYouTubeEmbedUrl(selectedMedia.url)}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                            title={`${game.name} Trailer`}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key={`image-${selectedMediaIndex}`}
                          initial={{ opacity: 0, filter: "blur(8px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(8px)" }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="relative w-full h-full">
                          <Image
                            key={`main-${selectedMedia?.url}`}
                            fill
                            src={selectedMedia?.url || game.headerImage || ""}
                            alt={game.name}
                            className="object-cover"
                            sizes="(max-width: 1280px) 100vw, 60vw"
                            priority={true}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </AspectRatio>

                  {/* 썸네일: 데스크톱은 그리드, 모바일은 가로 스크롤 스냅 */}
                  <div className="mt-3">
                    <div className="hidden sm:grid grid-cols-6 gap-2">
                      {mediaList.map((media, index) => (
                        <button
                          key={index}
                          className={cn(
                            "rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02]",
                            selectedMediaIndex === index
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-transparent hover:border-white/10"
                          )}
                          onClick={() => setSelectedMediaIndex(index)}>
                          <AspectRatio ratio={16 / 9}>
                            {media.type === "video" ? (
                              <div className="w-full h-full bg-black/80 flex items-center justify-center">
                                <Play className="w-6 h-6" />
                              </div>
                            ) : (
                              <Image
                                key={`thumb-${media.url}`}
                                fill
                                src={media.url}
                                alt={`${game.name} media ${index + 1}`}
                                className="object-cover"
                                sizes="200px"
                                loading="eager"
                              />
                            )}
                          </AspectRatio>
                        </button>
                      ))}
                    </div>

                    {/* 모바일(≤580px 포함): 스냅 스크롤 */}
                    <div className="sm:hidden -mx-3 px-3">
                      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none]">
                        <style jsx>{`
                          div::-webkit-scrollbar {
                            display: none;
                          }
                        `}</style>
                        {mediaList.map((media, index) => (
                          <button
                            key={index}
                            className={cn(
                              "min-w-[46%] snap-start rounded-xl overflow-hidden border-2 transition-all",
                              selectedMediaIndex === index
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent"
                            )}
                            onClick={() => setSelectedMediaIndex(index)}>
                            <AspectRatio ratio={16 / 9}>
                              {media.type === "video" ? (
                                <div className="w-full h-full bg-black/80 flex items-center justify-center">
                                  <Play className="w-6 h-6 " />
                                </div>
                              ) : (
                                <Image
                                  fill
                                  src={media.url}
                                  alt={`${game.name} media ${index + 1}`}
                                  className="object-cover"
                                  sizes="50vw"
                                />
                              )}
                            </AspectRatio>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 설명 */}
              {game.description && (
                <section className="mt-6 rounded-2xl  p-5">
                  <h2 className="text-lg font-semibold mb-2">게임 소개</h2>
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(game.description) }}
                  />
                </section>
              )}
            </motion.div>
          </div>

          {/* 오른쪽: 정보 패널 */}
          <div className="col-span-12 xl:col-span-5">
            <motion.div
              initial={{ opacity: 1, x: 200, scale: 1 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="bg-card/40 rounded-2xl xl:sticky xl:top-6 ">
              <div>
                {/* 인기도 + 가격 */}

                <section className="rounded-2xl  p-5">
                  <p className="text-sm text-muted-foreground">출시 가격</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold">
                      {game?.currentPrice
                        ? `₩ ${formatNumber(game.currentPrice)}`
                        : "가격 정보 없음"}
                    </p>
                    <div className="flex gap-1 items-center">
                      {game.releases?.map((item) => (
                        <Button
                          key={item.store}
                          size="sm"
                          variant="secondary"
                          className="text-xs gap-2"
                          onClick={() => item.url && window.open(item.url, "_blank")}>
                          <Image
                            src={findLogo(item.store)}
                            alt={item.store}
                            width={14}
                            height={14}
                          />
                          {item.store.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 개발사/배급사 */}
                {(game.developers?.length || game.publishers?.length) && (
                  <section className="rounded-2xl  p-5">
                    <div className="grid sm:grid-cols-2 gap-6">
                      {game.developers?.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            개발사
                          </h3>
                          <div className="space-y-1">
                            {game.developers.map((dev: any) => (
                              <Badge
                                variant="secondary"
                                key={dev.id}
                                className="text-sm ">
                                {dev.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {game.publishers?.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            배급사
                          </h3>
                          <div className="space-y-1">
                            {game.publishers.map((pub: any) => (
                              <Badge
                                key={pub.id}
                                variant="secondary"
                                className="text-sm">
                                {pub.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* 장르/태그 */}
                {(game.genres?.length || game.tags?.length) && (
                  <section className="rounded-2xl  p-5">
                    <div className="grid gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">장르</h3>
                        {game.genres?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {game.genres.map((genre: string) => (
                              <Badge
                                variant="secondary"
                                key={genre}>
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">장르 정보 없음</p>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">태그</h3>
                        {game.tags?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {game.tags.slice(0, 12).map((tag: string) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {game.tags.length > 12 && (
                              <Badge
                                variant="secondary"
                                className="text-xs">
                                +{game.tags.length - 12}개 더
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">태그 정보 없음</p>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">지원 언어</h3>
                        {game.supportLanguages.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {game.supportLanguages.map((lang: string) => (
                              <Badge
                                key={lang}
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  lang == "한국어" && "bg-primary text-primary-foreground"
                                )}>
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">언어 정보 없음</p>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* DLC */}
                <section className="rounded-2xl  p-5">
                  <h2 className="text-xl font-bold mb-2">DLC 및 추가 콘텐츠</h2>
                  {game.dlcs?.length > 0 ? (
                    <>
                      {game.dlcs.map((dlc, index) => (
                        <div
                          key={dlc.name}
                          className="rounded-xl p-3  "
                          style={{ animationDelay: `${index * 40}ms` }}>
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">{dlc.name}</h3>
                            {dlc.releaseDate && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(dlc.releaseDate).toLocaleDateString("ko-KR")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className=" text-sm text-muted-foreground">DLC 및 추가 컨텐츠 정보 없음</p>
                  )}
                </section>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 작은 통계 카드 컴포넌트 */
function StatCard({
  icon,
  title,
  value,
  hint,
  valueClass,
}: {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  hint?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl  bg-card/40  px-4 py-3 shadow-md">
      <div className="flex  items-center gap-2 text-muted-foreground text-xs">
        <span className=" inline-flex p-1.5 rounded-md bg-white/10">{icon}</span>
        {title}
      </div>
      <div className={cn("mt-1.5 text-white text-2xl font-extrabold tracking-tight", valueClass)}>
        {value}
      </div>
      {!!hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
