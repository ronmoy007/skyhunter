"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  feedback?: "helpful" | "not-helpful" | null;
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string>("");

  useEffect(() => {
    const id = `chat_${Date.now()}`;
    setChatId(id);
    const saved = localStorage.getItem(`chat_${id}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveChatHistory = (msgs: Message[]) => {
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(msgs));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.message) {
        const assistantMessage: Message = {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: data.message,
          timestamp: Date.now(),
        };
        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        saveChatHistory(finalMessages);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (messageId: string, feedback: "helpful" | "not-helpful") => {
    const updated = messages.map((m) =>
      m.id === messageId ? { ...m, feedback } : m
    );
    setMessages(updated);
    saveChatHistory(updated);
  };

  const handleExport = () => {
    const text = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", `chat_${chatId}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleNewChat = () => {
    const id = `chat_${Date.now()}`;
    setChatId(id);
    setMessages([]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-400 text-white shadow-lg flex items-center justify-center z-40 transition-all duration-200"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[600px] rounded-2xl shadow-2xl bg-white dark:bg-[#1a1a1a] border border-steel-line flex flex-col z-40">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-steel-line bg-blue-500 text-white rounded-t-2xl">
            <div>
              <h3 className="font-semibold">SkyHunter Assistant</h3>
              <p className="text-xs opacity-90">AI-powered support</p>
            </div>
            <button
              onClick={handleNewChat}
              className="p-2 hover:bg-blue-400 rounded-lg transition-colors"
              title="New chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <p className="text-mist font-semibold">Hi! 👋</p>
                  <p className="text-sm text-fog mt-2">
                    Ask me anything about SkyHunter's services, portfolio, or how we can help your project.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-abyss text-mist"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {message.role === "assistant" && (
                    <div className="mt-2 flex gap-2 items-center">
                      <button
                        onClick={() =>
                          handleFeedback(message.id, "helpful")
                        }
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          message.feedback === "helpful"
                            ? "bg-green-500/30 text-green-600"
                            : "hover:bg-black/10 text-gray-500"
                        }`}
                        title="Helpful"
                      >
                        👍
                      </button>
                      <button
                        onClick={() =>
                          handleFeedback(message.id, "not-helpful")
                        }
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          message.feedback === "not-helpful"
                            ? "bg-red-500/30 text-red-600"
                            : "hover:bg-black/10 text-gray-500"
                        }`}
                        title="Not helpful"
                      >
                        👎
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-abyss text-mist rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="border-t border-steel-line p-3 space-y-2">
            {messages.length > 0 && (
              <button
                onClick={handleExport}
                className="w-full text-xs text-blue-500 hover:text-blue-400 py-1 transition-colors"
              >
                ⬇️ Export Chat
              </button>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask anything..."
                className="flex-1 px-3 py-2 rounded-lg border border-steel-line bg-void text-mist placeholder-fog focus:outline-none focus:border-blue-500 text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7m0 0l-9 7 9 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
