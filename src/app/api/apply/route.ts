import { NextResponse } from "next/server";
import { getSession, getCurrentUser, isAdminUser } from "@/lib/auth";
import { applicationAdd, applicationRemove, appliedJobIds } from "@/lib/store";
import { getJobById } from "@/lib/jobs-data";
import { isJobOpen } from "@/lib/jobs";
import { notifyUser, notifyAdmins } from "@/lib/notify";

export const runtime = "nodejs";

// Whether the signed-in member has already applied to a given job. Lets the
// (statically rendered) job detail page resolve the apply widget client-side
// instead of the server reading the session cookie.
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ applied: false });
  const jobId = new URL(req.url).searchParams.get("jobId")?.trim();
  if (!jobId) return NextResponse.json({ applied: false });
  const applied = (await appliedJobIds(session.email)).includes(jobId);
  return NextResponse.json({ applied });
}

// Apply to a job.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Please sign in to apply." },
      { status: 401 },
    );
  }
  // Admins manage roles — they don't apply to them.
  if (isAdminUser(user)) {
    return NextResponse.json(
      { ok: false, error: "Admin accounts can't apply to roles." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const jobId = String(body?.jobId ?? "").trim();
  if (!jobId) {
    return NextResponse.json({ ok: false, error: "Missing job." }, { status: 400 });
  }
  const job = await getJobById(jobId);
  if (!job) {
    return NextResponse.json({ ok: false, error: "Job not found." }, { status: 404 });
  }
  if (!isJobOpen(job.status)) {
    return NextResponse.json(
      { ok: false, error: "This role is no longer accepting applications." },
      { status: 400 },
    );
  }

  // Application details from the dialog (length-capped to bound the store).
  const note = String(body?.note ?? "").trim().slice(0, 2000);
  const phone = String(body?.phone ?? "").trim().slice(0, 40);
  const link = String(body?.link ?? "").trim().slice(0, 300);
  const details = [
    note,
    link ? `Portfolio/CV: ${link}` : "",
    phone ? `Phone: ${phone}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  await applicationAdd(user.email, jobId, job.title, details);
  await notifyUser(user.email, {
    type: "application",
    title: "Application submitted",
    body: `You applied to ${job.title}.`,
  });
  await notifyAdmins({
    type: "new-application",
    title: "New job application",
    body: `${user.name} applied to ${job.title}.${details ? ` Note: ${details}` : ""}`,
  });
  return NextResponse.json({ ok: true, applied: true });
}

// Withdraw an application.
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const jobId = String(body?.jobId ?? "").trim();
  if (!jobId) {
    return NextResponse.json({ ok: false, error: "Missing job." }, { status: 400 });
  }
  await applicationRemove(session.email, jobId);
  return NextResponse.json({ ok: true, applied: false });
}
