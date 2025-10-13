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
  // 0) 로딩/빈
  if (isLoading) return <LoadingSkeleton />;
  if (games.length === 0) return <EmptyState />;

  // 2) 세로 모드: 가상화
  const itemsPerRow = useItemsPerRow();
  const rows = useMemo(() => {
    const r: (typeof games)[] = [];
    for (let i = 0; i < games.length; i += itemsPerRow) r.push(games.slice(i, i + itemsPerRow));
    return r;
  }, [games, itemsPerRow]);
  const minRowsByPage = pageSize ? Math.ceil(pageSize / Math.max(1, itemsPerRow)) : 0;

  // 복원 키
  const STORAGE_KEY = useMemo(() => {
    if (scrollKey && scrollKey.trim()) return `games:list:offset:${scrollKey}`;
    const base = typeof window !== "undefined" ? window.location.search : "";
    return `games:list:offset:/games${base}`;
  }, [scrollKey]);

  const reload = typeof window !== "undefined" ? isReloadNavigation() : false;

  // 저장된 오프셋
  const savedOffsetRef = useRef<number>(0);
  if (typeof window !== "undefined") {
    if (reload) {
      sessionStorage.removeItem(STORAGE_KEY);
      savedOffsetRef.current = 0;
    } else if (savedOffsetRef.current === 0) {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      savedOffsetRef.current = raw ? Number(raw) || 0 : 0;
    }
  }
  const maxKeepRows = Math.max(minRowsByPage, 6); // 최소 한 페이지 분량, 없으면 적어도 6행
  const rangeExtractor = (range: Range) => {
    // 기본 추출(연속 인덱스 배열)
    const base = defaultRangeExtractor(range);

    // 이미 충분히 작으면 그대로 반환
    if (base.length <= maxKeepRows) return base;

    // 뷰포트 중앙을 기준으로 windowing
    const center = Math.floor((range.startIndex + range.endIndex) / 2);
    const half = Math.floor(maxKeepRows / 2);

    let start = Math.max(range.startIndex, center - half);
    let end = Math.min(range.endIndex, start + maxKeepRows - 1);

    // 길이 보정(경계에 걸렸을 때)
    if (end - start + 1 < maxKeepRows) {
      start = Math.max(range.startIndex, end - maxKeepRows + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Virtualizer (※ 측정 사용 안 함 → 경고/드리프트 원천 제거)
  const virtualizer = useWindowVirtualizer({
    count: Math.max(rows.length, minRowsByPage),
    estimateSize: () => 350,
    overscan: 24,
    getItemKey: (index) => rows[index]?.[0]?.gameId ?? `row-${index}`, // 없는 행은 row-index 키
    initialOffset: savedOffsetRef.current,
    rangeExtractor,
  });

  // mount 시 복원 / 새로고침이면 꼭 0으로
  useEffect(() => {
    if (reload) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    if (savedOffsetRef.current > 0) {
      window.scrollTo({ top: savedOffsetRef.current, behavior: "auto" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 떠날 때 저장
  useEffect(() => {
    if (reload) return;
    const save = () => {
      sessionStorage.setItem(STORAGE_KEY, String(window.scrollY || 0));
    };
    window.addEventListener("pagehide", save);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") save();
    });
    return () => {
      save();
      window.removeEventListener("pagehide", save);
    };
  }, [STORAGE_KEY, reload]);

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
        const row = rows[vItem.index]; // 있을 수도, 없을 수도
        return (
          <div
            key={vItem.key}
            className={cn("grid gap-4", className)}
            style={{ marginBottom: 16 }}>
            {
              row
                ? row.map((game, colIndex) => {
                    const absoluteIndex = vItem.index * itemsPerRow + colIndex;
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
                : null /* 빈 행은 카드 렌더 X → 공간만 유지 */
            }
          </div>
        );
      })}

      {/* 하단 패딩 */}
      <div style={{ height: paddingBottom }} />
    </div>
  );
});
