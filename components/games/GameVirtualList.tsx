/**
 * GameList - 게임 목록 (TanStack Virtual 가상 스크롤링)
 */

"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useWindowVirtualizer, defaultRangeExtractor, type Range } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { GameCard } from "./GameCard";

interface GameListProps {
  games: {
    gameId: number;
    name: string;
    releaseDate: Date | string;
    popularityScore: number;
    headerImage: string | null;
    genres: string[];
    platforms: string[];
    currentPrice: number | null;
    releaseDateRaw: string | null;
    comingSoon: boolean;
    gameType: string;
    isFree: boolean;
    releaseStatus: string | null;
  }[];
  isLoading: boolean;
  sorted?: boolean;
  className?: string;
  isHeader?: boolean;
  sortBy?: string;
  pageSize?: number;
  /** 뒤로가기 복원용 키(필터/경로 포함 추천). 미지정 시 '/games' 고정키 */
  scrollKey?: string;
}

// 새로고침 감지 (Navigation Timing L2)
function isReloadNavigation(): boolean {
  if (typeof performance === "undefined" || !("getEntriesByType" in performance)) return false;
  const nav = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return !!(nav && nav[0] && nav[0].type === "reload");
}

// 반응형 그리드 - 한 행 카드 수
function useItemsPerRow() {
  const [itemsPerRow, setItemsPerRow] = useState(3);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setItemsPerRow(1);
      else if (w < 1280) setItemsPerRow(2);
      else setItemsPerRow(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return itemsPerRow;
}

export const GameVirtualList = memo(function GameList({
  games,
  isLoading,
  className,
  pageSize,
  scrollKey,
}: GameListProps) {
  const itemsPerRow = useItemsPerRow();

  const rows = useMemo(() => {
    const r: (typeof games)[] = [];
    const n = Math.max(1, itemsPerRow);
    for (let i = 0; i < games.length; i += n) r.push(games.slice(i, i + n));
    return r;
  }, [games, itemsPerRow]);

  const minRowsByPage = useMemo(
    () => (pageSize ? Math.ceil(pageSize / Math.max(1, itemsPerRow)) : 0),
    [pageSize, itemsPerRow]
  );

  const STORAGE_KEY = useMemo(() => {
    if (scrollKey && scrollKey.trim()) return `games:list:offset:${scrollKey}`;
    const base = typeof window !== "undefined" ? window.location.search : "";
    return `games:list:offset:/games${base}`;
  }, [scrollKey]);

  // 새로고침 여부와 저장된 오프셋을 렌더 시 계산(SSR 안전 처리)
  const reloadRef = useRef(false);
  if (typeof window !== "undefined") {
    // 한 번만 평가
    if (!reloadRef.current) reloadRef.current = isReloadNavigation();
  }

  const savedOffsetRef = useRef<number>(0);
  if (typeof window !== "undefined" && savedOffsetRef.current === 0) {
    if (reloadRef.current) {
      // 새로고침이면 복원값 초기화
      sessionStorage.removeItem(STORAGE_KEY);
      savedOffsetRef.current = 0;
    } else {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      savedOffsetRef.current = raw ? Number(raw) || 0 : 0;
    }
  }

  const maxKeepRows = Math.max(minRowsByPage, 6); // 최소 한 페이지 분량, 없으면 적어도 6행

  const rangeExtractor = (range: Range) => {
    const base = defaultRangeExtractor(range);
    if (base.length <= maxKeepRows) return base;

    const center = Math.floor((range.startIndex + range.endIndex) / 2);
    const half = Math.floor(maxKeepRows / 2);

    let start = Math.max(range.startIndex, center - half);
    const end = Math.min(range.endIndex, start + maxKeepRows - 1); // ✅ end는 재할당 안 하므로 const

    if (end - start + 1 < maxKeepRows) {
      start = Math.max(range.startIndex, end - maxKeepRows + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Virtualizer (측정 사용 안 함)
  const virtualizer = useWindowVirtualizer({
    count: Math.max(rows.length, minRowsByPage),
    estimateSize: () => 352,
    overscan: 24,
    getItemKey: (index) => rows[index]?.[0]?.gameId ?? `row-${index}`,
    initialOffset: savedOffsetRef.current,
    rangeExtractor,
  });

  // mount 시 복원 / 새로고침이면 0으로
  useEffect(() => {
    if (reloadRef.current) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    if (savedOffsetRef.current > 0) {
      window.scrollTo({ top: savedOffsetRef.current, behavior: "auto" });
    }
  }, []);

  // 떠날 때 저장
  useEffect(() => {
    if (reloadRef.current) return;
    const save = () => {
      sessionStorage.setItem(STORAGE_KEY, String(window.scrollY || 0));
    };
    window.addEventListener("pagehide", save);
    const onVis = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("visibilitychange", onVis);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
      window.removeEventListener("visibilitychange", onVis);
    };
  }, [STORAGE_KEY]);

  if (isLoading) return <LoadingSkeleton />;
  if (games.length === 0) return <EmptyState />;

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems.length ? virtualItems[0].start : 0;
  const paddingBottom =
    totalSize - (virtualItems.length ? virtualItems[virtualItems.length - 1].end : 0);

  return (
    <div>
      {/* 상단 패딩 */}
      <div style={{ height: paddingTop }} />

      {/* 가상 행 */}
      {virtualItems.map((vItem) => {
        const row = rows[vItem.index];
        return (
          <div
            key={vItem.key}
            className={cn("grid gap-4", className)}
            style={{ marginBottom: 16 }}>
            {row
              ? row.map((game, colIndex) => {
                  const absoluteIndex = vItem.index * Math.max(1, itemsPerRow) + colIndex;
                  return (
                    <GameCard
                      key={game.gameId}
                      game={game}
                      priority={absoluteIndex < 6}
                      index={absoluteIndex}
                      disableAnimation
                    />
                  );
                })
              : null}
          </div>
        );
      })}

      {/* 하단 패딩 */}
      <div style={{ height: paddingBottom }} />
    </div>
  );
});
