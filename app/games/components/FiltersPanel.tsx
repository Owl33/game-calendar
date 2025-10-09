"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Filter, Minus, Plus } from "lucide-react";

import { SectionHeader } from "./SectionHeader";
import { TokenSection } from "./TokenSection";
import type { FiltersState } from "@/types/game.types";

// 필요 시 문자열로 관리(플랫폼 라벨들)
const GENRE_OPTIONS = [
  "액션",
  "인디",
  "시뮬레이션",
  "캐주얼",
  "레이싱",
  "무료 플레이",
  "스포츠",
  "전략",
];
const TAG_OPTIONS = [
  "싱글 플레이어",
  "멀티 플레이어",
  "협동",
  "1인칭",
  "3인칭",
  "온라인 협동",
  "PvP",
  "MMO",
];
const PLATFORM_OPTIONS: string[] = ["pc", "playstation", "xbox", "nintendo"];

export function FiltersPanel({
  value,
  onChange,
  onResetAll,
}: {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  onResetAll: () => void;
}) {
  const f = value;
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

  const resetDates = () => onChange({ ...f, startDate: "", endDate: "", onlyUpcoming: false });
  const resetGenres = () => onChange({ ...f, genres: [] });
  const resetTags = () => onChange({ ...f, tags: [] });
  const resetDevelopers = () => onChange({ ...f, developers: [] });
  const resetPublishers = () => onChange({ ...f, publishers: [] });

  const [localPopularity, setLocalPopularity] = useState(f.popularityScore);
  useEffect(() => setLocalPopularity(f.popularityScore), [f.popularityScore]);

  const tokenCommon = { maxHeightClass: "overflow-auto" };

  return (
    <div className="space-y-6">
      {/* 상단 바 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h2 className="text-sm font-semibold">필터</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={onResetAll}>
          전체 초기화
        </Button>
      </div>

      {/* 인기도 */}
      <section className="space-y-2">
        <SectionHeader
          title="인기도"
          onReset={() => onChange({ ...f, popularityScore: 40 })}
          disabled={f.popularityScore === 40}
        />
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>최소값</span>
            <span className="font-medium text-foreground">{localPopularity}+</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="인기도 감소"
              onClick={() => {
                const next = clamp((f.popularityScore ?? 40) - 1, 40, 100);
                setLocalPopularity(next);
                onChange({ ...f, popularityScore: next });
              }}>
              <Minus />
            </Button>

            <Slider
              value={[localPopularity]}
              min={40}
              max={100}
              step={1}
              onValueChange={(vals) => setLocalPopularity(vals[0] ?? 40)}
              onValueCommit={(vals) =>
                onChange({ ...f, popularityScore: clamp(vals[0] ?? 40, 40, 100) })
              }
              className="w-full"
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="인기도 증가"
              onClick={() => {
                const next = clamp((f.popularityScore ?? 40) + 1, 40, 100);
                setLocalPopularity(next);
                onChange({ ...f, popularityScore: next });
              }}>
              <Plus />
            </Button>
          </div>

          <div className="px-11 mt-1 flex justify-between text-[11px] text-muted-foreground">
            {[40, 60, 80, 100].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 날짜 범위 */}
      <section className="space-y-2">
        <SectionHeader
          title="날짜 범위"
          onReset={resetDates}
          disabled={!f.startDate && !f.endDate && !f.onlyUpcoming}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={f.startDate}
            onChange={(e) => onChange({ ...f, startDate: e.target.value })}
          />
          <Input
            type="date"
            value={f.endDate}
            onChange={(e) => onChange({ ...f, endDate: e.target.value })}
          />
        </div>
        <div className="cursor-pointer flex items-center gap-2 pt-1.5">
          <Checkbox
            id="onlyUpcoming"
            checked={f.onlyUpcoming}
            onCheckedChange={(v) => onChange({ ...f, onlyUpcoming: v === true })}
          />
          <label
            htmlFor="onlyUpcoming"
            className="cursor-pointer text-sm">
            미출시만
          </label>
        </div>
      </section>

      {/* 장르 */}
      <section className="space-y-2">
        <SectionHeader
          title="장르"
          onReset={resetGenres}
          disabled={f.genres.length === 0}
        />
        <div className={cn("flex flex-wrap gap-2", tokenCommon.maxHeightClass)}>
          {GENRE_OPTIONS.map((g) => {
            const active = f.genres.includes(g);
            return (
              <Badge
                key={g}
                variant={active ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer select-none",
                  active ? "ring-1 ring-primary" : "opacity-90 hover:opacity-100"
                )}
                role="checkbox"
                aria-checked={active}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange({
                      ...f,
                      genres: active ? f.genres.filter((x) => x !== g) : [...f.genres, g],
                    });
                  }
                }}
                onClick={() =>
                  onChange({
                    ...f,
                    genres: active ? f.genres.filter((x) => x !== g) : [...f.genres, g],
                  })
                }>
                {g}
              </Badge>
            );
          })}
        </div>
      </section>

      {/* 태그 */}
      <section className="space-y-2">
        <SectionHeader
          title="태그"
          onReset={resetTags}
          disabled={f.tags.length === 0}
        />
        <div className={cn("flex flex-wrap gap-2", tokenCommon.maxHeightClass)}>
          {TAG_OPTIONS.map((t) => {
            const active = f.tags.includes(t);
            return (
              <Badge
                key={t}
                variant={active ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer select-none",
                  active ? "ring-1 ring-primary" : "opacity-90 hover:opacity-100"
                )}
                role="checkbox"
                aria-checked={active}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange({
                      ...f,
                      tags: active ? f.tags.filter((x) => x !== t) : [...f.tags, t],
                    });
                  }
                }}
                onClick={() =>
                  onChange({ ...f, tags: active ? f.tags.filter((x) => x !== t) : [...f.tags, t] })
                }>
                {t}
              </Badge>
            );
          })}
        </div>
      </section>

      {/* 개발사 */}
      <TokenSection
        title="개발사"
        tokens={f.developers}
        onChange={(tokens) => onChange({ ...f, developers: tokens })}
        placeholder="Ubisoft, EA ..."
        rightAction={
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={resetDevelopers}
            disabled={f.developers.length === 0}>
            초기화
          </Button>
        }
      />

      {/* 퍼블리셔 */}
      <TokenSection
        title="퍼블리셔"
        tokens={f.publishers}
        onChange={(tokens) => onChange({ ...f, publishers: tokens })}
        placeholder="Sony, Nintendo ..."
        rightAction={
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={resetPublishers}
            disabled={f.publishers.length === 0}>
            초기화
          </Button>
        }
      />

      {/* 플랫폼 */}
      <section className="space-y-2">
        <SectionHeader
          title="플랫폼"
          onReset={() => onChange({ ...f, platforms: [] })}
          disabled={f.platforms.length === 0}
        />
        <div className="flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((p) => {
            const active = f.platforms.includes(p);
            return (
              <Badge
                key={p}
                variant={active ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer select-none capitalize",
                  active ? "ring-1 ring-primary" : "opacity-90 hover:opacity-100"
                )}
                role="checkbox"
                aria-checked={active}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange({
                      ...f,
                      platforms: active ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
                    });
                  }
                }}
                onClick={() =>
                  onChange({
                    ...f,
                    platforms: active ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
                  })
                }>
                {p}
              </Badge>
            );
          })}
        </div>
      </section>
    </div>
  );
}
