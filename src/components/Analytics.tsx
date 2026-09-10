"use client";

import Script from "next/script";
import { GOOGLE_ADS_ID } from "@/lib/gtag";

// Loads the Google tag (gtag.js) for Google Ads — page views, remarketing
// audiences, and conversion tracking. Renders nothing until
// NEXT_PUBLIC_GOOGLE_ADS_ID is set, so it stays inert in dev / before setup.
export function Analytics() {
  if (!GOOGLE_ADS_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
