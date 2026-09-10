import { notifyAdd, listUsers, type NewNotification } from "./store";

/*
  Best-effort notification helpers. These never throw — a notification failing
  must never break a sign-in / sign-up. Errors are logged and swallowed.
*/

export async function notifyUser(
  email: string,
  n: NewNotification,
): Promise<void> {
  try {
    await notifyAdd(email, n);
  } catch (err) {
    console.error("[notify] failed:", err);
  }
}

// Notify every admin (ADMIN_EMAILS + users with is_admin).
export async function notifyAdmins(n: NewNotification): Promise<void> {
  try {
    const recipients = new Set<string>(
      (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    );
    const users = await listUsers();
    for (const u of users) if (u.is_admin) recipients.add(u.email.toLowerCase());
    await Promise.all([...recipients].map((email) => notifyAdd(email, n)));
  } catch (err) {
    console.error("[notify] admin fan-out failed:", err);
  }
}
