import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// Default social-share card for the whole site (Open Graph + Twitter). Rendered
// once at build into a 1200×630 PNG.
export const runtime = "nodejs";
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #17093a 0%, #2a0e5e 45%, #0c0a16 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 40 40">
            <defs>
              <linearGradient id="og" x1="6" y1="8" x2="34" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c084fc" />
                <stop offset="1" stopColor="#8710d8" />
              </linearGradient>
            </defs>
            <path d="M20 7 L34 20 L29 20 L20 12 L11 20 L6 20 Z" fill="url(#og)" />
            <path d="M20 16 L34 29 L29 29 L20 21 L11 29 L6 29 Z" fill="url(#og)" fillOpacity="0.5" />
          </svg>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            <span style={{ color: "#c084fc" }}>Sky</span>
            <span style={{ color: "#ffffff" }}>Hunter</span>
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Built to ship.
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#c7bde0", maxWidth: 860 }}>
            A product &amp; AI studio building e-commerce, healthcare, and law
            websites, AI agents, and LLM apps for startups and small agencies.
          </div>
        </div>

        {/* footer url */}
        <div style={{ display: "flex", fontSize: 26, color: "#9d8fc4", fontWeight: 600 }}>
          skyhunterlab.online
        </div>
      </div>
    ),
    size,
  );
}
