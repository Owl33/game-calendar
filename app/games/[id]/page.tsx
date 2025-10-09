// app/games/[id]/page.tsx
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { gameKeys, fetchGameDetail } from "@/lib/queries/game";
import GameDetailClient from "./client";

export const revalidate = 0; // 최신성 우선 (필요 시 조정)

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const qc = new QueryClient();
  const { id } = await params; // ✅ 필수

  await qc.prefetchQuery({
    queryKey: gameKeys.detail(id),
    queryFn: ({ signal }) => fetchGameDetail(id, signal),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <GameDetailClient gameId={id} />
    </HydrationBoundary>
  );
}
