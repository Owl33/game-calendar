import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";

const siteUrl = getSiteOrigin();

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const calendarEntries = [-1, 0, 1].map((offset) => {
    const ref = new Date(lastModified.getFullYear(), lastModified.getMonth() + offset, 1);
    const year = ref.getFullYear();
    const month = String(ref.getMonth() + 1).padStart(2, "0");
    return {
      url: `${siteUrl}/calendar?m=${year}-${month}`,
      lastModified: ref,
      changeFrequency: "daily" as const,
      priority: 0.85,
    };
  });

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/calendar`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...calendarEntries,
    {
      url: `${siteUrl}/games`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/highlights`,
      lastModified,
      changeFrequency: "always",
      priority: 0.7,
    },

  ];
}
