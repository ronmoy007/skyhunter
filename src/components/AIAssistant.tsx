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
  const [error, setError] = useState("");
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

    setError("");

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
      console.log("Sending message. Total messages:", updatedMessages.length);

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

      console.log("API response status:", response.status);

      const data = await response.json();
      console.log("API response data:", data);

      if (!response.ok || data.error) {
        const errorMsg = data.error || `HTTP ${response.status}: Failed to get response`;
        throw new Error(errorMsg);
      }

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
      } else {
        throw new Error("No response message received from API");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMsg);
      console.error("Full error:", err);
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
    setError("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-2xl flex items-center justify-center z-40 transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Open AI Assistant"
        title="AI Assistant"
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
          </svg>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="ai-chat-widget fixed bottom-24 right-6 w-96 max-w-[calc(100vw-1.5rem)] h-[600px] max-h-[80vh] rounded-3xl shadow-2xl border flex flex-col z-40 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header - Gradient Background */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">SkyHunter AI</h3>
                <p className="text-xs opacity-90">Always here to help</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNewChat}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                title="New chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="ai-chat-messages flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent hover:scrollbar-thumb-blue-500">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-center px-2">
                <div className="space-y-6">
                  <div className="ai-chat-welcome">
                    <p className="font-bold text-2xl mb-3">Welcome to SkyHunter AI</p>
                    <p className="text-sm max-w-sm leading-relaxed mx-auto opacity-75">
                      Hi! I'm your AI assistant. Ask me anything about our services, portfolio, pricing, or how we can help with your next project.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto text-xs">
                    <div className="p-2 rounded-lg bg-blue-50 text-gray-700 dark:text-gray-300 dark:bg-blue-900/20">
                      💡 Ask about our services
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 text-gray-700 dark:text-gray-300 dark:bg-blue-900/20">
                      🎯 Our portfolio & case studies
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 text-gray-700 dark:text-gray-300 dark:bg-blue-900/20">
                      💰 Pricing & timelines
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 text-gray-700 dark:text-gray-300 dark:bg-blue-900/20">
                      🚀 Get started today
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-700 dark:text-red-400 flex gap-2 items-start">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <p className="flex-1 leading-relaxed">{error}</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom duration-300`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-sm rounded-3xl px-5 py-3.5 shadow-sm ${
                    message.role === "user"
                      ? "ai-chat-message-user rounded-tr-none shadow-md"
                      : "ai-chat-message-assistant rounded-tl-none border"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
                    {message.content}
                  </p>

                  {message.role === "assistant" && (
                    <div className="mt-3 flex gap-2 items-center pt-3 border-t border-gray-200 dark:border-slate-600">
                      <button
                        onClick={() =>
                          handleFeedback(message.id, "helpful")
                        }
                        className={`text-base px-2.5 py-1.5 rounded-lg transition-all ${
                          message.feedback === "helpful"
                            ? "bg-green-100 dark:bg-green-900/30 scale-110"
                            : "hover:bg-gray-100 dark:hover:bg-slate-600"
                        }`}
                        title="Helpful"
                      >
                        👍
                      </button>
                      <button
                        onClick={() =>
                          handleFeedback(message.id, "not-helpful")
                        }
                        className={`text-base px-2.5 py-1.5 rounded-lg transition-all ${
                          message.feedback === "not-helpful"
                            ? "bg-red-100 dark:bg-red-900/30 scale-110"
                            : "hover:bg-gray-100 dark:hover:bg-slate-600"
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
              <div className="flex justify-start gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white text-sm">
                  AI
                </div>
                <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="ai-chat-footer border-t p-4 rounded-b-3xl">
            <div className="flex gap-2.5">
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
                className="ai-chat-input flex-1 px-5 py-3 rounded-full border-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm transition-all font-medium"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.6563168,11.6889879 L4.13399899,1.16865669 C3.34915502,0.9115592 2.40734225,1.0274986 1.77946707,1.4987821 C0.994623095,2.1272332 0.837654306,3.21659117 1.15159189,3.99574932 L3.03521743,10.4367423 C3.03521743,10.5539485 3.19218622,10.7110458 3.50612381,10.7110458 L16.6915026,11.4965327 C16.6915026,11.4965327 17.1624089,11.4965327 17.1624089,11.0042187 L17.1624089,12.0034722 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                </svg>
              </button>
            </div>
            </div>
        </div>
      )}
    </>
  );
}
