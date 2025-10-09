import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import { InteractiveCard } from "@/components/motion/InteractiveCard";
import { isAAAgame, getDaysUntilRelease } from "@/utils/game";
import Steam from "@/public/icon/steam.png";
import Xbox from "@/public/icon/xbox.png";
import Nintendo from "@/public/icon/nintendo.png";

import Psn from "@/public/icon/psn.png";

import { PopScoreBadge } from "./PopScoreBadge";
type ViewMode = "card" | "list";

interface GameCardProps {
  game: {
    gameId: number;
    name: string;
    ogName?: string;
    releaseDate: Date | string;
    popularityScore: number;
    headerImage: string | null;
    genres: string[];
    platforms: string[];
    currentPrice: number | null;
    releaseDateRaw: string | null;
    comingSoon: boolean;
    releaseStatus: string | null;
  };
  className?: string;
  onClick?: () => void;
  priority?: boolean;
  viewMode?: ViewMode;
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
    body: "px-4 pb-4 flex-1 min-w-0 space-y-3",
    mediaWrap: "w-full overflow-hidden rounded-t-lg bg-black/95",
    mediaInner: "ratio",
    title: "text-2xl",
    metaText: "text-xs",
  },
  list: {
    outer: "flex items-center gap-3 p-3",
    body: "flex-1 min-w-0 flex flex-col justify-between gap-1",
    mediaWrap: "relative flex-shrink-0 overflow-hidden rounded-md bg-black/95",
    mediaInner: "fixed",
    title: "text-base",
    metaText: "text-xs",
    thumbSize: "w-32 h-26",
  },
};

function toYmd(d?: Date | string | null) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(+dt)) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function findLogo(store: string) {
  switch (store) {
    case "steam":
      return Steam;
    case "psn":
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

export function GameCard({
  game,
  className,
  onClick,
  priority = false,
  viewMode = "card",
}: GameCardProps) {
  const v = variants[viewMode];
  const daysUntilRelease = getDaysUntilRelease(game.releaseDate);
  const isUpcoming = daysUntilRelease > 0;
  const isToday = daysUntilRelease === 0;

  const getReleaseText = () => {
    const iso = toYmd(game.releaseDate ?? null);
    if (iso) return new Date(iso).toLocaleDateString("ko-KR");
    if (game.releaseDateRaw) return String(game.releaseDateRaw);
    return "TBA";
  };

  const priceText = game?.currentPrice
    ? `₩ ${new Intl.NumberFormat("ko-KR").format(game.currentPrice)}`
    : "가격 정보 없음";

  const CardInner = (
    <div className={cn(v.outer, "relative z-10")}>
      {/* 썸네일 */}
      <PopScoreBadge
        score={game.popularityScore}
        placement="top-left"
      />

      <div className={cn(v.mediaWrap, viewMode === "list" && v.thumbSize)}>
        {v.mediaInner === "ratio" ? (
          <AspectRatio ratio={16 / 9}>
            <img
              src={game.headerImage || ""}
              alt={game.name}
              className="object-cover h-full"
              loading={priority ? undefined : "lazy"}
            />
          </AspectRatio>
        ) : (
          <img
            src={game.headerImage || ""}
            alt={game.name}
            className="object-cover h-full"
            loading={priority ? undefined : "lazy"}
          />
        )}
      </div>

      {/* 본문 */}
      <div className={v.body}>
        {/* 타이틀 & 인기작 */}
        <div className="flex items-center gap-2 mb-4">
          <div>
            <h3 className={cn("font-bold text-foreground line-clamp-1", v.title)}>{game.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{game.ogName}</p>
          </div>
          {isAAAgame(game) && (
            <Badge
              className={cn(
                "px-2 py-1 text-white font-bold border-0 shadow-lg",
                viewMode === "card" ? "gradient-aaa-badge text-sm" : "gradient-aaa-badge text-xs"
              )}>
              인기작
            </Badge>
          )}
        </div>

        {/* 출시일/상태 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span
              className={cn(
                "font-medium text-foreground",
                v.metaText,
                isToday && "text-success font-bold",
                isUpcoming && "text-info"
              )}>
              {getReleaseText()}
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

        {/* 장르 */}
        {game.genres?.length > 0 && (
          <div className={cn("flex overflow-hidden gap-2", viewMode === "card" ? "mt-2" : "")}>
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

        {/* 가격/인기도/플랫폼 */}
        <div className={cn("flex items-center justify-between pt-2")}>
          <div className="flex items-center gap-2">
            <p className={cn(viewMode === "card" ? "text-lg font-bold" : "text-sm font-bold")}>
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
    <Link
      href={`/games/${game.gameId}`}
      prefetch
      className="block"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}>
      <InteractiveCard
        className={cn(
          "cursor-pointer group overflow-hidden relative rounded-xl bg-card elevated-card",
          className
        )}
        hoverScale={viewMode === "card" ? 1.03 : 1.01}
        hoverY={viewMode === "card" ? -4 : -2}
        hoverRotateX={viewMode === "card" ? 3 : 0}
        hoverRotateY={viewMode === "card" ? 5 : 0}
        preserve3d={viewMode === "card"}>
        {CardInner}
      </InteractiveCard>
    </Link>
  );
}
