'use client';

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";

export default function ChatDebugPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({
      api: "/api/chat",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg border border-stone-200">
        <h1 className="mb-4 text-lg font-bold text-stone-900">
          Chat Debug
        </h1>

        <div className="mb-4 flex h-80 flex-col space-y-2 overflow-y-auto border border-stone-200 rounded-lg p-2 text-sm">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-orange-500 text-white rounded-br-none"
                    : "bg-stone-100 text-stone-900 rounded-bl-none"
                }`}
              >
                {m.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <span key={i}>{part.text}</span>;
                  }
                  return null;
                })}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="text-xs text-stone-400">Yazıyor...</div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            sendMessage({ text: input });
            setInput("");
          }}
          className="flex gap-2"
        >
          <input
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Bir şey yaz..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Gönder
          </button>
        </form>
      </div>
    </div>
  );
}
