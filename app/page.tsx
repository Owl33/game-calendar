import type { Metadata } from "next";
import HighlightsPage from "./highlights/client";
import { absoluteUrl } from "@/lib/seo";
import { primaryNavLinks } from "@/lib/navigation";

export const HOME_DESCRIPTION =
  "릴리즈픽에서는 멀티 플랫폼의 게임 발매일과 정보를 한눈에 확인할 수 있습니다. Steam, PlayStation, Nintendo 등 주요 플랫폼의 신작 출시 정보를 한곳에서 확인하고, 신작을 놓치지 마세요!";

export const metadata: Metadata = {
  title: "릴리즈픽",
  description: HOME_DESCRIPTION,
  keywords: [
    "게임 출시 일정",
    "신작 게임 캘린더",
    "PC 게임 출시",
    "콘솔 게임 출시",
    "스팀 신작",
    "닌텐도 출시 예정",
    "플레이스테이션 신작",
    "게임 발매 정보",
    "게임 릴리즈픽",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "릴리즈픽",
    description: HOME_DESCRIPTION,
    url: absoluteUrl("/"),
    type: "website",
    images: [
      {
        url: absoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "릴리즈픽 서비스 미리보기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "릴리즈픽",
    description: HOME_DESCRIPTION,
    images: [absoluteUrl("/og-image.png")],
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "릴리즈픽",
  url: "https://releasepicks.com",
  logo: absoluteUrl("/og-image.png"),
};

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "릴리즈픽 게임 출시 캘린더",
  description: HOME_DESCRIPTION,
  url: absoluteUrl("/"),
  isPartOf: {
    "@type": "Organization",
    name: "릴리즈픽",
    url: "https://releasepicks.com",
  },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "릴리즈픽",
  alternateName: "ReleasePicks",
  url: absoluteUrl("/"),
  inLanguage: "ko",
};

const siteNavigationLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "릴리즈픽 주요 내비게이션",
  itemListElement: primaryNavLinks.map((link, index) => ({
    "@type": "SiteNavigationElement",
    position: index + 1,
    name: link.label,
    url: absoluteUrl(link.path),
  })),
};

export default function RootPage() {
  const structuredData = [organizationLd, collectionLd, websiteLd, siteNavigationLd];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <HighlightsPage />
    </>
  );
}
