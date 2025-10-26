import type { Metadata } from "next";
import { HOME_DESCRIPTION } from "../page";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "릴리즈픽",
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: false,
    follow: true,
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

export { default } from "../page";
