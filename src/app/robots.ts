import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Crawl the public marketing/content pages; keep the app + private areas out of
// the index. Points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/dashboard",
        "/profile",
        "/messages",
        "/requests",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
