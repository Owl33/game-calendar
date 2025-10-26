/**
 * QuickNavigationCards - 주요 기능 빠른 접근 카드
 */

"use client";

import Link from "next/link";
import { Calendar, Search, TrendingUp, Star, ArrowRight } from "lucide-react";
import { InteractiveCard } from "@/components/motion/InteractiveCard";
import { cn } from "@/lib/utils";

interface NavigationCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
}

const navigationCards: NavigationCard[] = [
  {
    title: "게임 캘린더",
    description: "월별 게임 출시 일정을 한눈에 확인하세요",
    icon: Calendar,
    href: "/calendar",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "전체 게임 검색",
    description: "원하는 게임을 빠르게 찾아보세요",
    icon: Search,
    href: "/games",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "출시 예정",
    description: "곧 출시될 기대작들을 미리 만나보세요",
    icon: TrendingUp,
    href: "/games?onlyUpcoming=true&sortBy=releaseDate&sortOrder=ASC",
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "인기 하이라이트",
    description: "지금 가장 인기있는 게임 큐레이션을 확인하세요",
    icon: Star,
    href: "/",
    gradient: "from-yellow-500 to-amber-500",
  },
];

export function QuickNavigationCards() {
  return (
    <section className="py-8">
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold gradient-header-title">빠른 접근</h2>
          <p className="text-muted-foreground">원하는 기능을 바로 이용해보세요</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {navigationCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.href}
                className="game-card"
                style={{ "--index": index } as React.CSSProperties}>
                <Link href={card.href} className="block h-full">
                  <InteractiveCard
                    className="h-full p-6 cursor-pointer group relative overflow-hidden"
                    hoverScale={1.05}
                    hoverY={-8}>
                    {/* Gradient Background */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                        card.gradient
                      )}
                    />

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg",
                          card.gradient
                        )}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                        바로가기
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </InteractiveCard>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
