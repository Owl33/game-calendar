// app/games/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { gameKeys, fetchGameDetail } from "@/lib/queries/game";
import type { GameDetail, GameDetailApiResponse } from "@/types/game.types";
import GameDetailClient from "./client";
import { absoluteUrl } from "@/lib/seo";

type GameDetailResponse = GameDetailApiResponse | GameDetail;

const resolveGameDetail = (detail: GameDetailResponse | null | undefined): GameDetail | null => {
  if (!detail) return null;

  if (typeof detail === "object" && "data" in detail) {
    const candidate = (detail as GameDetailApiResponse).data;
    return candidate ?? null;
  }

  if (typeof detail === "object" && "id" in detail) {
    return detail as GameDetail;
  }

  return null;
};

const getGameDetail = cache(async (id: string) => {
  const start = Date.now();
  try {
    const response = (await fetchGameDetail(id)) as GameDetailResponse;
    const game = resolveGameDetail(response);
    if (!game) return null;
    return { raw: response, game };
  } catch (error) {
    const took = Date.now() - start;
    console.error(`[getGameDetail] id=${id} failed after ${took}ms:`, error);
    if (error instanceof Error && /404/.test(error.message)) {
      return null;
    }
    throw error;
  }
});

type GamePageParams = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: GamePageParams }): Promise<Metadata> {
  const { id } = await params;
  let detail;
  try {
    detail = await getGameDetail(id);
  } catch (err) {
    // 상세 로깅 — Vercel 로그에서 timestamp로 찾기 쉬움
    console.error(
      `[generateMetadata] getGameDetail failed id=${id} message=${(err as Error)?.message}`,
      err
    );
    // 안전한 fallback metadata: 500 대신 유효한 메타를 반환
    return {
      title: "게임 정보를 불러오는 중입니다",
      description: "일시적인 문제로 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.",
      alternates: { canonical: `/games/${id}` },
      robots: { index: false, follow: true }, // 색인 보호 원하면 false로 변경
      openGraph: { title: "게임 정보를 불러오는 중입니다", url: absoluteUrl(`/games/${id}`) },
    };
  }
  if (!detail?.game) {
    return {
      title: "게임 정보를 찾을 수 없어요",
      description: "요청하신 게임 내용을 찾을 수 없습니다. 다른 게임을 검색해 보세요.",
      alternates: {
        canonical: `/games/${id}`,
      },
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: "게임 정보를 찾을 수 없어요",
        description: "요청하신 게임 내용을 찾을 수 없습니다. 다른 게임을 검색해 보세요.",
        url: absoluteUrl(`/games/${id}`),
      },
      twitter: {
        card: "summary",
        title: "게임 정보를 찾을 수 없어요",
        description: "요청하신 게임 내용을 찾을 수 없습니다. 다른 게임을 검색해 보세요.",
      },
    };
  }

  const game = detail.game;
  const plainDescription = (game.description ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const limitedDescription = plainDescription.slice(0, 155);
  const description =
    limitedDescription.length === plainDescription.length
      ? limitedDescription
      : `${limitedDescription}…`;
  const title = `${game.name}`;
  const ogUrl = absoluteUrl(`/games/${id}`);
  const ogImage = game.headerImage ? absoluteUrl(game.headerImage) : absoluteUrl("/og-image.png");

  return {
    title,
    description:
      description || `${game.name}의 출시 일정과 지원 플랫폼, 가격 정보를 릴리즈픽에서 확인하세요.`,
    alternates: {
      canonical: `/games/${id}`,
    },
    openGraph: {
      title,
      description:
        description ||
        `${game.name}의 출시 일정과 지원 플랫폼, 가격 정보를 릴리즈픽에서 확인하세요.`,
      url: ogUrl,
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${game.name} 캡처 이미지`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description:
        description ||
        `${game.name}의 출시 일정과 지원 플랫폼, 가격 정보를 릴리즈픽에서 확인하세요.`,
      images: [ogImage],
    },
  };
}

export const revalidate = 0; // 최신성 우선 (필요 시 조정)

export default async function Page({ params }: { params: GamePageParams }) {
  const { id } = await params;
  let detail;
  try {
    detail = await getGameDetail(id);
  } catch (err) {
    console.error(`[Page] getGameDetail failed id=${id}`, err);
    // fallback UI: notFound() 보다는 사용자/봇에 200으로 보여주되 "임시" 표시
    return (
      <main>
        <h1>게임 정보를 불러오는 중입니다</h1>
        <p>잠시 후 다시 시도해 주세요.</p>
      </main>
    );
  }

  if (!detail?.game) {
    notFound();
  }
  const ensuredDetail = detail as NonNullable<typeof detail>;
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "전체 게임",
        item: absoluteUrl("/games"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: ensuredDetail.game.name,
        item: absoluteUrl(`/games/${id}`),
      },
    ],
  };

  const qc = new QueryClient();
  qc.setQueryData(gameKeys.detail(id), ensuredDetail.raw);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd),
        }}
      />
      <GameDetailClient gameId={id} />
    </HydrationBoundary>
  );
}
