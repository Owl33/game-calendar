"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Filter, Minus, Plus, ChevronDown } from "lucide-react";

import { SectionHeader } from "./SectionHeader";
import { TokenSection } from "./TokenSection";
import type { FiltersState } from "@/types/game.types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  REVIEW_FILTER_ALL,
  buildReviewFilterOptions,
  sanitizeReviewFilters,
} from "@/utils/reviewScore";

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
const REVIEW_OPTIONS = buildReviewFilterOptions();

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
  const resetReview = () => onChange({ ...f, reviewScoreDesc: [REVIEW_FILTER_ALL] });

  const reviewState = useMemo(() => {
    const total = REVIEW_OPTIONS.length;
    const selectedAll = !f.reviewScoreDesc.length || f.reviewScoreDesc.includes(REVIEW_FILTER_ALL);
    const active = selectedAll
      ? REVIEW_OPTIONS.map((opt) => opt.value)
      : sanitizeReviewFilters(f.reviewScoreDesc);
    const unique = Array.from(new Set(active));
    const summary =
      selectedAll || unique.length === 0
        ? "전체"
        : unique.length === 1
        ? REVIEW_OPTIONS.find((opt) => opt.value === unique[0])?.label ?? "선택됨 1개"
        : `선택됨 ${unique.length}개`;
    const indeterminate = !selectedAll && unique.length > 0 && unique.length < total;
    return {
      selectedAll,
      activeValues: unique,
      summary,
      indeterminate,
      total,
    };
  }, [f.reviewScoreDesc]);

  const [reviewPopoverOpen, setReviewPopoverOpen] = useState(false);
  const [pendingReviewValues, setPendingReviewValues] = useState(() =>
    reviewState.selectedAll
      ? REVIEW_OPTIONS.map((opt) => opt.value)
      : reviewState.activeValues,
  );

  const skipPendingSyncRef = useRef(false);

  useEffect(() => {
    if (skipPendingSyncRef.current) {
      skipPendingSyncRef.current = false;
      return;
    }
    if (!reviewPopoverOpen) {
      setPendingReviewValues(
        reviewState.selectedAll
          ? REVIEW_OPTIONS.map((opt) => opt.value)
          : reviewState.activeValues,
      );
    }
  }, [reviewPopoverOpen, reviewState.selectedAll, reviewState.activeValues]);

  const pendingReviewState = useMemo(() => {
    const unique = sanitizeReviewFilters(pendingReviewValues);
    const total = REVIEW_OPTIONS.length;
    const allSelected = unique.length === total;
    const indeterminate = unique.length > 0 && unique.length < total;
    return { unique, allSelected, indeterminate, total };
  }, [pendingReviewValues]);

  const hasPendingChanges = useMemo(() => {
    const pending = pendingReviewState.unique;
    const applied = reviewState.selectedAll
      ? REVIEW_OPTIONS.map((opt) => opt.value)
      : reviewState.activeValues;
    if (applied.length !== pending.length) {
      return true;
    }
    return applied.some((value, idx) => value !== pending[idx]);
  }, [pendingReviewState.unique, reviewState.selectedAll, reviewState.activeValues]);

  const handleReviewPopoverOpenChange = (open: boolean) => {
    setReviewPopoverOpen(open);
    if (open) {
      setPendingReviewValues(
        reviewState.selectedAll
          ? REVIEW_OPTIONS.map((opt) => opt.value)
          : reviewState.activeValues,
      );
    }
  };

  const handlePendingReviewToggle = (
    value:
      | "Overwhelmingly Positive"
      | "Very Positive"
      | "Mostly Positive"
      | "Positive"
      | "Mixed"
      | "Negative"
      | "Mostly Negative"
      | "Very Negative"
      | "Overwhelmingly Negative"
      | "none",
  ) => {
    setPendingReviewValues((prev) => {
      const exists = prev.includes(value);
      const nextValues = exists ? prev.filter((v) => v !== value) : [...prev, value];
      return sanitizeReviewFilters(nextValues);
    });
  };

  const selectAllPendingReviews = () => {
    setPendingReviewValues(REVIEW_OPTIONS.map((opt) => opt.value));
  };

  const applyPendingReviews = () => {
    const sanitized = sanitizeReviewFilters(pendingReviewValues);
    const isAllSelected = sanitized.length === 0 || sanitized.length === pendingReviewState.total;
    if (hasPendingChanges) {
      const final = isAllSelected ? [REVIEW_FILTER_ALL] : sanitized;
      onChange({ ...f, reviewScoreDesc: final });
    }
    skipPendingSyncRef.current = true;
    setPendingReviewValues(
      isAllSelected ? REVIEW_OPTIONS.map((opt) => opt.value) : sanitized,
    );
    setReviewPopoverOpen(false);
  };

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

        {/* 퀵 버튼 */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              const now = new Date();
              const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
              onChange({
                ...f,
                startDate: oneYearAgo.toISOString().split("T")[0],
                endDate: now.toISOString().split("T")[0],
                onlyUpcoming: false,
              });
            }}>
            최근 1년
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              const now = new Date();
              const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
              onChange({
                ...f,
                startDate: fiveYearsAgo.toISOString().split("T")[0],
                endDate: now.toISOString().split("T")[0],
                onlyUpcoming: false,
              });
            }}>
            최근 5년
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              const now = new Date();
              const yearEnd = new Date(now.getFullYear(), 11, 31);
              onChange({
                ...f,
                startDate: now.toISOString().split("T")[0],
                endDate: yearEnd.toISOString().split("T")[0],
                onlyUpcoming: false,
              });
            }}>
            올해 예정
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              const now = new Date();
              const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);
              const nextYearEnd = new Date(now.getFullYear() + 1, 11, 31);
              onChange({
                ...f,
                startDate: nextYearStart.toISOString().split("T")[0],
                endDate: nextYearEnd.toISOString().split("T")[0],
                onlyUpcoming: false,
              });
            }}>
            내년 예정
          </Button>
        </div>

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

      {/* 스팀 리뷰 */}
      <section className="">
        <SectionHeader
          title="스팀 리뷰"
          onReset={resetReview}
          disabled={reviewState.selectedAll}
        />
        <Popover
          open={reviewPopoverOpen}
          onOpenChange={handleReviewPopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between text-sm mt-3">
              <span>{reviewState.summary}</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-0">
            <div className="p-3 space-y-3">
              <label className="p-2 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-muted/40 text-sm cursor-pointer">
                <Checkbox
                  checked={
                    pendingReviewState.allSelected
                      ? true
                      : pendingReviewState.indeterminate
                      ? "indeterminate"
                      : false
                  }
                  onCheckedChange={(checked) => {
                    if (checked === true) {
                      selectAllPendingReviews();
                    } else {
                      setPendingReviewValues([]);
                    }
                  }}
                />
                <span>전체</span>
              </label>
              <div className="max-h-56 space-y-1 overflow-auto pr-1">
                {REVIEW_OPTIONS.map((option) => {
                  const checked = pendingReviewState.unique.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/40 text-sm cursor-pointer">
                      <Checkbox
                        checked={pendingReviewState.allSelected ? true : checked}
                        onCheckedChange={() => handlePendingReviewToggle(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={applyPendingReviews}>
                {`${pendingReviewState.unique.length}개 적용`}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
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
      {/* <TokenSection
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
      /> */}

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
