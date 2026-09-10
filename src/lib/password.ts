// Shared password policy — imported by both the signup form (live meter) and
// the signup API route (server-side enforcement) so the rules never drift.

export type PasswordRule = { label: string; test: (pw: string) => boolean };

export const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "A number", test: (p) => /\d/.test(p) },
  { label: "A symbol (!?@#…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// A few obviously weak passwords to reject outright even if they tick the boxes.
const COMMON = [
  "password",
  "password1",
  "passw0rd",
  "12345678",
  "qwerty123",
  "iloveyou",
  "admin123",
  "letmein1",
];

export function passwordScore(pw: string): number {
  return PASSWORD_RULES.filter((r) => r.test(pw)).length; // 0..5
}

export function isStrongPassword(pw: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(pw)) && !isCommon(pw);
}

export function isCommon(pw: string): boolean {
  return COMMON.includes(pw.trim().toLowerCase());
}

// Server-side: return an error message, or null when the password is acceptable.
export function passwordError(pw: string): string | null {
  const missing = PASSWORD_RULES.filter((r) => !r.test(pw)).map((r) =>
    r.label.toLowerCase(),
  );
  if (missing.length) return `Password needs: ${missing.join(", ")}.`;
  if (isCommon(pw)) return "That password is too common. Choose a stronger one.";
  return null;
}

export const STRENGTH_LABELS = [
  "Too weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
  "Very strong",
];
