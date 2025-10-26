// lib/navigation.ts
// 중앙에서 재사용하는 주요 내비게이션 링크 정의

export type PrimaryNavLink = {
  label: string;
  path: string;
};

export const primaryNavLinks: PrimaryNavLink[] = [
  { label: "홈", path: "/" },
  { label: "캘린더", path: "/calendar" },
  { label: "전체 게임", path: "/games" },
];
