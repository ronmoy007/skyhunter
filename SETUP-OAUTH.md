# OAuth Setup Guide

This guide helps you set up Google and LinkedIn authentication for SkyHunter.

## Google OAuth Setup

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **+ Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - `https://yourdomain.com` (for production)
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/oauth/google/callback` (local)
   - `https://yourdomain.com/api/auth/oauth/google/callback` (production)

### 2. Add Credentials to .env

Copy the **Client ID** and **Client Secret** to your `.env` file:

```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## LinkedIn OAuth Setup

### 1. Create OAuth App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers)
2. Click **Create an app**
3. Fill in the required information:
   - **App name**: SkyHunter
   - **LinkedIn Page**: Your company page (or create one)
   - **App logo**: Upload a logo
   - **Legal agreement**: Accept and continue

### 2. Configure Authentication

1. Go to the **Auth** tab
2. Under **Authorized redirect URLs**, add:
   - `http://localhost:3000/api/auth/oauth/linkedin/callback` (local)
   - `https://yourdomain.com/api/auth/oauth/linkedin/callback` (production)
3. Click **Update**

### 3. Get Credentials

1. Go to the **Auth** tab
2. Copy your **Client ID** and **Client Secret**

### 4. Request Sign In with LinkedIn using OpenID Connect

1. In the **Products** section, search for "Sign In with LinkedIn using OpenID Connect"
2. Click **Request access** if you don't have it
3. Once approved, you'll get the OpenID Connect endpoints

### 5. Add Credentials to .env

```bash
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
```

---

## Testing OAuth Flow

### 1. Restart the dev server

```bash
npm run dev
```

### 2. Visit the sign-in page

Open [http://localhost:3000/signin](http://localhost:3000/signin)

### 3. You should now see:

- "Continue with Google" button
- "Continue with LinkedIn" button
- Traditional email/password sign-in

### 4. Test the OAuth flow

Click either button and verify:
- You're redirected to the provider's login page
- After login, you're redirected back to `/signin`
- A new account is created with your email from the provider

---

## Troubleshooting

### "Provider isn't configured yet" error

- Ensure your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (or LinkedIn equivalents) are in `.env`
- Restart the dev server: `npm run dev`
- The app reads env vars at startup time

### Redirect URI mismatch error

- Make sure the exact URL in your provider settings matches:
  - `http://localhost:3000/api/auth/oauth/google/callback`
  - `http://localhost:3000/api/auth/oauth/linkedin/callback`
- Note: Some providers require `https://` for production URLs
- Test with `http://` on localhost

### "Email not verified" error

- LinkedIn and Google both require verified emails
- Make sure your test account has a verified email address
- LinkedIn in particular requires manual verification for sandbox apps

### CORS or network errors

- Verify your internet connection
- Check that the OAuth endpoints are accessible
- Review browser console and server logs for details

---

## Security Notes

- **Never commit `.env`** — it contains secrets
- Use different credentials for development and production
- Rotate secrets periodically
- Use environment-specific redirect URIs

---

## Code Reference

The OAuth implementation is in:
- `/src/lib/oauth.ts` — Provider configurations and token exchange
- `/src/app/api/auth/oauth/[provider]/start/route.ts` — Authorization initiation
- `/src/app/api/auth/oauth/[provider]/callback/route.ts` — Token exchange and user creation
- `/src/components/OAuthButtons.tsx` — Sign-in UI buttons

Each provider is only enabled when both `CLIENT_ID` and `CLIENT_SECRET` are configured.
