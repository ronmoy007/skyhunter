import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { CallProvider } from "@/components/CallProvider";
import { ChatNotifier } from "@/components/ChatNotifier";
import { VisitTracker } from "@/components/VisitTracker";
import { PresenceBeacon } from "@/components/PresenceBeacon";
import { Analytics } from "@/components/Analytics";
import { ConversionListener } from "@/components/ConversionListener";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/site";

// Variable fonts: omitting `weight` loads a single variable file that covers
// every weight we use (Tailwind's medium→extrabold), instead of one static
// file per weight — fewer requests, smaller total payload, faster text paint.
// These are variable fonts; next/font serves the variable file (covering every
// weight Tailwind uses) whether or not we pin weights, so we omit the arrays.
// Display + brand wordmark: Sora — a modern geometric sans.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

// Body copy: Inter — the clean, neutral product-site standard.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set their own full "<Page> · SkyHunter" title; this is the fallback
  // for any page that doesn't (e.g. the home page).
  title: `${SITE_NAME} — ${SITE_TAGLINE}: a studio building websites, AI agents & LLM apps`,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "SkyHunter",
    "AI development studio",
    "AI agent development",
    "LLM app development",
    "custom AI agents",
    "e-commerce website development",
    "healthcare software development",
    "legal tech development",
    "RAG",
    "AI for startups and agencies",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: "en_US",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: `${SITE_URL}/og-image.png`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable}`}
    >
      <body className="min-h-screen antialiased">
        {/* Structured data: helps Google understand the brand + site. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/logo.png`,
                description: SITE_DESCRIPTION,
                slogan: SITE_TAGLINE,
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
                description: SITE_DESCRIPTION,
              },
            ]),
          }}
        />
        {/* Set the theme before first paint so there's no light/dark flash.
            Reads the saved choice, else falls back to the OS preference. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('sky_theme');if(t!=='light'&&t!=='dark'){t='light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();",
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-blue-500 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <AuthProvider>
          <CallProvider>
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
            <ChatNotifier />
            <VisitTracker />
            <PresenceBeacon />
            <ConversionListener />
          </CallProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
