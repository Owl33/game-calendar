//components/search-modal.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, type Transition } from "motion/react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModalOverlay } from "@/components/modal/modal-overlay";

/* ====== Types ====== */
export type SearchItem = {
  gameId: number;
  name: string;
  slug: string;
  headerImage: string | null;
  releaseDate: string | null;
  popularityScore: number;
  followersCache?: number | null;
};

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/* ====== Utils ====== */
function useDebounce<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return v;
}

function formatDateISO(d?: string | null) {
  if (!d) return "출시일 정보 없음";
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "출시일 정보 없음";
  }
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);
  return (
    <>
      {before}
      <mark className="rounded bg-yellow-200/60 px-0.5">{match}</mark>
      {after}
    </>
  );
}

/* ====== Result Item ====== */
function ResultItem({
  item,
  active,
  query,
  onClick,
  onMouseEnter,
}: {
  item: SearchItem;
  active: boolean;
  query: string;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  const dateStr = formatDateISO(item.releaseDate);
  return (
    <motion.button
      data-item="true"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "w-full text-left p-3 sm:p-3.5 transition-all focus:outline-none rounded-xl relative",
        "bg-gradient-to-br from-background/60 to-background/40 border shadow-sm",
        active
          ? "border-primary/40 ring-2 ring-primary/30"
          : "border-border/50 hover:border-border/70"
      )}>
      <div className="flex gap-3 sm:gap-4">
        <div
          className={cn(
            "shrink-0 rounded-lg overflow-hidden border",
            active ? "border-primary/40" : "border-border/50"
          )}>
          {item.headerImage ? (
            <div className="relative h-24 w-28 sm:h-20 sm:w-32">
              <Image
                src={item.headerImage}
                alt={item.name}
                fill
                className="object-cover"
                sizes="128px"
                unoptimized
              />
            </div>
          ) : (
            <div className="h-24 w-28 sm:h-20 sm:w-32 bg-muted" />
          )}
        </div>
        <div className="min-w-0 w-full flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold leading-tight truncate">{highlight(item.name, query)}</h3>
            <div className="ml-auto shrink-0">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                  item.popularityScore >= 70
                    ? "bg-emerald-500/15 text-emerald-600"
                    : item.popularityScore >= 55
                    ? "bg-blue-500/15 text-blue-600"
                    : "bg-slate-500/15 text-slate-600"
                )}
                title="인기도 점수">
                <Star className="h-3.5 w-3.5" />
                {item.popularityScore}
              </span>
            </div>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">{dateStr}</span>
            {typeof item.followersCache === "number" && item.followersCache > 0 && (
              <Badge
                variant="secondary"
                className="rounded-full">
                팔로워 {Intl.NumberFormat().format(item.followersCache)}
              </Badge>
            )}
          </div>
        </div>
      </div>
      {active && (
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/20" />
      )}
    </motion.button>
  );
}

function ResultSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 p-3 sm:p-3.5 bg-gradient-to-br from-background/60 to-background/40">
      <div className="flex gap-3 sm:gap-4">
        <div className="h-16 w-28 sm:h-20 sm:w-32 bg-muted rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-muted rounded" />
          <div className="h-3 w-1/3 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

