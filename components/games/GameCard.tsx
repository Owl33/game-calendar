//components/games/GameCard.tsx
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import Link from "next/link";
import { cn, shimmer, toBase64 } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import { InteractiveCard } from "@/components/motion/InteractiveCard";
import { getDaysUntilRelease } from "@/utils/game";
import Steam from "@/public/icon/steam.png";
import Xbox from "@/public/icon/xbox.png";
import Nintendo from "@/public/icon/nintendo.png";
import Psn from "@/public/icon/psn.png";
import { PopScoreBadge } from "./PopScoreBadge";
import { memo, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// 이미지 로고 매핑 (컴포넌트 외부로 이동)
const platformLogos: Record<string, any> = {
  steam: Steam,
  psn: Psn,
  playstation: Psn,
  xbox: Xbox,
  nintendo: Nintendo,
};

function findLogo(store: string) {
  return platformLogos[store.toLowerCase()] || Steam;
}
type ViewMode = "card" | "list";
// | "list";

interface GameCardProps {
  game: {
    gameId: number;
    name: string;
    ogName?: string | null;
    releaseDate: Date | string;
    popularityScore: number;
    headerImage: string | null;
    genres: string[];
    platforms: string[];
    currentPrice: number | null;
    releaseDateRaw: string | null;
    comingSoon: boolean;
    isFree: boolean;
    releaseStatus: string | null;
  };
  className?: string;
  onClick?: () => void;
  priority?: boolean;
  viewMode?: ViewMode;
  index?: number;
  disableAnimation?: boolean;
  isLoading?: boolean;
}

const variants: Record<
  ViewMode,
  {
    outer: string;
    body: string;
    mediaWrap: string;
    mediaInner: "ratio" | "fixed";
    title: string;
    metaText: string;
    thumbSize?: string;
  }
> = {
  card: {
    outer: "flex flex-col gap-4",
    mediaWrap: "w-full overflow-hidden rounded-t-lg bg-black/95",
    body: "px-4 pb-4 flex-1 min-w-0 space-y-3",
    mediaInner: "ratio",
    title: "text-2xl",
    metaText: "text-xs",
  },
  list: {
    outer: "grid grid-cols-12 gap-6",
    mediaWrap: "relative col-span-5 overflow-hidden rounded-lg  ",
    body: "col-span-7 space-y-2",
    mediaInner: "fixed",
    title: "text-base sm:text-lg",
    metaText: "text-xs ",
    thumbSize: undefined,
  },
};

// 날짜 포맷팅 함수 (컴포넌트 외부로 이동)
function toYmd(d?: Date | string | null) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(+dt)) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const GameCard = memo(function GameCard({
  game,
  onClick,
  priority = false,
  viewMode = "card",
  index = 0,
  disableAnimation = false,
  isLoading = false,
}: GameCardProps) {
  const v = variants[viewMode];
  const isListView = viewMode === "list";

  // 계산 결과 - 단순 계산은 useMemo 제거
  const daysUntilRelease = getDaysUntilRelease(game.releaseDate);
  const isUpcoming = daysUntilRelease > 0;
  const isToday = daysUntilRelease === 0;
  const isPopular = game.popularityScore > 70;

  // 복잡한 계산만 useMemo 유지
  const releaseText = useMemo(() => {
    const iso = toYmd(game.releaseDate ?? null);
    if (iso) return new Date(iso).toLocaleDateString("ko-KR");
    if (game.releaseDateRaw) return String(game.releaseDateRaw);
    return "TBA";
  }, [game.releaseDate, game.releaseDateRaw]);

  const priceText =
    game.isFree === true
      ? "무료"
      : game?.currentPrice
      ? `₩ ${new Intl.NumberFormat("ko-KR").format(game.currentPrice)}`
      : "가격 정보 없음";

  if (isLoading) {
    if (isListView) {
      return (
        <div className="rounded-xl bg-card border border-border/40 relative z-10 p-3 sm:p-4">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-[minmax(7.5rem,8.75rem)_1fr]">
            <div className="relative overflow-hidden rounded-lg bg-black/80">
              <AspectRatio ratio={2.14 / 1}>
                <Skeleton className="h-full w-full rounded-none" />
              </AspectRatio>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-2/3 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-2 md:col-span-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
              <Skeleton className="h-6 w-24 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("rounded-xl bg-card border border-border/30 relative z-10", v.outer)}>
        <div className={cn(v.mediaWrap)}>
          {v.mediaInner === "ratio" ? (
            <AspectRatio ratio={2.14 / 1}>
              <Skeleton className="h-full w-full rounded-none" />
            </AspectRatio>
          ) : (
            <Skeleton className="h-full w-full" />
          )}
        </div>
        <div className={cn(v.body)}>
          <div className="space-y-2">
            <Skeleton className="h-6 w-2/3 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const imageSizes = isListView
    ? "(max-width: 640px) 100vw, 240px"
    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  const imageElement = (
    <Image
      fill
      src={game.headerImage || ""}
      alt={game.name}
      priority={priority}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(460, 215))}`}
      className={cn(
        "object-cover will-change-transform",
        isListView && "transition-transform duration-200 group-hover:scale-[1.02]"
      )}
      sizes={imageSizes}
      loading={priority ? undefined : "lazy"}
    />
  );

  const CardInner = (
    <div className={cn("rounded-xl bg-card relative z-10", v.outer)}>
      <PopScoreBadge
        score={game.popularityScore}
        placement="top-left"
      />
      {/* viewMode === "list" && v.thumbSize */}
      <div className={cn(v.mediaWrap)}>
        {v.mediaInner === "ratio" ? (
          <AspectRatio ratio={2.14 / 1}>{imageElement}</AspectRatio>
        ) : (
          imageElement
        )}
      </div>

      {/* 본문 */}
      <div className={cn(v.body)}>
        {/* 타이틀 & 인기작 */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className={cn("font-bold text-foreground truncate", v.title)}>{game.name}</h3>
            {isPopular && (
              <Badge
                className={cn(
                  "px-2 py-0  ml-1 text-white font-bold border-0 shadow-lg",
                  viewMode === "card" ? "gradient-aaa-badge text-sm" : "gradient-aaa-badge text-xs"
                )}>
                인기작
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground ">
            {game.ogName && !!game.ogName ? game.ogName : game.name}
          </p>
        </div>

        {/* 출시일/상태 */}
        <div
          className={cn(
            "flex items-center gap-2",
            viewMode === "list" && "flex-wrap gap-y-1 text-xs sm:text-sm"
          )}>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span
              className={cn(
                "font-medium text-foreground",
                v.metaText,
                isToday && "text-success font-bold",
                isUpcoming && "text-info"
              )}>
              {releaseText}
            </span>
          </div>
          {isToday && (
            <Badge className="px-1.5 py-0.5 gradient-today-badge text-white text-xs shadow-lg">
              오늘 출시!
            </Badge>
          )}
          {isUpcoming && daysUntilRelease <= 7 && (
            <Badge className="px-1.5 py-0.5 gradient-upcoming-badge text-white text-xs shadow-lg flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {daysUntilRelease}일 후
            </Badge>
          )}
          {game.releaseStatus === "early_access" && <Badge variant="outline">얼리억세스</Badge>}
        </div>
        {viewMode == "card" && (
          <>
            {/* 장르 */}
            {game.genres?.length > 0 && (
              <div
                className={cn(
                  "flex gap-2",
                  viewMode === "card" ? "mt-2 overflow-hidden" : "flex-wrap text-xs sm:text-sm"
                )}>
                {game.genres.slice(0, viewMode === "card" ? 3 : 4).map((g: string) => (
                  <Badge
                    key={g}
                    variant="secondary"
                    className="text-xs px-2 py-0.5 font-semibold border">
                    {g}
                  </Badge>
                ))}
                {game.genres.length > (viewMode === "card" ? 3 : 4) && (
                  <Badge className="text-xs px-2 py-0.5 bg-muted text-muted-foreground border-0">
                    +{game.genres.length - (viewMode === "card" ? 3 : 4)}
                  </Badge>
                )}
              </div>
            )}
            {game.genres?.length === 0 && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 font-semibold border">
                장르 정보 없음
              </Badge>
            )}

         
          </>
        )}
           {/* 가격/플랫폼 */}
            <div className={cn("flex items-center justify-between")}>
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    viewMode === "card" ? "text-md font-bold" : "text-sm font-default  "
                  )}>
                  {priceText}
                </p>
              </div>
              {game.platforms?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((p: string) => (
                    <Image
                      key={p}
                      src={findLogo(p)}
                      alt={p}
                      width={viewMode === "card" ? 18 : 14}
                      height={viewMode === "card" ? 18 : 14}
                    />
                  ))}
                </div>
              )}
            </div>
      </div>
    </div>
  );

  return (
    <InteractiveCard
      className={disableAnimation ? "" : "game-card"}
      style={disableAnimation ? undefined : ({ "--index": index } as React.CSSProperties)}
      hoverScale={viewMode === "card" ? 1.03 : 1.01}
      hoverY={viewMode === "card" ? -4 : -2}
      hoverRotateX={viewMode === "card" ? 3 : 0}
      hoverRotateY={viewMode === "card" ? 5 : 0}
      preserve3d={viewMode === "card"}>
      <Link
        href={`/games/${game.gameId}`}
        prefetch
        className={cn("cursor-pointer group overflow-hidden relative")}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}>
        {CardInner}
      </Link>
    </InteractiveCard>
  );
});
