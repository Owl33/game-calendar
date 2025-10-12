/**
 * StatsSection - 통계 정보 섹션
 */

"use client";

import { Gamepad2, TrendingUp, Calendar, Users } from "lucide-react";
import { InteractiveCard } from "@/components/motion/InteractiveCard";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  suffix?: string;
}

interface StatsSectionProps {
  stats?: {
    thisMonthGames?: number;
    upcomingGames?: number;
    totalGames?: number;
    popularGames?: number;
  };
}

export function StatsSection({ stats }: StatsSectionProps) {
  const statItems: StatItem[] = [
    {
      label: "이번 달 출시",
      value: stats?.thisMonthGames ?? 0,
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      suffix: "개",
    },
    {
      label: "출시 예정",
      value: stats?.upcomingGames ?? 0,
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-500",
      suffix: "개",
    },
    {
      label: "전체 게임",
      value: stats?.totalGames ?? 0,
      icon: Gamepad2,
      gradient: "from-purple-500 to-pink-500",
      suffix: "+",
    },
    {
      label: "인기 게임",
      value: stats?.popularGames ?? 0,
      icon: Users,
      gradient: "from-yellow-500 to-amber-500",
      suffix: "개",
    },
  ];

  return (
    <section className="py-8">
      <div className="animate-fadeIn">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="game-card"
                style={{ "--index": index } as React.CSSProperties}>
                <InteractiveCard
                  className="p-6 text-center relative overflow-hidden"
                  hoverScale={1.05}
                  hoverY={-4}>
                  {/* Background Gradient */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-5",
                      stat.gradient
                    )}
                  />

                  <div className="relative z-10 space-y-3">
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-12 h-12 mx-auto rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                        stat.gradient
                      )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Value */}
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-foreground">
                        {typeof stat.value === "number"
                          ? stat.value.toLocaleString("ko-KR")
                          : stat.value}
                        {stat.suffix && (
                          <span className="text-xl text-muted-foreground ml-1">{stat.suffix}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    </div>
                  </div>
                </InteractiveCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
