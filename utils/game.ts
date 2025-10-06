/**
 * 게임 관련 공통 유틸리티 함수
 */

// 메이저 퍼블리셔 목록
const MAJOR_PUBLISHERS = [
  "Ubisoft",
  "Electronic Arts",
  "Activision",
  "Sony",
  "Microsoft",
  "Nintendo",
  "Rockstar",
  "CD Projekt",
];

/**
 * AAA급 게임 여부 확인
 * @param game - 게임 객체 (rating, publishers 속성 필요)
 * @returns AAA급 게임이면 true
 */
export function isAAAgame(game: any): boolean {
  const rating = game.rating || 0;
  const publishers = game.publishers || [];
  const score = game.popularityScore;
  return score > 70;
}

/**
 * 출시일까지 남은 일수 계산
 * @param releaseDate - 출시일 (문자열 또는 Date)
 * @returns 남은 일수 (음수면 이미 출시)
 */
export function getDaysUntilRelease(releaseDate: string | Date): number {
  const release = new Date(releaseDate);
  const today = new Date();
  const diffTime = release.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * 장르별 그라디언트 색상 반환
 * @param genres - 장르 배열 (현재는 기본 색상만 반환)
 * @returns Tailwind CSS 그라디언트 클래스
 */
export function getGenreColor(genres?: string[]): string {

  
  
  // TODO: 장르별 색상 매핑 구현
  // if (genres?.includes("Action")) return "bg-gradient-to-r from-red-500 to-red-600";
  // if (genres?.includes("RPG")) return "bg-gradient-to-r from-purple-500 to-purple-600";
  // if (genres?.includes("Strategy")) return "bg-gradient-to-r from-blue-500 to-blue-600";
  return "bg-gradient-to-r from-blue-500 to-blue-600";
}

/**
 * 플랫폼 이름 정규화
 * @param platforms - 플랫폼 문자열 배열
 * @returns 정규화된 중복 제거된 플랫폼 배열
 */
export function normalizePlatforms(platforms: string[]): string[] {
  return Array.from(
    new Set(
      (platforms ?? []).map((p) => {
        const lower = p.toLowerCase();
        if (lower.includes("playstation")) return "PS";
        if (lower.includes("xbox")) return "Xbox";
        if (lower.includes("nintendo")) return "Nintendo";
        if (["pc", "macos", "linux"].some((os) => lower.includes(os))) return "PC";
        return p; // 매핑 안 되면 원래 값 유지
      })
    )
  );
}

/**
 * 플랫폼별 아이콘 이름 반환
 * @param platform - 플랫폼 이름
 * @returns 아이콘 타입 ("pc" | "console" | "mobile")
 */
export function getPlatformIconType(platform: string): "pc" | "console" | "mobile" {
  const platformLower = platform.toLowerCase();

  if (platformLower.includes("pc")) return "pc";

  if (
    platformLower.includes("playstation") ||
    platformLower.includes("xbox") ||
    platformLower.includes("nintendo")
  ) {
    return "console";
  }

  if (
    platformLower.includes("mobile") ||
    platformLower.includes("ios") ||
    platformLower.includes("android")
  ) {
    return "mobile";
  }

  return "pc"; // 기본값
}
