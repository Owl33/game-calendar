// root/types/game.types.ts

// 1) 공통 리터럴 유니온

// 2) 기존 타입들에 PlatformKey 적용
export interface StoreLink {
  store: string;
  url: string | null;
}

export interface Game {
  currentPrice: number | null;
  releaseDateRaw: string | null;
  releaseIds: number[];
  gameId: number;
  name: string;
  slug: string;
  platforms: string[]; // 🔁 string[] → PlatformKey[]
  stores: string[];
  storeLinks: StoreLink[];
  releaseDate: Date; // API가 문자열이면 실제 사용 시 new Date()로 변환
  comingSoon: boolean;
  releaseStatus: string;
  popularityScore: number;
  isFree: boolean;
  headerImage: string | null;
  genres: string[];
}
export interface HighlightsResponse {
  featured: Game;
  upcoming: Game[];
  popular: Game[];
  stats?: {
    thisMonthGames: number;
    upcomingGames: number;
    totalGames: number;
    popularGames: number;
  };
}
export interface GamesByDate {
  [day: number]: Game[];
}

export interface CalendarDate {
  year: number;
  month: number;
  day: number | null;
}

interface GameReleases {
  playform: string;
  store: string;
  url: string;
  releaseDate: Date;
  releaseDateRaw: string;
}

export interface CalendarApiResponse {
  month: string;
  range: { start: string; end: string };
  count: { total: number; games: number; days: number };
  data: Game[];
}

export interface GameDetail {
  platforms: string[]; // 🔁 string[] → PlatformKey[]
  id: string;
  name: string;
  slug: string;
  steamId: number | null;
  rawgId: number | null;
  gameType: string;
  isDlc: boolean;
  comingSoon: boolean;
  popularityScore: number;
  releaseDate: Date;
  releaseStatus: string;
  followersCache: number | null;
  description: string | null;
  website: string | null;
  genres: string[];
  tags: string[];
  supportLanguages: string[];
  screenshots: string[];
  videoUrl: string | null;
  metacriticScore: number | null;
  opencriticScore: number | null;
  rawgAdded: number | null;
  totalReviews: number | null;
  reviewScoreDesc: string | null;
  headerImage: string | null;
  developers: { id: number; name: string }[];
  publishers: { id: number; name: string }[];
  currentPrice: number | null;
  releases: GameReleases[];
  dlcs: { id: number; name: string; price: string | null; releaseDate: Date | null }[];
}

export interface GameDetailApiResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  requestId: string;
  message: string;
  code: string;
  data: GameDetail;
}

// 3) /api/games/all 응답 래퍼(페이지 공용)
export interface AllGamesApiResponse {
  filters?: Record<string, unknown>;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  count: { total: number; filtered: number };
  data: Game[]; // 리스트는 Game[]
}
export type FiltersState = {
  startDate: string;
  endDate: string;
  onlyUpcoming: boolean;
  genres: string[];
  tags: string[];
  developers: string[];
  publishers: string[];
  platforms: string[]; // ✅ 글로벌과 일치
  sortBy: "releaseDate" | "popularity" | "name";
  sortOrder: "ASC" | "DESC";
  pageSize: number;
  popularityScore: number;
};
