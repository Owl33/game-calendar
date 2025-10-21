// /app/layout.tsx
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query";
import { Header } from "@/components/layout/Header";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { absoluteUrl, getSiteOrigin } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next"
import "../styles/globals.css";
const resolvedSiteUrl = getSiteOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(resolvedSiteUrl),
  title: {
    default: "릴리즈픽",
    template: "",
  },
  description:
    "릴리즈픽에서는 멀티 플랫폼의 게임 발매일과 정보를 한눈에 확인할 수 있습니다. Steam과 Playstaion, Nintendo 등 주요 플랫폼의 신작 출시 정보를 한곳에서 확인하고, 신작을 놓치지 마세요!",
  applicationName: "릴리즈픽",
  keywords: ["릴리즈픽", "게임 캘린더", "게임 출시", "콘솔 게임", "PC 게임", "신작 게임"],
  creator: "releasePicks",
  publisher: "releasePicks",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: resolvedSiteUrl,
    title: "릴리즈픽",
    description:
      "릴리즈픽에서는 멀티 플랫폼의 게임 발매일과 정보를 한눈에 확인할 수 있습니다. Steam과 Playstaion, Nintendo 등 주요 플랫폼의 신작 출시 정보를 한곳에서 확인하고, 신작을 놓치지 마세요!",
    siteName: "릴리즈픽",
    images: [
      {
        url: absoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "릴리즈픽 ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "릴리즈픽",
    description:
      "릴리즈픽에서는 멀티 플랫폼의 게임 발매일과 정보를 한눈에 확인할 수 있습니다. Steam과 Playstaion, Nintendo 등 주요 플랫폼의 신작 출시 정보를 한곳에서 확인하고, 신작을 놓치지 마세요!",
    images: [absoluteUrl("/og-image.png")],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
};
const spoqa = localFont({
  src: [
    { path: "../public/fonts/SpoqaHanSansNeo-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/SpoqaHanSansNeo-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/SpoqaHanSansNeo-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-spoqa",
  display: "swap",
  preload: true, // 초기 뷰에서 사용하면 유지
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${spoqa.variable}`}>
      <body className={` flex flex-col min-h-screen w-full`}>
        <ServiceWorkerRegister />
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
            forcedTheme="dark">
            <Header />
            <main className="py-4 lg:py-8 ">{children}</main>
          </ThemeProvider>
        </QueryProvider>
        <Analytics></Analytics>
  
      </body>
    </html>
  );
}
