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
    const TOP_SLACK = 1;      // 상단 여유 행 수 (원하는 만큼 조절 가능)
const BOTTOM_SLACK = 0;   // 필요하면 하단도 여유를 줄 수 있음

const rangeExtractor = (range: Range) => {
  const base = defaultRangeExtractor(range);

  // rows 길이가 필요하므로 클로저로 접근
  const rowCount = rows.length;

  // 기본 범위에 여유만 살짝 주는 빠른 경로
  // (현재 base가 충분히 작다면, 단순 버퍼만 적용해서 반환)
  if (base.length <= maxKeepRows) {
    const start = Math.max(range.startIndex - TOP_SLACK, 0);
    const end = Math.min(range.endIndex + BOTTOM_SLACK, rowCount - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // maxKeepRows로 트림하되, 시작 지점을 위로 조금 당겨서 상단 여유 확보
  const center = Math.floor((range.startIndex + range.endIndex) / 2);
  const half = Math.floor(maxKeepRows / 2);

  // 🔑 포인트: -TOP_SLACK 만큼 위로 당겨 시작
  let start = Math.max(range.startIndex - TOP_SLACK, center - half - TOP_SLACK);
  let end = start + maxKeepRows - 1;

  // 범위 보정 (가시 범위 및 전체 길이 안쪽으로)
  if (end > rowCount - 1) {
    end = rowCount - 1;
    start = Math.max(end - maxKeepRows + 1, 0);
  }
  if (start < Math.max(0, range.startIndex - TOP_SLACK)) {
    start = Math.max(0, range.startIndex - TOP_SLACK);
    end = Math.min(start + maxKeepRows - 1, rowCount - 1);
  }
  if (end < Math.min(rowCount - 1, range.endIndex + BOTTOM_SLACK)) {
    end = Math.min(rowCount - 1, range.endIndex + BOTTOM_SLACK);
    start = Math.max(end - maxKeepRows + 1, 0);
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
