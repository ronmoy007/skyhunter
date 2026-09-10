import { ChatThread } from "@/components/ChatThread";

export const dynamic = "force-dynamic";

// Auth is enforced by the messages layout; this just renders the thread pane.
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChatThread conversationId={id} />;
}
