import { registrationAdd, type Registration } from "./store";

// Kept for the Apps Script webhook payload (column order in your Google Sheet).
export const SHEET_FIELDS = [
  "timestamp",
  "name",
  "email",
  "previousRole",
  "industry",
  "situation",
  "location",
] as const;

export type SheetRecord = Registration;

// Persist a signup for the admin dashboard (Supabase or local file), and — if
// a Google Apps Script webhook is configured — mirror it to your sheet too.
export async function recordSignup(record: Registration): Promise<void> {
  try {
    await registrationAdd(record);
  } catch (err) {
    console.error("[sheet] registration save failed:", err);
  }

  const webhook = process.env.SHEETS_WEBHOOK_URL;
  if (!webhook) return;

  if (!/^https:\/\/script\.google\.com\/macros\/.*\/exec/.test(webhook)) {
    console.warn(
      "[sheet] SHEETS_WEBHOOK_URL doesn't look like an Apps Script Web App URL " +
        "(expected https://script.google.com/macros/s/.../exec). It looks like the " +
        "spreadsheet edit URL — that returns 401. See SETUP-GOOGLE-SHEET.md.",
    );
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: process.env.SHEETS_WEBHOOK_TOKEN ?? "",
        fields: SHEET_FIELDS,
        record,
      }),
    });
    if (!res.ok) throw new Error(`Sheet responded ${res.status}`);
  } catch (err) {
    console.error("[sheet] Google Sheet mirror failed:", err);
  }
}
