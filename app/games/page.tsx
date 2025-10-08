// app/games/page.tsx
import { Suspense } from "react";
import GamesClient from "./GamesClient";

export default function GamesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">로딩 중…</div>}>
      <GamesClient initialSearchParams={searchParams} />
    </Suspense>
  );
}
