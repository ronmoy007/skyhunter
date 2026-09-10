/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Hide Next.js's on-screen dev indicator / dev-tools overlay (the "Preferences"
  // panel). It's a dev-only Next.js UI, never shipped to production.
  devIndicators: false,
  // Permanent redirects from the old route slugs to the current, name-matching
  // ones — so any old link/bookmark still lands on the right page.
  async redirects() {
    return [
      { source: "/reskill", destination: "/services", permanent: true },
      { source: "/community", destination: "/industries", permanent: true },
      { source: "/support", destination: "/contact", permanent: true },
      { source: "/interview", destination: "/book-a-call", permanent: true },
      { source: "/stories", destination: "/case-studies", permanent: true },
      { source: "/jobs", destination: "/work", permanent: true },
      { source: "/jobs/:id", destination: "/work/:id", permanent: true },
    ];
  },
  images: {
    // Serve AVIF first (smaller than WebP) with WebP fallback; cache the
    // optimized variants for a day so repeat visits skip re-encoding.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    // Real portrait photos for story/member avatars are hosted online.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/api/portraits/**",
      },
    ],
  },
};

export default nextConfig;
