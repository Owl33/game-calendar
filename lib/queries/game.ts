// lib/queries/game.ts
import type {
  AllGamesApiResponse,
  GameDetailApiResponse,
  CalendarApiResponse,
  FiltersState,
  Game,
  HighlightsResponse,
} from "@/types/game.types";
import { REVIEW_FILTER_ALL } from "@/utils/reviewScore";

export const gameKeys = {
  // 이건 건드리지 않아도 되지만, 앞으로는 stamp만으로 키를 만들 걸 권장합니다.
  all: (filters: FiltersState, stamp: string) => ["allGames", filters, stamp] as const,
  detail: (gameId: string | number) => ["game", String(gameId)] as const,
  calendar: (yearMonth: string) => ["games", "calendar", yearMonth] as const,
  highlights: () => ["highlights"] as const,
};
import sanitizeHtml from "sanitize-html";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

/** 배열→CSV(빈배열이면 undefined) */
const arrCsv = (v?: string[]) => (Array.isArray(v) && v.length ? v.join(",") : undefined);

/** ✅ 필터 → 쿼리 문자열 */
function buildListParams(page: number, f: FiltersState) {
  const p = new URLSearchParams();
  p.set("page", String(page));
  p.set("pageSize", String(f.pageSize ?? 9));
  if (f.startDate) p.set("startDate", f.startDate);
  if (f.endDate) p.set("endDate", f.endDate);
  if (f.onlyUpcoming) p.set("onlyUpcoming", "true");
  const genres = arrCsv(f.genres);
  const tags = arrCsv(f.tags);
  const developers = arrCsv(f.developers);
  const publishers = arrCsv(f.publishers);
  const platforms = arrCsv(f.platforms);
  const review = f.reviewScoreDesc ?? [REVIEW_FILTER_ALL];
  if (genres) p.set("genres", genres);
  if (tags) p.set("tags", tags);
  if (developers) p.set("developers", developers);
  if (publishers) p.set("publishers", publishers);
  if (platforms) p.set("platforms", platforms);
  if (review.length === 0 || review.includes(REVIEW_FILTER_ALL)) {
    p.set("reviewScoreDesc", REVIEW_FILTER_ALL);
  } else {
    p.set("reviewScoreDesc", review.join(","));
  }
  if (typeof f.popularityScore === "number") p.set("popularityScore", String(f.popularityScore));
  if (f.sortBy) p.set("sortBy", String(f.sortBy));
  if (f.sortOrder) p.set("sortOrder", String(f.sortOrder));
  return p.toString();
}

/** envelope({ data }) 방어 */
async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const json = await res.json();
  return (json?.data ?? json) as T;
}

/** ✅ 무한스크롤 1페이지 fetcher(컨텍스트 시그니처 유지) */
export async function fetchAllGamesPage({
  pageParam,
  signal,
  // 더는 queryKey에서 필터 꺼내지 않음
  meta,
}: {
  pageParam?: number;
  signal?: AbortSignal;
  meta?: { filters?: FiltersState };
}): Promise<AllGamesApiResponse> {
  const filters = meta?.filters as FiltersState;
  if (!filters) throw new Error("filters meta missing");
  const qs = buildListParams(pageParam ?? 1, filters);
  const res = await fetch(`${API_BASE}/api/games/all?${qs}`, { signal });
  return unwrap<AllGamesApiResponse>(res);
}

export async function fetchGameDetail(gameId: string | number, signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/api/games/${gameId}`, { signal });

  // 수동 처리: unwrap을 사용하면 json을 이미 consume하므로 여기선 직접 처리
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} :: ${txt}`);
  }

  const json = await res.json().catch(() => null);
  // 보수적으로 엔벨로프 형태를 보장
  const payload = json && typeof json === "object" && "data" in json ? json : { data: json };

  const game = payload.data as any;

  if (game && typeof game.description === "string" && game.description.trim().length > 0) {
    try {
      const cleaned = sanitizeHtml(game.description, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          "img",
          "br",
          "p",
          "ul",
          "ol",
          "li",
          "strong",
          "em",
          "a",
        ]),
        allowedAttributes: {
          a: ["href", "target", "rel"],
          img: ["src", "alt", "width", "height"],
          "*": ["class", "style"],
        },
        transformTags: {
          a: (tagName, attribs) => {
            const href = attribs.href || "";
            return {
              tagName: "a",
              attribs: {
                ...attribs,
                href,
                target: "_blank",
                rel: "noopener noreferrer",
              },
            };
          },
        },
      });
      payload.data = { ...game, safeDescription: cleaned };
    } catch (e) {
      // 정화 실패 시 원본을 유지하되 safeDescription은 null로 둬서 소비자가 판단하도록 함
      payload.data = { ...game, safeDescription: null };
      console.error("[fetchGameDetail] sanitize-html failed for gameId=", gameId, e);
    }
  } else {
    payload.data = { ...(game ?? {}), safeDescription: null };
  }

  return payload as GameDetailApiResponse;
}

/** ✅ 월 말일 계산 */
function lastDayOfMonth(yearMonth: string) {
  const y = Number(yearMonth.slice(0, 4));
  const m = Number(yearMonth.slice(5, 7)); // 1~12
  return new Date(y, m, 0).getDate();
}

/** ✅ 캘린더용 프리패치/클라 공용 */
export async function fetchCalendarMonth(
  yearMonth: string,
  signal?: AbortSignal
): Promise<CalendarApiResponse> {
  const end = String(lastDayOfMonth(yearMonth)).padStart(2, "0");
  const url = `${API_BASE}/api/games/all?popularityScore=40&startDate=${yearMonth}-01&endDate=${yearMonth}-${end}&pageSize=250&page=1`;
  const res = await fetch(url, { signal });
  const inner = await unwrap<AllGamesApiResponse>(res);
  const games: Game[] = Array.isArray((inner as any)?.data) ? ((inner as any).data as Game[]) : [];
  return {
    month: yearMonth,
    range: { start: `${yearMonth}-01`, end: `${yearMonth}-${end}` },
    count: { total: games.length, games: games.length, days: 0 },
    data: games,
  } as CalendarApiResponse;
}

export async function fetchHighlight(signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/api/games/highlights`, { signal });
  return unwrap<HighlightsResponse>(res);
}
