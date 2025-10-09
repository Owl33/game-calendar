// app/calendar/page.tsx
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import CalendarClient from "./client";
import { gameKeys, fetchCalendarMonth } from "@/lib/queries/game";
import { isYYYYMM, getFirst, toYYYYMM } from "@/utils/searchParams";

export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const today = new Date();
  const urlM = getFirst(sp, "m");
  const y = isYYYYMM(urlM) ? Number(urlM!.slice(0, 4)) : today.getFullYear();
  const m = isYYYYMM(urlM) ? Number(urlM!.slice(5, 7)) : today.getMonth() + 1;
  const yearMonth = toYYYYMM(y, m);

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
