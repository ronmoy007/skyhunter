"use client";

// "Continue with Google / LinkedIn" buttons. Each button is shown only when its
// provider is actually configured (keys set) — the server passes those flags in
// — so an unconfigured provider never appears (no "Google isn't configured yet"
// dead-end). If neither is configured, nothing renders.

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3 0-5.6-2-6.6-4.8H1.4v3C3.4 21.3 7.4 24 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.8v-3H1.4a12 12 0 0 0 0 10.8l4-3z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.6l4 3C6.4 6.8 9 4.8 12 4.8z" />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M7.1 9.3H4.5V19h2.6V9.3zM5.8 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM19.5 19h-2.6v-4.8c0-1.2-.4-2-1.5-2-.8 0-1.3.5-1.5 1.1-.1.2-.1.5-.1.7V19H9.7s.03-8.8 0-9.7h2.6v1.4c.3-.5 1-1.3 2.5-1.3 1.8 0 3.2 1.2 3.2 3.8V19z"
      />
    </svg>
  );
}

export function OAuthButtons({
  action = "Continue",
  google = false,
  linkedin = false,
}: {
  action?: "Continue" | "Sign in" | "Sign up";
  google?: boolean;
  linkedin?: boolean;
}) {
  // Nothing to show if no provider is set up — skip the divider entirely.
  if (!google && !linkedin) return null;

  const btn =
    "flex w-full items-center justify-center gap-3 rounded-xl border border-steel-line bg-void px-4 py-3 text-sm font-semibold text-chrome transition-colors hover:bg-abyss";

  return (
    <div className="space-y-3">
      {google && (
        <a href="/api/auth/oauth/google/start" className={btn}>
          <GoogleMark />
          {action} with Google
        </a>
      )}
      {linkedin && (
        <a href="/api/auth/oauth/linkedin/start" className={btn}>
          <LinkedInMark />
          {action} with LinkedIn
        </a>
      )}
      <div className="flex items-center gap-3 pt-1">
        <span className="h-px flex-1 bg-steel-line" />
        <span className="text-xs text-fog">or with email</span>
        <span className="h-px flex-1 bg-steel-line" />
      </div>
    </div>
  );
}
