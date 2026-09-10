/*
  Email via Resend's HTTP API (no npm dependency — just fetch). With no provider
  configured, it logs instead of sending so flows still work in dev.

  Set EMAIL_FROM to your verified sender, e.g. "SkyHunter <support@skyhunterlab.online>".
*/
const DEFAULT_FROM =
  process.env.EMAIL_FROM || "SkyHunter <support@skyhunterlab.online>";

type SendResult = { sent: boolean; provider: "resend" | "none" };

// Core sender. Never throws — email failures must not break the action.
async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `[email] No provider configured — would send "${opts.subject}" to ${opts.to}`,
    );
    return { sent: false, provider: "none" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: opts.from || DEFAULT_FROM,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    return { sent: true, provider: "resend" };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { sent: false, provider: "resend" };
  }
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  code: string,
): Promise<SendResult> {
  return sendEmail({
    to,
    subject: "Your SkyHunter verification code",
    text: `Hi ${name || "there"},\n\nYour SkyHunter verification code is ${code}.\nIt expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    html: emailHtml(name, code),
  });
}

// Sent to each member when an admin matches two people for a contract.
export async function sendContractMatchEmail(
  to: string,
  name: string,
  partnerName: string,
  context: string,
  url: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: "You've been matched for a contract on SkyHunter",
    text:
      `Hi ${name || "there"},\n\n` +
      `Good news — SkyHunter connected you with ${partnerName}` +
      `${context ? ` for "${context}"` : ""}. A private chat is now open between you two.\n\n` +
      `Open your messages to say hello and get started:\n${url}\n\n— The SkyHunter team`,
    html: contractHtml(name, partnerName, context, url),
  });
}

// Sent whenever an admin acts on a member's request — status change, interview
// scheduled, or a request removed. Comes from support@skyhunterlab.online.
export async function sendRequestUpdateEmail(opts: {
  to: string;
  name: string;
  subject: string;
  heading: string;
  message: string;
  cta?: { label: string; url: string };
}): Promise<SendResult> {
  const { to, name, subject, heading, message, cta } = opts;
  const text =
    `Hi ${name || "there"},\n\n${heading}\n\n${message}\n\n` +
    (cta ? `${cta.label}: ${cta.url}\n\n` : "") +
    `— The SkyHunter team\nsupport@skyhunterlab.online`;
  return sendEmail({
    to,
    subject,
    text,
    html: requestUpdateHtml(name, heading, message, cta),
  });
}

function requestUpdateHtml(
  name: string,
  heading: string,
  message: string,
  cta?: { label: string; url: string },
): string {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1c1d1f">
    <p style="font-size:20px;font-weight:700;margin:0 0 4px">SkyHunter</p>
    <p style="color:#6a6f73;margin:0 0 24px">Design · Build · Ship</p>
    <p>Hi ${name || "there"},</p>
    <p style="font-size:17px;font-weight:700;margin:18px 0 6px;color:#1c1d1f">${heading}</p>
    <p style="line-height:1.6">${message}</p>
    ${
      cta
        ? `<div style="text-align:center;margin:28px 0">
      <a href="${cta.url}" style="display:inline-block;background:#8710d8;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:12px">${cta.label}</a>
    </div>
    <p style="color:#6a6f73;font-size:14px">If the button doesn't work, copy this link into your browser:<br><a href="${cta.url}" style="color:#6d28d9">${cta.url}</a></p>`
        : ""
    }
    <p style="color:#6a6f73;font-size:13px;margin-top:24px">Questions? Just reply to this email — support@skyhunterlab.online</p>
  </div>`;
}

function contractHtml(
  name: string,
  partnerName: string,
  context: string,
  url: string,
): string {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1c1d1f">
    <p style="font-size:20px;font-weight:700;margin:0 0 4px">SkyHunter</p>
    <p style="color:#6a6f73;margin:0 0 24px">Design · Build · Ship</p>
    <p>Hi ${name || "there"},</p>
    <p>Good news — SkyHunter has connected you with <strong>${partnerName}</strong>${context ? ` for <strong>${context}</strong>` : ""}. A private chat is now open between the two of you.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="${url}" style="display:inline-block;background:#8710d8;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:12px">Open your chat</a>
    </div>
    <p style="color:#6a6f73;font-size:14px">If the button doesn't work, copy this link into your browser:<br><a href="${url}" style="color:#6d28d9">${url}</a></p>
    <p style="color:#6a6f73;font-size:13px;margin-top:24px">Questions? Just reply to this email — support@skyhunterlab.online</p>
  </div>`;
}

function emailHtml(name: string, code: string): string {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1c1d1f">
    <p style="font-size:20px;font-weight:700;margin:0 0 4px">SkyHunter</p>
    <p style="color:#6a6f73;margin:0 0 24px">Design · Build · Ship</p>
    <p>Hi ${name || "there"},</p>
    <p>Use this code to finish creating your account:</p>
    <div style="font-size:34px;font-weight:700;letter-spacing:10px;background:#f2effc;color:#6d28d9;text-align:center;padding:18px;border-radius:12px;margin:16px 0">${code}</div>
    <p style="color:#6a6f73;font-size:14px">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>
  </div>`;
}
