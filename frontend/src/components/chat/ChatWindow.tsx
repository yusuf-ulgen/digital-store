"use client";

import {
  useState,
  useRef,
  useEffect,
} from "react";
import { useChat } from "@ai-sdk/react";
import { PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

type Props = {
  onClose: () => void;
};

type ChatState = "form" | "chat";

export default function ChatWindow({ onClose }: Props) {
  const [view, setView] = useState<ChatState>("form");
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [input, setInput] = useState("");

  const router = useRouter();

  const { messages, status, sendMessage } = useChat({
    api: "/api/chat",
  });

  const isLoading = status === "submitted" || status === "streaming";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, view]);

  // --- AI Yönlendirme Dinleyicisi ---
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role === 'assistant' && lastMessage.toolInvocations) {
      lastMessage.toolInvocations.forEach((toolInvocation: any) => {
        // AI SDK v4/v5'te toolInvocation yapısı:
        // categorySlug tool'dan geliyorsa:
        if (toolInvocation.toolName === 'goToCategoryPage') {
          const slug = toolInvocation.args.categorySlug;
          if (slug) {
            router.push(`/products?cat=${slug}`);
          }
        }

        if (toolInvocation.toolName === 'goToProductPage') {
          const pid = toolInvocation.args.productId;
          if (pid) {
            router.push(`/products/${pid}`);
          }
        }
      });
    }
  }, [messages, router]);

  const handleStartChat = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userData.name || !userData.email) return;
    setView("chat");
  };

  const handleSendMessage = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // NOT: Eski anahtar kelime bazlı yönlendirme kaldırıldı.
    // Redirection artık AI (tools) tarafından kontrol ediliyor.

    await sendMessage(
      { text: trimmed },
      {
        body: {
          userName: userData.name,
        },
      }
    );

    setInput('');
  };

  // Mesaj içeriğini render eden fonksiyon
  const renderMessageContent = (message: any) => {
    if (typeof message.content === "string") {
      return message.content;
    }

    if (Array.isArray(message.parts)) {
      return message.parts
        .map((part: any) => {
          if (part?.type === "text" && typeof part.text === "string") {
            return part.text;
          }
          if (part?.type === "text-delta" && typeof part.textDelta === "string") {
            return part.textDelta;
          }
          return "";
        })
        .join("");
    }

    return "";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (view === "chat" && !isLoading && input.trim()) {
        handleSendMessage(e);
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* --- HEADER --- */}
      <div className="relative flex h-24 items-center bg-stone-100 px-6 pt-4">
        {view === "chat" && (
          <button
            onClick={() => setView("form")}
            className="absolute left-4 top-4 text-gray-500 hover:text-gray-800"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        )}

        <div className="absolute -bottom-8 left-1/2 flex h-20 w-[90%] -translate-x-1/2 items-center gap-3 rounded-xl bg-white px-4 shadow-md">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white">
            <span className="text-xl font-bold">Ü</span>
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">ChatBot</h3>
            <p className="text-xs text-gray-500">Destek Asistanı</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <span className="text-2xl font-light">&times;</span>
        </button>
      </div>

      {/* --- İÇERİK --- */}
      <div className="flex flex-1 flex-col bg-stone-50 pt-10">
        {/* FORM EKRANI */}
        {view === "form" && (
          <div className="flex h-full flex-col px-8 py-4">
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Hoş geldiniz! Lütfen sohbete başlamadan önce aşağıdaki formu doldurunuz.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Ad: <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  E-posta: <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                />
              </div>

              <button
                onClick={handleStartChat}
                className="mt-4 w-full rounded-md bg-orange-500 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-orange-600"
              >
                Şimdi konuşmaya başlayın
              </button>
            </div>

            <div className="mt-auto pb-4 text-center">
              <p className="flex items-center justify-center gap-1 text-xs text-gray-400">
                Powered by <span className="font-bold text-orange-500">LiveChat</span>
              </p>
            </div>
          </div>
        )}

        {/* CHAT EKRANI */}
        {view === "chat" && (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-gray-200">
              {/* Statik karşılama mesajı */}
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-none border border-gray-100 bg-white px-4 py-2.5 text-sm shadow-sm text-gray-800">
                  Merhaba {userData.name || "misafir"}! 👋 Ben Ülgen Paslanmaz
                  yapay zeka asistanıyım. Size ürünlerimiz hakkında nasıl yardımcı
                  olabilirim?
                </div>
              </div>

              {/* Mesajları render et */}
              {messages.map((m: any) => {
                const content = renderMessageContent(m);

                if (!content || content.trim() === "") {
                  return null;
                }

                return (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? "rounded-br-none bg-orange-500 text-white"
                          : "rounded-bl-none border border-gray-100 bg-white text-gray-800"
                      }`}
                    >
                      {content}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-none border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 bg-white p-3">
              <div className="relative flex items-center">
                <input
                  className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-4 pr-12 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Mesajınızı yazın..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 rounded-full bg-orange-500 p-1.5 text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 text-center">
                <p className="text-[10px] text-gray-400">
                  AI Asistan bazen hatalı bilgi verebilir.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
