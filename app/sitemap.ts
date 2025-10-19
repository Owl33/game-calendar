import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";

const siteUrl = getSiteOrigin();

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

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
