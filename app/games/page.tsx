// app/games/page.tsx

import type { Metadata } from "next";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import GamesClient from "./client";
import { parseFiltersFromSearchParams, allGamesKey, buildSearch } from "@/utils/searchParams";
import type { FiltersState } from "@/types/game.types";
import { fetchAllGamesPage } from "@/lib/queries/game";
import { cookies } from "next/headers"; // ✅ 추가
import { absoluteUrl } from "@/lib/seo";
import { REVIEW_FILTER_ALL, sanitizeReviewFilters } from "@/utils/reviewScore";

export const revalidate = 0;

const DEFAULT_TITLE = "전체 게임";
const DEFAULT_DESCRIPTION = "릴리즈픽에서 플랫폼, 장르, 출시일 필터를 활용해 원하는 게임을 빠르게 찾아보세요.";
const BASE_KEYWORDS = [
  "전체 게임 목록",
  "게임 필터 검색",
  "신작 출시 게임",
  "플랫폼별 게임",
  "장르별 게임",
  "게임 출시 일정 검색",
  "AAA 게임"
];

type GamesSearchParams = Record<string, string | string[] | undefined>;

// (동일) canonicalize / stableSerialize 유지
function canonicalize(f: FiltersState): FiltersState {
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
function stableSerialize(obj: unknown) {
  if (obj == null) return "null";
  const keys: string[] = [];
  JSON.stringify(obj, (k, v) => (keys.push(k), v));
  keys.sort();
  return JSON.stringify(obj, keys);
}

function buildFilterSummary(filters: FiltersState) {
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

function resolveCanonicalParams(filters: FiltersState) {
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
  if (filters.pageSize !== 18) params.pageSize = String(filters.pageSize);
  if (filters.reviewScoreDesc.length && !filters.reviewScoreDesc.includes(REVIEW_FILTER_ALL)) {
    params.reviewScoreDesc = filters.reviewScoreDesc.join(",");
  }
  if (filters.popularityScore !== 40) params.popularityScore = String(filters.popularityScore);
  return params;
}

function resolveGamesMetadata(sp: GamesSearchParams): {
  filters: FiltersState;
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  hasFilters: boolean;
} {
  const raw = parseFiltersFromSearchParams(sp);
  const filters = canonicalize(raw);
  const summaryParts = buildFilterSummary(filters);
  const hasFilters = summaryParts.length > 0;
  const filterLabel = summaryParts.join(" · ");
  const title = hasFilters ? `${filterLabel} 게임 검색` : DEFAULT_TITLE;
  const description = hasFilters
    ? `${filterLabel} 조건에 맞는 게임을 릴리즈픽에서 찾아보세요.`
    : DEFAULT_DESCRIPTION;
  const keywords = hasFilters ? [...BASE_KEYWORDS, filterLabel] : BASE_KEYWORDS;
  const canonicalParams = resolveCanonicalParams(filters);
  const canonicalSearch = buildSearch(canonicalParams).toString();
  const canonicalPath = canonicalSearch ? `/games?${canonicalSearch}` : "/games";
  return { filters, title, description, keywords, canonicalPath, hasFilters };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<GamesSearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const { title, description, keywords, canonicalPath } = resolveGamesMetadata(sp);
  const absolute = absoluteUrl(canonicalPath);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: absolute,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<GamesSearchParams>;
}) {
  const sp = await searchParams;
  const resetCookie = (await cookies()).get("__games_reset")?.value === "1";

  const { filters, hasFilters, title, canonicalPath } = resolveGamesMetadata(sp);

  const keyStamp = stableSerialize(filters);
  const qk = allGamesKey(filters, keyStamp); // 내부적으로 ["allGames", keyStamp]

  const qc = new QueryClient();
  if (!resetCookie) {
    await qc.prefetchInfiniteQuery({
      queryKey: qk,
      queryFn: fetchAllGamesPage,
      initialPageParam: 1,
      getNextPageParam: (last: any) => {
        const p = last?.pagination;
        return p?.hasNextPage ? (p.currentPage ?? 1) + 1 : undefined;
      },
    });
  }


  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: hasFilters ? title : "전체 게임 목록",
            description: hasFilters
              ? `${title} - 릴리즈픽`
              : "플랫폼과 장르를 조합해 원하는 게임을 찾을 수 있는 릴리즈픽 전체 게임 목록 페이지입니다.",
            url: absoluteUrl(canonicalPath),
          }),
        }}
      />
      <GamesClient initialFilters={filters} />
    </HydrationBoundary>
  );
}
