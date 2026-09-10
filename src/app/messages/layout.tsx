import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ConversationList } from "@/components/ConversationList";
import { MessagesShell } from "@/components/MessagesShell";
import { ChatPresenceBeacon } from "@/components/ChatPresenceBeacon";

export const metadata: Metadata = { title: "Messages · SkyHunter" };
export const dynamic = "force-dynamic";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/signin?next=/messages");

  return (
    <>
      <ChatPresenceBeacon />
      <MessagesShell sidebar={<ConversationList />}>{children}</MessagesShell>
    </>
  );
}
