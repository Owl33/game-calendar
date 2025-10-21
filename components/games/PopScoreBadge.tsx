import { cn } from "@/lib/utils";
import { Crown, Star, TrendingUp, Gamepad2, LucideIcon } from "lucide-react";

type Tier = "S" | "A" | "B" | "C";

function scoreToTier(score: number): { tier: Tier; color: string; Icon: LucideIcon; label: string } {
  if (score >= 80) return { tier: "S", color: "yellow", Icon: Crown, label: "인기작" };
  if (score >= 69) return { tier: "A", color: "blue", Icon: Star, label: "인지도 있음" };
  if (score >= 50) return { tier: "B", color: "violet", Icon: TrendingUp, label: "인지도 없음" };
  return { tier: "C", color: "slate", Icon: Gamepad2, label: "인지도 없음" };
}

export function PopScoreBadge({
  score,
  className,
  placement = "top-right",
}: {
  score: number;
  className?: string;
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const { color, Icon, label } = scoreToTier(score);

  const pos = {
    "top-right": "top-2 right-2",
    "top-left": "top-2 left-2",
    "bottom-right": "bottom-2 right-2",
    "bottom-left": "bottom-2 left-2",
  }[placement];

  return (
    <div
      className={cn(
        "absolute z-10",
        pos,
        // 입체감 & 글래스
        "rounded-full shadow-lg ring-1 ring-white/40 border border-white/30",
        "backdrop-blur-md bg-white/70 dark:bg-black/40",
        // 살짝 떠있는 느낌
        "transition-transform will-change-transform hover:-translate-y-0.5",
        className
      )}
      aria-label={`인기도 ${score}점 (${label})`}
      title={`${label} · ${score}점`}>
      {/* 부드러운 네온 글로우 */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-1 rounded-full blur-md opacity-40",
          {
            yellow: "bg-yellow-400/50",
            blue: "bg-blue-400/50",
            violet: "bg-violet-400/50",
            slate: "bg-slate-400/40",
          }[color]
        )}
      />
      {/* 본체 */}
      <div
        className={cn(
          "relative flex items-center gap-1.5 px-3 h-8 rounded-full",
          "text-xs font-semibold tracking-tight",
          // 색상 테마
          {
            yellow: "text-yellow-900 dark:text-yellow-200",
            blue: "text-blue-900 dark:text-blue-200",
            violet: "text-violet-900 dark:text-violet-200",
            slate: "text-slate-900 dark:text-slate-200",
          }[color]
        )}>
        {/* 작은 그라디언트 칩 */}
        <span
          aria-hidden
          className={cn(
            "inline-flex items-center justify-center h-5 w-5 rounded-full ring-1 ring-white/50 border border-white/40",
            {
              yellow: "bg-gradient-to-br from-yellow-400 to-yellow-300",
              blue: "bg-gradient-to-br from-blue-400 to-blue-300",
              violet: "bg-gradient-to-br from-violet-400 to-violet-300",
              slate: "bg-gradient-to-br from-slate-400 to-slate-300",
            }[color]
          )}>
          <Icon className="h-3 w-3 text-white drop-shadow" />
        </span>

        {/* 점수 텍스트 */}
        <span className="tabular-nums text-lg font-bold">{score}</span>
      </div>
    </div>
  );
}
