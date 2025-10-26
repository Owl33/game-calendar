import type { FiltersState } from "@/types/game.types";
import { parseFiltersFromSearchParams, buildSearch } from "@/utils/searchParams";
import { REVIEW_FILTER_ALL, sanitizeReviewFilters } from "@/utils/reviewScore";

export type GamesSearchParams = Record<string, string | string[] | undefined>;

export const DEFAULT_GAMES_TITLE = "전체 게임";
export const DEFAULT_GAMES_DESCRIPTION =
  "릴리즈픽에서 플랫폼, 장르, 출시일 필터를 활용해 원하는 게임을 빠르게 찾아보세요.";
export const BASE_GAMES_KEYWORDS = [
  "전체 게임 목록",
  "게임 필터 검색",
  "신작 출시 게임",
  "플랫폼별 게임",
  "장르별 게임",
  "게임 출시 일정 검색",
  "AAA 게임",
];

export function canonicalizeFilters(f: FiltersState): FiltersState {
  const sort = (a?: string[]) => (Array.isArray(a) ? [...a].sort() : []);
  const review =
    !f.reviewScoreDesc.length || f.reviewScoreDesc.includes(REVIEW_FILTER_ALL)
      ? [REVIEW_FILTER_ALL]
      : (() => {
          const sanitized = sanitizeReviewFilters(f.reviewScoreDesc);
          return sanitized.length === 0 ? [REVIEW_FILTER_ALL] : sanitized;
        })();
  return {
    ...f,
    genres: sort(f.genres),
    tags: sort(f.tags),
    developers: sort(f.developers),
    publishers: sort(f.publishers),
    platforms: sort(f.platforms),
    reviewScoreDesc: review,
  };
}

export function stableSerialize(obj: unknown) {
  if (obj == null) return "null";
  const keys: string[] = [];
  JSON.stringify(obj, (k, v) => {
    keys.push(k);
    return v;
  });
  keys.sort();
  return JSON.stringify(obj, keys);
}

export function buildFilterSummary(filters: FiltersState) {
  const parts: string[] = [];
  if (filters.genres.length) parts.push(`${filters.genres.join(", ")} 장르`);
  if (filters.platforms.length) parts.push(`${filters.platforms.join(", ")} 플랫폼`);
  if (filters.startDate || filters.endDate) {
    const period =
      filters.startDate && filters.endDate
        ? `${filters.startDate} ~ ${filters.endDate}`
        : filters.startDate
          ? `${filters.startDate} 이후`
          : `${filters.endDate} 이전`;
    parts.push(`출시일 ${period}`);
  }
  if (filters.tags.length) parts.push(`태그 ${filters.tags.join(", ")}`);
  return parts;
}

export function resolveCanonicalParams(filters: FiltersState) {
  const params: Record<string, string> = {};
  if (filters.genres.length) params.genres = filters.genres.join(",");
  if (filters.tags.length) params.tags = filters.tags.join(",");
  if (filters.platforms.length) params.platforms = filters.platforms.join(",");
  if (filters.developers.length) params.developers = filters.developers.join(",");
  if (filters.publishers.length) params.publishers = filters.publishers.join(",");
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.sortBy !== "popularity") params.sortBy = filters.sortBy;
  if (filters.sortOrder !== "DESC") params.sortOrder = filters.sortOrder;
  if (filters.pageSize !== 9) params.pageSize = String(filters.pageSize);
  if (filters.reviewScoreDesc.length && !filters.reviewScoreDesc.includes(REVIEW_FILTER_ALL)) {
    params.reviewScoreDesc = filters.reviewScoreDesc.join(",");
  }
  if (filters.popularityScore !== 40) params.popularityScore = String(filters.popularityScore);
  return params;
}

export function resolveGamesMetadata(sp: GamesSearchParams) {
  const raw = parseFiltersFromSearchParams(sp);
  const filters = canonicalizeFilters(raw);
  const summaryParts = buildFilterSummary(filters);
  const hasFilters = summaryParts.length > 0;
  const filterLabel = summaryParts.join(" · ");
  const title = hasFilters ? `${filterLabel} 게임 검색` : DEFAULT_GAMES_TITLE;
  const description = hasFilters
    ? `${filterLabel} 조건에 맞는 게임을 릴리즈픽에서 찾아보세요.`
    : DEFAULT_GAMES_DESCRIPTION;
  const keywords = hasFilters ? [...BASE_GAMES_KEYWORDS, filterLabel] : BASE_GAMES_KEYWORDS;
  const canonicalParams = resolveCanonicalParams(filters);
  const canonicalSearch = buildSearch(canonicalParams).toString();
  const canonicalPath = canonicalSearch ? `/games?${canonicalSearch}` : "/games";
  return { filters, title, description, keywords, canonicalPath, hasFilters };
}
