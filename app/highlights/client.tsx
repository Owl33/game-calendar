"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameList } from "@/components/games/GameList";
import { gameKeys, fetchHighlight } from "@/lib/queries/game";
import { HighlightsResponse } from "@/types/game.types";
import React from "react";

/** ===== Types (단일 파일 복붙용) ===== */

/** ===== Micro UI ===== */
function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-3xl font-bold">{title}</h2>
      </div>
      {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
    </div>
  );
}

/** ===== Page ===== */
export default function HighlightsPage() {
  const { data, isLoading, error } = useQuery<HighlightsResponse>({
    queryKey: gameKeys.highlights(),
    queryFn: ({ signal }) => fetchHighlight(signal),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  // const featured = data?.featured;
  const popular = data?.popular ?? [];
  const upcoming = data?.upcoming ?? [];
  
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
          <p className="font-semibold">하이라이트를 불러오지 못했어요.</p>
          <p className="text-sm opacity-80 mt-1">{String(error)}</p>
        </div>
      </div>
    );
  }
const onPasteMail = () =>{
  const mail ='owl33@releasepicks.com'
      window.navigator.clipboard.writeText(mail).then(() => {
        alert(`${mail} 주소를 복사했습니다.`);
      });
}
  return (
    <div className="container mx-auto min-h-screen">
      <section className="relative">
        <div className="max-w-3xl mb-8">
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              asChild
              size="sm">
              <Link href="/calendar">
                캘린더
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="secondary">
              <Link href="/games">
                전체 게임
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
        <FeaturedSpotlightCard></FeaturedSpotlightCard>
      </section>
      <section className="my-8">
        <SectionTitle
          title="인기게임"
          subtitle="±4년 범위의 인기도가 높은 게임 16종을 랜덤으로 보여줍니다."
        />

        <GameList
          mode="horizontal"
          games={popular}
          isLoading={isLoading}></GameList>
      </section>

      {/* ===== UPCOMING (곧 출시될 게임) ===== */}
      <section className="mt-8">
        <SectionTitle
          title="곧 출시 게임"
          subtitle="60일 이내에 출시될 게임 16종을 랜덤하게 보여줍니다."
        />
        <GameList
          mode="horizontal"
          games={upcoming}
          isLoading={isLoading}></GameList>
      </section>
      <footer className="mt-4 pt-4   flex flex-col items-center">
<div className=" flex  gap-4"> 
        <Button
              asChild
              size="sm"
              variant="secondary">
              <Link href="https://store.steampowered.com/">
                Steam
              </Link>
            </Button>
                  <Button
              asChild
              size="sm"
              variant="secondary">
              <Link href="https://rawg.io/" target="_blank">
                RAWG
              </Link>
            </Button>
                  <Button
              
              size="sm"
              variant="secondary"
              onClick={onPasteMail}
              >
                문의 및 건의 사항
                <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

</div>
<div className="">

</div>
      </footer>
    </div>
  );
}
export function FeaturedSpotlightCard() {
  const title = "Nioh 3";
  const subtitle = "Team NINJA · Koei Tecmo";
  const release = "2026-02-05";
  const genres = ["액션", "RPG"];
  const platforms = ["PC", "PS5"];
  const bg =
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3681010/17b22f17d8dd95d9c1cd251d95f3652c995d1ba1/page_bg_raw.jpg?t=1759458269";

  return (
    <div
      className="
          relative group overflow-hidden rounded-2xl
          aspect-[4/5] sm:aspect-[16/9] lg:aspect-[12/5]
        ">
      <Image
        fill
        src={bg}
        alt={`${title} 배경`}
        priority={true}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNhYWFhYWE7c3RvcC1vcGFjaXR5OjAuMiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzcwNzA3MDtzdG9wLW9wYWNpdHk6MC4yIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMjUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4="
        sizes="100vw"
        className="object-cover"
      />

   
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-2xl bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute inset-0 p-4 sm:p-6 md:p-8 grid">
        <div className="self-end max-w-[94%] md:max-w-[72%]">
          <div className="mb-2.5 sm:mb-3 flex flex-wrap items-center gap-2">
            {genres.map((g) => (
              <span
                key={g}
                className="
                    rounded-full border border-white/15 bg-white/10
                    px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/90
                    backdrop-blur-[1.5px]
                  ">
                {g}
              </span>
            ))}
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/15 px-2.5 py-1 text-[11px] font-medium tracking-wide text-emerald-100 backdrop-blur-[1.5px]">
              {platforms.join(" · ")}
            </span>
          </div>

          <h2 className="font-display text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            {title}
          </h2>

          <p className="mt-1 text-white/85 text-sm md:text-base drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
            {subtitle}
          </p>

          <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-2 md:gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white/90 backdrop-blur-[1.5px] ring-1 ring-white/20">
              <CalendarDays className="size-4" />
              <span className="tabular-nums text-xs md:text-sm">{release}</span>
            </div>

            <Link
              href="/games/170113"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white/90 backdrop-blur-[1.5px] ring-1 ring-white/20 transition hover:bg-white/15">
              <ExternalLink className="size-4" />
              <span className="text-xs md:text-sm font-medium">자세히 보기</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 외곽선 글로우 (살짝만) */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-white/20 transition" />
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition duration-500 [background:radial-gradient(60%_60%_at_50%_50%,rgba(255,255,255,0.14),transparent_60%)]" />
    </div>
  );
}
