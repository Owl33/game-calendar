import { buildSearch, getFirst, isDD, isYYYYMM, toYYYYMM } from "@/utils/searchParams";

export type CalendarSearchParams = Record<string, string | string[] | undefined>;
export type CalendarSort = "popularityScore" | "date" | "name";

function parseSortParam(raw: string | null | undefined): CalendarSort {
  switch (raw) {
    case "date":
      return "date";
    case "name":
      return "name";
    case "popularityScore":
    default:
      return "popularityScore";
  }
}

export function resolveCalendarContext(sp: CalendarSearchParams, today = new Date()) {
  const urlMonth = getFirst(sp, "m");
  const hasExplicitMonth = isYYYYMM(urlMonth);
  const rawYear = hasExplicitMonth ? Number(urlMonth!.slice(0, 4)) : today.getFullYear();
  const rawMonth = hasExplicitMonth ? Number(urlMonth!.slice(5, 7)) : today.getMonth() + 1;
  const month = Math.min(12, Math.max(1, rawMonth));
  const urlDay = getFirst(sp, "d");
  const day = isDD(urlDay) ? Number(urlDay) : null;
  const sortParam = getFirst(sp, "sort");
  const sortBy = parseSortParam(sortParam);
  const yearMonth = toYYYYMM(rawYear, month);

  return { year: rawYear, month, day, sortBy, yearMonth, hasExplicitMonth };
}

export function buildCalendarSearch(
  year: number,
  month: number,
  options?: { day?: number | null; sort?: CalendarSort }
) {
  const { day, sort } = options ?? {};
  const search = buildSearch({
    m: toYYYYMM(year, month),
    d: day && day > 0 ? String(day) : null,
    sort: sort && sort !== "popularityScore" ? sort : null,
  }).toString();
  return search;
}

export function buildCalendarPath(
  year: number,
  month: number,
  options?: { day?: number | null; sort?: CalendarSort }
) {
  const search = buildCalendarSearch(year, month, options);
  return search ? `/calendar?${search}` : "/calendar";
}

export function getCalendarCanonicalPath(hasExplicitMonth: boolean, yearMonth: string) {
  return hasExplicitMonth ? `/calendar?m=${yearMonth}` : "/calendar";
}
