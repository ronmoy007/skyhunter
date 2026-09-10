export const dynamic = "force-dynamic";

// Right-pane placeholder shown on desktop when no conversation is open.
export default function MessagesIndex() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-blue-500">
          <path
            d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V6z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="mt-4 rounded-full bg-steel px-4 py-1.5 text-sm text-fog">
        Select a chat to start messaging
      </p>
    </div>
  );
}
