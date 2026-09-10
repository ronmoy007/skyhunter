/*
  Local-development gating.

  IS_DEV is true whenever we're NOT in a production build — i.e. during
  `next dev` (NODE_ENV="development") or any non-production environment. It's
  false only for a real production build/start (NODE_ENV="production").

  While in dev (no domain / external setup yet) we hide the pieces that need
  outside services:
    - Google / LinkedIn social login (needs OAuth apps + a real redirect domain)
    - the emailed 6-digit verification code (needs an email provider)
  so signup creates the account directly and the app is fully usable locally.
*/
export const IS_DEV = process.env.NODE_ENV !== "production";
