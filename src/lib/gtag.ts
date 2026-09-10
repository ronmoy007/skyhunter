// Google Ads (gtag.js) integration. Everything is gated on env vars, so nothing
// loads or fires until you set them — see the setup notes in the PR/commit.
//
//   NEXT_PUBLIC_GOOGLE_ADS_ID            e.g. "AW-123456789"   (the Ads tag id)
//   NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL  e.g. "AbC-D_efGh"     (conversion label)
//
// The signup conversion fires with send_to = "<ADS_ID>/<SIGNUP_LABEL>".

export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const SIGNUP_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL;

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
