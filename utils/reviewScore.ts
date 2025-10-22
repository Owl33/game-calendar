// utils/reviewScore.ts
// Steam 리뷰 요약(desc)과 라벨/톤/필터 옵션을 한 곳에서 정의한다.

export const REVIEW_FILTER_ALL = "all";
export const REVIEW_FILTER_NONE = "none";

export const REVIEW_SCORE_VALUES = [
  "Overwhelmingly Positive",
  "Very Positive",
  "Mostly Positive",
  "Positive",
  "Mixed",
  "Negative",
  "Mostly Negative",
  "Very Negative",
  "Overwhelmingly Negative",
  REVIEW_FILTER_NONE,
] as const;

export type ReviewScoreValue = (typeof REVIEW_SCORE_VALUES)[number];

const REVIEW_SCORE_LABEL_MAP: Record<ReviewScoreValue, string> = {
  "Overwhelmingly Positive": "압도적으로 긍정적",
  "Very Positive": "매우 긍정적",
  "Mostly Positive": "대체로 긍정적",
  Positive: "긍정적",
  Mixed: "복합적",
  Negative: "부정적",
  "Mostly Negative": "대체로 부정적",
  "Very Negative": "매우 부정적",
  "Overwhelmingly Negative": "압도적으로 부정적",
  [REVIEW_FILTER_NONE]: "유저 리뷰 없음",
};

const POSITIVE_SET = new Set<ReviewScoreValue>([
  "Overwhelmingly Positive",
  "Very Positive",
  "Mostly Positive",
  "Positive",
]);
const NEGATIVE_SET = new Set<ReviewScoreValue>([
  "Negative",
  "Mostly Negative",
  "Very Negative",
  "Overwhelmingly Negative",
]);

const REVIEW_SCORE_BY_LOWER = REVIEW_SCORE_VALUES.reduce<Record<string, ReviewScoreValue>>(
  (acc, value) => {
    acc[value.toLowerCase()] = value;
    return acc;
  },
  {},
);

export type ReviewTone = "positive" | "mixed" | "negative" | "none";

export function getReviewScoreLabel(desc: string | null | undefined): string {
  if (!desc) {
    return REVIEW_SCORE_LABEL_MAP[REVIEW_FILTER_NONE];
  }
  const normalized = normalizeReviewValue(desc);
  if (!normalized) {
    return REVIEW_SCORE_LABEL_MAP[REVIEW_FILTER_NONE];
  }
  return REVIEW_SCORE_LABEL_MAP[normalized];
}

export function getReviewTone(desc: string | null | undefined): ReviewTone {
  const normalized = normalizeReviewValue(desc);
  if (!normalized) {
    return "none";
  }
  if (POSITIVE_SET.has(normalized)) {
    return "positive";
  }
  if (NEGATIVE_SET.has(normalized)) {
    return "negative";
  }
  if (normalized === "Mixed") {
    return "mixed";
  }
  return "none";
}

export function buildReviewFilterOptions() {
  return REVIEW_SCORE_VALUES.map((value) => ({
    value,
    label: REVIEW_SCORE_LABEL_MAP[value],
  }));
}

export function normalizeReviewValue(value: string | null | undefined): ReviewScoreValue | null {
  if (!value) {
    return null;
  }
  const normalized = REVIEW_SCORE_BY_LOWER[value.trim().toLowerCase()];
  return normalized ?? null;
}

export function sanitizeReviewFilters(values: string[]): ReviewScoreValue[] {
  const seen = new Set<ReviewScoreValue>();
  values.forEach((value) => {
    const normalized = normalizeReviewValue(value);
    if (normalized) {
      seen.add(normalized);
    }
  });
  return REVIEW_SCORE_VALUES.filter((value) => seen.has(value));
}
