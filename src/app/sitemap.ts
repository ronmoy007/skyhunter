import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listJobs } from "@/lib/jobs-data";
import { PROJECTS } from "@/lib/portfolio";
import { SERVICES } from "@/lib/services";

// Public URLs for search engines. Regenerated on each build (and when the jobs
// data revalidates), so newly added roles appear automatically.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: {
    path: string;
    changeFrequency: "daily" | "weekly" | "monthly";
    priority: number;
  }[] = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/services", changeFrequency: "weekly", priority: 0.8 },
    { path: "/portfolio", changeFrequency: "weekly", priority: 0.8 },
    { path: "/work", changeFrequency: "daily", priority: 0.7 },
    { path: "/industries", changeFrequency: "weekly", priority: 0.6 },
    { path: "/case-studies", changeFrequency: "weekly", priority: 0.6 },
    { path: "/start", changeFrequency: "monthly", priority: 0.7 },
    { path: "/book-a-call", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "weekly", priority: 0.5 },
  ];

  const base: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const jobs: MetadataRoute.Sitemap = (await listJobs()).map((j) => ({
    url: `${SITE_URL}/work/${j.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const portfolio: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: `${SITE_URL}/portfolio/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const services: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...base, ...services, ...portfolio, ...jobs];
}
