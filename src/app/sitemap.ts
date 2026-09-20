import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listJobs } from "@/lib/jobs-data";
import { PROJECTS } from "@/lib/portfolio";
import { SERVICES } from "@/lib/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: {
    path: string;
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
    priority: number;
  }[] = [
    // Core pages
    { path: "", changeFrequency: "daily", priority: 1.0 },

    // Main navigation
    { path: "/services", changeFrequency: "weekly", priority: 0.9 },
    { path: "/portfolio", changeFrequency: "weekly", priority: 0.9 },
    { path: "/industries", changeFrequency: "monthly", priority: 0.7 },

    // CTA pages
    { path: "/start", changeFrequency: "weekly", priority: 0.8 },
    { path: "/book-a-call", changeFrequency: "weekly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
    { path: "/career", changeFrequency: "weekly", priority: 0.8 },

  ];

  const base: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Dynamic: Service detail pages
  const services: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Dynamic: Portfolio detail pages
  const portfolio: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: `${SITE_URL}/portfolio/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Dynamic: Career job detail pages
  const careerJobs: MetadataRoute.Sitemap = (await listJobs())
    .filter((j) => j.status === "Hiring" || j.status === "Interviewing")
    .map((j) => ({
      url: `${SITE_URL}/career/${j.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [...base, ...services, ...portfolio, ...careerJobs];
}
