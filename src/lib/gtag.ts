// Google Ads (gtag.js) integration. Everything is gated on env vars, so nothing
// loads or fires until you set them — see the setup notes in the PR/commit.
//
// Environment variables:
//   NEXT_PUBLIC_GOOGLE_ADS_ID                  e.g. "AW-123456789"   (the Ads tag id)
//   NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL        e.g. "AbC-D_efGh"     (signup conversion label)
//   NEXT_PUBLIC_GOOGLE_ADS_APPLICATION_LABEL   e.g. "XyZ-a_bcDe"     (job application conversion label)
//   NEXT_PUBLIC_GOOGLE_ADS_PAGE_VIEW_LABEL     e.g. "PqR-s_tUvW"     (careers page view label)
//
// Conversions fire with send_to = "<ADS_ID>/<LABEL>".

export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const SIGNUP_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL;
const APPLICATION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_APPLICATION_LABEL;
const PAGE_VIEW_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PAGE_VIEW_LABEL;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[];
  }
}

// Fire the "signed up" conversion for Google Ads. No-ops safely when the tag
// isn't configured or hasn't loaded yet.
export function trackSignupConversion(): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (!GOOGLE_ADS_ID || !SIGNUP_LABEL) return;
  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${SIGNUP_LABEL}`,
  });
}

// Fire the "job application" conversion for Google Ads. Tracks when a user
// submits a job application on the careers page.
export function trackJobApplicationConversion(jobTitle: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (!GOOGLE_ADS_ID || !APPLICATION_LABEL) return;
  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${APPLICATION_LABEL}`,
    value: 1,
    currency: "USD",
    job_title: jobTitle,
  });
}

// Fire a "careers page view" conversion. Tracks when users land on the careers page.
export function trackCareersPageView(): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (!GOOGLE_ADS_ID || !PAGE_VIEW_LABEL) return;
  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${PAGE_VIEW_LABEL}`,
  });
}
