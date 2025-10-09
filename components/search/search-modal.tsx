// 💡 (권장) app/layout.tsx <Head> 안에 아래 한 줄 추가하세요.
// <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=overlays-content" />

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Star, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transition } from "motion/react";

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
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
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

/* ====== Virtual Keyboard Hook ====== */
function useVirtualKeyboardHeight(enabled: boolean) {
  const [kb, setKb] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    // Android Chrome: 키보드가 레이아웃을 밀지 않고 콘텐츠 위로 겹치도록
    try {
      (navigator as any).virtualKeyboard &&
        ((navigator as any).virtualKeyboard.overlaysContent = true);
    } catch {}

    const vv = window.visualViewport;
    if (!vv) return;

    const onResize = () => {
      // overlap = 키보드가 겹쳐서 가린 높이(px)
      const overlap = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
      setKb(overlap);
      document.documentElement.style.setProperty("--kb", `${overlap}px`);
    };

    onResize();
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
      document.documentElement.style.removeProperty("--kb");
    };
  }, [enabled]);

  return kb;
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
                // NOTE: 비용 방지용 전역 unoptimized를 쓰는 경우, 여기선 그대로 둡니다.
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

/* ====== Component ====== */
export default function SearchModal({ open, onClose, initialQuery = "" }: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQ = useDebounce(query, 250);
  const enabled = open && debouncedQ.trim().length >= 2;
  const queryClient = useQueryClient();

  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 639px)");

  // ✅ 가상 키보드 높이 추적 (모바일 + 열림 상태에서만)
  const kb = useVirtualKeyboardHeight(open && isMobile);

  const handleClose = useCallback(() => {
    setQuery(""); // 입력 초기화
    setActiveIdx(-1); // 포커스 초기화
    queryClient.removeQueries({ queryKey: ["searchGames"], exact: false }); // 캐시 제거
    onClose();
  }, [onClose, queryClient]);

  // 오픈 시 포커스
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setActiveIdx(-1);
      setQuery(initialQuery);
    }
  }, [open, initialQuery]);

  // Escape로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // (선택 권장) 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const { style } = document.body;
    const prevOverflow = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prevOverflow;
    };
  }, [open]);

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
          const item =
            listRef.current?.querySelectorAll<HTMLButtonElement>("[data-item='true']")[next];
          item?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((prev) => {
          const next = prev - 1 < 0 ? results.length - 1 : prev - 1;
          const item =
            listRef.current?.querySelectorAll<HTMLButtonElement>("[data-item='true']")[next];
          item?.scrollIntoView({ block: "nearest" });
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

  // 입력 포커스 시 살짝 스크롤 보정 (iOS 가림 방지)
  useEffect(() => {
    if (!open || !isMobile) return;
    const t = setTimeout(() => {
      inputRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 50);
    return () => clearTimeout(t);
  }, [open, isMobile]);

  // 애니메이션 분기
  const modalInitial = isMobile
    ? { y: "100%", opacity: 1, scale: 1 }
    : { opacity: 0, scale: 0.9, y: 20 };
  const modalAnimate = isMobile ? { y: 0, opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: 0 };
  const MOBILE_TRANSITION: Transition = { type: "spring", stiffness: 280, damping: 28 };
  const DESKTOP_TRANSITION: Transition = { duration: 0.2 };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleClose}
      />

      {/* Container */}
      <motion.div
        className={cn(
          "fixed z-[101] overflow-hidden flex flex-col",
          isMobile
            ? "inset-x-0 bottom-0 rounded-t-2xl bg-card/95 backdrop-blur-xl shadow-2xl border-t border-border/60"
            : "top-1/2 left-1/2 w-full max-w-2xl mx-4 h-[620px] sm:h-[540px] rounded-2xl bg-card/90 backdrop-blur-xl shadow-2xl border border-border/60 -translate-x-1/2 -translate-y-1/2"
        )}
        style={
          isMobile
            ? {
                // 기본 80dvh를 기준으로, 키보드 겹침(var(--kb))만큼 줄이기 + 여유 8px
                height: "calc(min(80dvh, 100dvh) - var(--kb, 0px) - 8px)",
                maxHeight: "calc(100dvh - var(--kb, 0px) - 8px)",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px))",
              }
            : undefined
        }
        initial={modalInitial}
        animate={modalAnimate}
        transition={isMobile ? MOBILE_TRANSITION : DESKTOP_TRANSITION}
        role="dialog"
        aria-modal="true"
        drag={isMobile ? "y" : false}
        dragConstraints={isMobile ? { top: 0, bottom: 0 } : undefined}
        dragElastic={isMobile ? 0.25 : undefined}
        onDragEnd={(e, info) => {
          if (!isMobile) return;
          // 키보드가 있을수록 과민 방지: 임계치 동적 보정
          const threshold = Math.max(90, Math.min(160, 120 - kb * 0.1));
          if (info.offset.y > threshold || info.velocity.y > 800) handleClose();
        }}>
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between flex-shrink-0 border-border/60",
            isMobile ? "p-4 border-b" : "p-5 border-b"
          )}>
          {isMobile && (
            <div className="mx-auto absolute left-1/2 -translate-x-1/2 -top-2 w-12 h-1.5 rounded-full bg-muted/70" />
          )}
          <h2 className="text-lg font-semibold text-foreground">게임 검색</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={handleClose}
            aria-label="닫기">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Input */}
        <div className={cn("flex-shrink-0", isMobile ? "p-4 pb-2" : "p-5 pb-3")}>
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
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            최소 2자 입력 · ↑/↓ 선택 · Enter 이동 · Esc 닫기
          </p>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className={cn(
            "relative flex-1 py-4 min-h-0 overflow-y-auto space-y-3",
            isMobile ? "px-4 pb-4" : "px-5 pb-5"
          )}
          role="listbox"
          aria-label="검색 결과"
          style={
            isMobile
              ? {
                  // 키보드 높이만큼 스크롤 여유 + iOS 안전영역
                  scrollPaddingBottom:
                    "calc(var(--kb, 0px) + env(safe-area-inset-bottom, 0px) + 12px)",
                  WebkitOverflowScrolling: "touch",
                  overscrollBehavior: "contain",
                }
              : undefined
          }>
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
              className="mt-2 rounded-2xl  text-sm">
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
      </motion.div>
    </>
  );
}
