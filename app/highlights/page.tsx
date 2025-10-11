// app/games/[id]/page.tsx
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { gameKeys, fetchHighlight } from "@/lib/queries/game";
import HighlightsClient from "./client";

export const revalidate = 0; // 최신성 우선 (필요 시 조정)

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: gameKeys.highlights(),
    queryFn: ({ signal }) => fetchHighlight(signal),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <HighlightsClient />
    </HydrationBoundary>
  );
}