/* ====== Component (심플 · 모바일 100%) ====== */
export default function SearchModal({ open, onClose, initialQuery = "" }: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQ = useDebounce(query, 250);
  const enabled = open && debouncedQ.trim().length >= 2;
  const queryClient = useQueryClient();

  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery("");
    setActiveIdx(-1);
    queryClient.removeQueries({ queryKey: ["searchGames"], exact: false });
    onClose();
  }, [onClose, queryClient]);

  // 오픈 시 포커스
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus({ preventScroll: true });
      });
    } else {
      setActiveIdx(-1);
      setQuery(initialQuery);
    }
  }, [open, initialQuery]);

  // ESC & 배경 터치 스크롤 방지
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const stopTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      const scroller = target?.closest?.("[data-modal-scroller='true']") as HTMLElement | null;
      if (!scroller) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("touchmove", stopTouchMove, { passive: false });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("touchmove", stopTouchMove as any);
    };
  }, [open, onClose]);

  // React Query v5
  const { data: results = [], isFetching } = useQuery<SearchItem[]>({
    queryKey: ["searchGames", debouncedQ],
    enabled,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async ({ signal }) => {
      const res = await fetch(
        `${API_BASE_URL}/api/games/search?q=${encodeURIComponent(debouncedQ)}`,
        { signal }
      );
      if (!res.ok) throw new Error("search failed");
      const json = await res.json();
      return Array.isArray(json?.data?.data) ? (json.data.data as SearchItem[]) : [];
    },
  });

  // 키보드 내비
  const onKeyDownInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!results.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((prev) => {
          const next = prev + 1 >= results.length ? 0 : prev + 1;
          const nodeList =
            listRef.current?.querySelectorAll<HTMLButtonElement>("[data-item='true']");
          const item = nodeList ? nodeList[next] : undefined;
          if (item) item.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((prev) => {
          const next = prev - 1 < 0 ? results.length - 1 : prev - 1;
          const nodeList =
            listRef.current?.querySelectorAll<HTMLButtonElement>("[data-item='true']");
          const item = nodeList ? nodeList[next] : undefined;
          if (item) item.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "Enter") {
        if (activeIdx >= 0 && activeIdx < results.length) {
          const picked = results[activeIdx];
          window.location.href = `/games/${picked.gameId}`;
        }
      }
    },
    [results, activeIdx]
  );

  // if (!open) return null;

  // 단일 애니메이션(모바일/데스크톱 공통, 심플)
  const MODAL_INITIAL = { opacity: 0, y: 16 };
  const MODAL_ANIMATE = { opacity: 1, y: 0 };
  const MODAL_TRANSITION: Transition = { duration: 0.2 };

  return (
    <ModalOverlay
      open={open}
      title="게임 검색"
      onClose={handleClose}
      variant="centered"
      size="2xl"
      desktopHeight="540px" // 데스크톱에서만 높이 제한
      // 애니메이션 기본값 그대로 사용(필요시 initial/animate/exit/transition 덮어쓰기 가능)
    >
      {/* Input */}
      <div
        className="flex-shrink-0 p-4 sm:p-5"
       >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="게임명을 입력하세요..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(-1);
            }}
            onKeyDown={onKeyDownInput}
            className="pl-10 h-12 rounded-xl"
            autoFocus
            inputMode="search"
            autoComplete="off"
            enterKeyHint="search"
            spellCheck={false}
            style={{ fontSize: "16px" }} // iOS 줌 방지
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground hidden sm:block">
          최소 2자 입력 · ↑/↓ 선택 · Enter 이동 · Esc 닫기
        </p>
      </div>

      {/* Results */}
      <div
        ref={listRef}
        data-modal-scroller="true"
        className={cn(
          "relative flex-1 min-h-0 overflow-y-auto space-y-3 px-4 pb-4 sm:px-5 sm:pb-5 pt-4"
        )}
        role="listbox"
        aria-label="검색 결과"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}>
        {/* 상단 로딩바 */}
        {enabled && isFetching && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
            className="absolute left-0 top-0 right-0 h-0.5 origin-left bg-gradient-to-r from-primary/70 via-primary to-primary/70"
          />
        )}

        {/* 0) 처음 화면 (미입력) */}
        {query.trim().length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-2xl text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Search className="h-4 w-4 opacity-80" />
              <span className="font-medium">빠른 검색 팁</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/50 bg-card/70 p-4">
                <div className="text-xs text-muted-foreground">예시 검색어</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Monster Hunter", "Elden Ring", "Stardew", "Baldur"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setQuery(s);
                        setActiveIdx(-1);
                      }}
                      className="text-xs rounded-full border border-border/60 px-2.5 py-1 hover:bg-accent transition">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/70 p-4">
                <div className="text-xs text-muted-foreground">단축키</div>
                <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground/90">
                  <li>↑ / ↓ : 결과 이동</li>
                  <li>Enter : 상세 이동</li>
                  <li>Esc : 닫기</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              * 최소 2자를 입력하면 실시간으로 검색합니다.
            </div>
          </motion.div>
        )}

        {/* 1) 2자 미만 */}
        {query.trim().length > 0 && query.trim().length < 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-2xl border border-dashed border-border/60 bg-yellow-500/5 p-5">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">2자 이상 입력해 주세요</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              예: <span className="font-medium text-foreground/90">“el”</span> →{" "}
              <span className="text-foreground/80">Elden Ring</span>,{" "}
              <span className="text-foreground/80">Elderand</span> …
            </p>
          </motion.div>
        )}

        {/* 2) 로딩 중 */}
        {enabled && isFetching && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              검색 중…
            </div>
            <div className="grid gap-3 mt-2">
              <ResultSkeleton />
              <ResultSkeleton />
              <ResultSkeleton />
            </div>
          </>
        )}

        {/* 3) 결과 없음 */}
        {enabled && !isFetching && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-2xl border border-dashed border-border/60 p-8 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-sm font-medium text-foreground">검색 결과가 없어요</div>
            <p className="mt-1 text-xs text-muted-foreground">
              철자를 바꾸거나 더 일반적인 키워드를 사용해 보세요.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {["remake", "dlc", "survivor", "online"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    setActiveIdx(-1);
                  }}
                  className="text-xs rounded-full border border-border/60 px-2.5 py-1 hover:bg-accent transition">
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 4) 실제 결과 목록 */}
        {enabled &&
          !isFetching &&
          results.map((g, i) => (
            <ResultItem
              key={g.gameId}
              item={g}
              active={i === activeIdx}
              query={query}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => (window.location.href = `/games/${g.gameId}`)}
            />
          ))}
      </div>
    </ModalOverlay>
  );
}
