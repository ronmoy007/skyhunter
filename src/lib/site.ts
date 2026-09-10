// Central site constants for SEO (metadata, canonical/OG URLs, sitemap, robots).
// Override the domain per-environment with NEXT_PUBLIC_SITE_URL if it changes.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyhunterlab.online"
).replace(/\/+$/, "");

export const SITE_NAME = "SkyHunter";

export const SITE_TAGLINE = "AI agents, LLM apps & websites, built to ship";

export const SITE_DESCRIPTION =
  "SkyHunter is a product studio that builds e-commerce, healthcare, and law websites, AI agents, and LLM apps for startups and small agencies — from first spec to shipped, plus a team to run and improve it after launch.";
