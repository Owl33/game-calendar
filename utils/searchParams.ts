// app/games/utils/searchParams.ts
import type { FiltersState } from "@/types/game.types";
export type SearchParams = Record<string, string | string[] | undefined>;

export function getFirst(sp: SearchParams, key: string): string | null {
  const v = sp?.[key];
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

export function buildSearch(params: Record<string, string | number | boolean | null | undefined>) {
  const sp = new URLSearchParams();
  // ✅ 키 정렬로 안정화(뒤로가기/하이드레이션 흔들림 방지)
  Object.keys(params)
    .sort()
    .forEach((k) => {
      const v = params[k];
      if (v === null || v === undefined || v === "") return;
      sp.set(k, String(v));
    });
  return sp;
}

export function toYYYYMM(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}
export function isYYYYMM(s: string | null): s is string {
  return !!s && /^\d{4}-\d{2}$/.test(s);
}
export function isDD(s: string | null): s is string {
  return !!s && /^\d{1,2}$/.test(s);
}

/** CSV */
export function parseCsv(v: string | null): string[] {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
export function toCsv(arr?: string[] | null): string | undefined {
  if (!arr || arr.length === 0) return undefined;
  return arr.join(",");
}
export const allGamesKey = (filters: FiltersState, stableKey: string) =>
  ["allGames", stableKey] as const;
export type AllGamesKey = ReturnType<typeof allGamesKey>;

/* URL → FiltersState 파서 */
export function parseFiltersFromSearchParams(
  searchParams?: Record<string, string | string[] | undefined> | null
): FiltersState {
  const get = (k: string, def = "") => {
    const v = searchParams && typeof searchParams[k] !== "undefined" ? searchParams[k] : def;
    return Array.isArray(v) ? v[0] ?? def : (v as string);
  };
  const csv = (v: string | null) =>
    v
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const startDate = get("startDate", "");
  const endDate = get("endDate", "");
  const onlyUpcoming = get("onlyUpcoming", "") === "true";
  const genres = csv(get("genres", ""));
  const tags = csv(get("tags", ""));
  const developers = csv(get("developers", ""));
  const publishers = csv(get("publishers", ""));
  const platforms = csv(get("platforms", "")); // string[]
  const sortBy = (get("sortBy", "releaseDate") as FiltersState["sortBy"]) ?? "releaseDate";
  const sortOrder = (get("sortOrder", "DESC") as FiltersState["sortOrder"]) ?? "DESC";

  const pageSizeRaw = Number(get("pageSize", "24"));
  const pageSize = Math.min(50, Math.max(10, Number.isFinite(pageSizeRaw) ? pageSizeRaw : 24));
  const popRaw = Number(get("popularityScore", "40"));
  const popularityScore = Number.isFinite(popRaw) ? popRaw : 40;

  return {
    startDate,
    endDate,
    onlyUpcoming,
    genres,
    tags,
    developers,
    publishers,
    platforms,
    sortBy,
    sortOrder,
    pageSize,
    popularityScore,
  };
}
