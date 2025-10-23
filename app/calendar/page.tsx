// app/calendar/page.tsx
import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import CalendarClient from "./client";
import { gameKeys, fetchCalendarMonth } from "@/lib/queries/game";
import { isYYYYMM, getFirst, toYYYYMM } from "@/utils/searchParams";
import { absoluteUrl } from "@/lib/seo";

const DEFAULT_TITLE = "캘린더";
const DEFAULT_DESCRIPTION =
  "PC·콘솔 신작 출시 일정을 캘린더로 확인 할 수 있습니다. 신작 게임을 놓치지 마세요!";

type CalendarSearchParams = Record<string, string | string[] | undefined>;

function resolveCalendarContext(sp: CalendarSearchParams) {
  const today = new Date();
  const urlMonth = getFirst(sp, "m");
  const hasExplicitMonth = isYYYYMM(urlMonth);
  const rawYear = hasExplicitMonth ? Number(urlMonth!.slice(0, 4)) : today.getFullYear();
  const rawMonth = hasExplicitMonth ? Number(urlMonth!.slice(5, 7)) : today.getMonth() + 1;
  const month = Math.min(12, Math.max(1, rawMonth));
  const year = rawYear;
  const yearMonth = toYYYYMM(year, month);
  return { year, month, yearMonth, hasExplicitMonth };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CalendarSearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const { year, month, yearMonth, hasExplicitMonth } = resolveCalendarContext(sp);

  const monthLabel = `${month}월`;
  const fullLabel = `${year}년 ${monthLabel}`;
  const canonicalPath = hasExplicitMonth ? `/calendar?m=${yearMonth}` : "/calendar";
  const canonicalUrl = absoluteUrl(canonicalPath);

  const title = `${fullLabel} 게임 출시 예정작`;
  const description = `${fullLabel} 출시 예정 게임 일정을 캘린더로 확인하세요. ${monthLabel} 신작·신규 게임을 한눈에 확인하고 놓치지 마세요!`;
  const keywords = [
    `${fullLabel} 신작 게임`,
    `${fullLabel} 신규 게임`,
    `${fullLabel} 출시 게임`,
    `${fullLabel} 출시 예정작`,
    `${monthLabel} 신규 게임`,
    `${monthLabel} 신작 출시 게임`,
    `${monthLabel} 게임 일정`,
    `${monthLabel} 출시 예정작`,
    "게임 출시 일정",
    "게임 출시 예정",
    "PC 콘솔 신작 일정",
    "게임 캘린더",
    "게임 신작",
    "게임 신작 출시 일정",
  ];

  return {
    title: hasExplicitMonth ? title : DEFAULT_TITLE,
    description: hasExplicitMonth ? description : DEFAULT_DESCRIPTION,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: hasExplicitMonth ? title : DEFAULT_TITLE,
      description: hasExplicitMonth ? description : DEFAULT_DESCRIPTION,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: hasExplicitMonth ? title : DEFAULT_TITLE,
      description: hasExplicitMonth ? description : DEFAULT_DESCRIPTION,
    },
  };
}

export const revalidate = 0;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<CalendarSearchParams>;
}) {
  const sp = await searchParams;

  const { yearMonth } = resolveCalendarContext(sp);

  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: gameKeys.calendar(yearMonth),
    queryFn: ({ signal }) => fetchCalendarMonth(yearMonth, signal),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <CalendarClient initialSearchParams={sp} />
    </HydrationBoundary>
  );
}
