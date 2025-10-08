// app/calendar/page.tsx
import { Suspense } from "react";
import CalendarClient from "./CalendarClient";

export default function CalendarPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">로딩 중…</div>}>
      <CalendarClient initialSearchParams={searchParams} />
    </Suspense>
  );
}
