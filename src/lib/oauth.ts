/*
  Minimal OAuth 2.0 / OpenID Connect (authorization-code flow) for Google and
  LinkedIn — implemented with plain fetch, no dependencies. Each provider
  exposes an OIDC userinfo endpoint that returns the user's email and name.

  Setup (per provider), then set the env vars in .env.local:
  - Google:   https://console.cloud.google.com  → OAuth client (Web)
  - LinkedIn: https://www.linkedin.com/developers → "Sign In with LinkedIn using OpenID Connect"
  Authorized redirect URI: {your-origin}/api/auth/oauth/{provider}/callback
*/

type ProviderConfig = {
  label: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  extraAuthParams?: Record<string, string>;
  clientIdEnv: string;
  clientSecretEnv: string;
};

const PROVIDERS: Record<string, ProviderConfig> = {
  google: {
    label: "Google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    scope: "openid email profile",
    extraAuthParams: { access_type: "online", prompt: "select_account" },
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  },
  linkedin: {
    label: "LinkedIn",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    userInfoUrl: "https://api.linkedin.com/v2/userinfo",
    scope: "openid profile email",
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
  },
};

export function getProvider(name: string): ProviderConfig | null {
  return PROVIDERS[name] ?? null;
}

export function providerConfigured(name: string): boolean {
  const c = getProvider(name);
  return !!c && !!process.env[c.clientIdEnv] && !!process.env[c.clientSecretEnv];
}

export function buildAuthUrl(
  name: string,
  redirectUri: string,
  state: string,
): string {
  const c = getProvider(name)!;
  const params = new URLSearchParams({
    client_id: process.env[c.clientIdEnv]!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: c.scope,
    state,
    ...(c.extraAuthParams ?? {}),
  });
  return `${c.authUrl}?${params.toString()}`;
}

export async function exchangeCode(
  name: string,
  code: string,
  redirectUri: string,
): Promise<string> {
  const c = getProvider(name)!;
  const res = await fetch(c.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env[c.clientIdEnv]!,
      client_secret: process.env[c.clientSecretEnv]!,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`token ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (!json.access_token) throw new Error("no access_token in token response");
  return json.access_token as string;
}

export async function fetchProfile(
  name: string,
  accessToken: string,
): Promise<{ email: string; name: string }> {
  const c = getProvider(name)!;
  const res = await fetch(c.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`userinfo ${res.status}: ${await res.text()}`);
  }
  const j = await res.json();
  // Only trust an email the provider has actually verified — otherwise someone
  // could set a victim's address on their own provider profile and sign in as
  // the victim's existing account (the callback merges by email).
  if (j.email_verified !== true && j.email_verified !== "true") {
    throw new Error("provider did not confirm a verified email");
  }
  const email = String(j.email ?? "").trim().toLowerCase();
  const displayName =
    j.name ||
    [j.given_name, j.family_name].filter(Boolean).join(" ") ||
    (email ? email.split("@")[0] : "");
  return { email, name: displayName };
}
