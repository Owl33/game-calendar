import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/media";

function GameStatCard({
  icon,
  title,
  game,
  kind,
}: {
  icon: React.ReactNode;
  title: string;
  game: any;
  kind: "reviews" | "followers" | "metacritic";
}) {
  const valueNode = useMemo(() => {
    if (kind === "reviews") {
      const desc = game.reviewScoreDesc ?? null;
      const total = game.totalReviews ?? null;
      const colored =
        desc === "Overwhelmingly Positive" ||
        desc === "Very Positive" ||
        desc === "Mostly Positive" ||
        desc === "Positive"
          ? "text-blue-500"
          : desc === "Mixed"
          ? "text-amber-600"
          : desc
          ? "text-red-500"
          : "";

      const label =
        desc === "Overwhelmingly Positive"
          ? "압도적으로 긍정적"
          : desc === "Very Positive"
          ? "매우 긍정적"
          : desc === "Mostly Positive"
          ? "대체로 긍정적"
          : desc === "Positive"
          ? "긍정적"
          : desc === "Mixed"
          ? "복합적"
          : desc === "Negative"
          ? "부정적"
          : desc === "Mostly Negative"
          ? "대체로 부정적"
          : desc === "Very Negative"
          ? "매우 부정적"
          : desc === "Overwhelmingly Negative"
          ? "압도적으로 부정적"
          : "유저 리뷰 없음";
      return (
        <div className="flex items-baseline gap-2">
          <span className={cn("font-semibold text-2xl", colored)}>{label}</span>
          {total && <span className=" font-medium">({formatNumber(total)})</span>}
        </div>
      );
    }

    if (kind === "followers") {
      const followers = game.followersCache ?? null;
      return <span className="text-2xl font-extrabold">{formatNumber(followers)}</span>;
    }

    // metacritic
    const m = game.metacriticScore ?? null;
    const color =
      m === null ? "" : m >= 80 ? "text-green-600" : m >= 60 ? "text-yellow-600" : "text-red-600";
    return (
      <span className={cn("text-2xl font-extrabold", color)}>{m === null ? "데이터 없음" : m}</span>
    );
  }, [game, kind]);

  return (
    <div className="rounded-2xl bg-card/40 px-4 py-3 shadow-md">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span className="inline-flex p-1.5 rounded-md bg-white/10">{icon}</span>
        {title}
      </div>
      <div className="mt-1.5 text-white">{valueNode}</div>
    </div>
  );
}

export default memo(GameStatCard);
