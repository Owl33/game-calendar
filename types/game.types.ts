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
  platforms: string[];
  stores: string[];
  storeLinks: StoreLink[];
  releaseDate: Date;
  comingSoon: boolean;
  releaseStatus: string;
  popularityScore: number;
  headerImage: string | null;
  genres: string[];
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
  range: {
    start: string;
    end: string;
  };
  count: {
    total: number;
    games: number;
    days: number;
  };
  data: Game[];
}

export interface GameDetail {
  platforms: string[];
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
  developers: string[];
  publishers: string[];
  currentPrice: number | null;
  releases: GameReleases[];
  dlcs: {
    id: number;
    name: string;
    price: string | null;
    releaseDate: Date | null;
  }[];
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
