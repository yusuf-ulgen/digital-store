'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

const generateId = () => Math.random().toString(36).substring(7);

// /products?cat=... formatındaki relative URL'leri yakala
const NAV_URL_REGEX = /\/products(?:\?cat=[a-z0-9-]+|\/[a-zA-Z0-9_-]+)/;

function extractNavUrl(text: string): string | null {
  const match = text.match(NAV_URL_REGEX);
  return match ? match[0] : null;
}

function getMessageText(m: any): string {
  if (m.parts && Array.isArray(m.parts)) {
    const text = m.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text ?? '')
      .join('');
    if (text) return text;
  }
  if (typeof m.content === 'string') return m.content;
  if (Array.isArray(m.content)) {
    return m.content.map((c: any) => c.text ?? '').join('');
  }
  return '';
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigatedIds = useRef<Set<string>>(new Set());

  const {
    messages,
    sendMessage,
    setMessages,
    status,
  } = useChat({
    api: '/api/chat',
    onError: (e: unknown) => {
      console.error('Chat error:', e);
      setMessages((prev: any) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: 'Bağlantı veya API anahtarı hatası oluştu. Lütfen tekrar deneyin. ⚠️',
        },
      ]);
    },
  } as any);

  const [localInput, setLocalInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';
  const [hasGreeted, setHasGreeted] = useState(false);

  // --- Otomatik Kaydırma ---
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // --- URL Tespiti → Otomatik Yönlendirme ---
  // Stream bitince son asistan mesajında URL var mı kontrol et
  useEffect(() => {
    if (isLoading) return;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'assistant') return;
    if (navigatedIds.current.has(lastMsg.id)) return;

    const text = getMessageText(lastMsg);
    const navUrl = extractNavUrl(text);

    if (navUrl) {
      navigatedIds.current.add(lastMsg.id);
      console.log('🔀 Auto-navigating to:', navUrl);
      const timer = setTimeout(() => {
        router.push(navUrl);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, messages]);

  // Settings
  const defaultSize = { width: 340, height: 420 };
  const [size, setSize] = useState(defaultSize);
  const minSize = defaultSize;
  const maxSize = { width: defaultSize.width * 2, height: defaultSize.height * 2 };

  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef({
    startX: 0,
    startY: 0,
    startWidth: defaultSize.width,
    startHeight: defaultSize.height,
  });

  // --- Otomatik Selamlama ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasGreeted && messages.length === 0) {
        setIsOpen(true);
        setMessages([{
          id: generateId(),
          role: 'assistant',
          content: "Merhaba! 👋 Ülgen Paslanmaz'a hoş geldiniz. Size özel bıçaklarımız hakkında yardımcı olabilir miyim?",
        } as any]);
        setHasGreeted(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [hasGreeted, messages.length, setMessages]);

  // --- Resize ---
  function handleResizeMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
  }

  useEffect(() => {
    if (!isResizing) return;
    function onMouseMove(e: MouseEvent) {
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      setSize(() => {
        const newWidth = Math.min(maxSize.width, Math.max(minSize.width, resizeRef.current.startWidth - dx));
        const newHeight = Math.min(maxSize.height, Math.max(minSize.height, resizeRef.current.startHeight - dy));
        return { width: newWidth, height: newHeight };
      });
    }
    function onMouseUp() { setIsResizing(false); }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, maxSize, minSize]);

  const handleSend = () => {
    const value = localInput.trim();
    if (!value || isLoading) return;
    setLocalInput('');
    sendMessage({ text: value });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full px-4 py-2 shadow-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition flex items-center gap-2"
        >
          <span>Yardım</span>
          {!hasGreeted && (
            <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
          )}
        </button>
      )}

      {isOpen && (
        <div
          className="bg-white shadow-xl rounded-xl border border-gray-200 flex flex-col overflow-hidden relative"
          style={{ width: size.width, height: size.height }}
        >
          {/* Resize Tutamacı */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute top-0 left-0 w-4 h-4 z-50 cursor-nwse-resize flex items-start justify-start pl-0.5 pt-0.5"
          >
            <div className="w-2.5 h-2.5 border-l-2 border-t-2 border-orange-400/70 rounded-tl-sm hover:border-orange-600" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-orange-500 text-white text-sm font-semibold pl-6">
            <span>Ülgen Asistan</span>
            <button onClick={() => setIsOpen(false)} className="text-xs opacity-80 hover:opacity-100">
              Kapat
            </button>
          </div>

          {/* Mesaj Alanı */}
          <div className="flex-1 px-3 py-2 overflow-y-auto bg-gray-50 text-sm space-y-2">
            {messages.map((m: any, idx: number) => {
              const text = getMessageText(m);
              if (!text) return null;

              return (
                <div
                  key={m.id ?? idx}
                  className={`max-w-[90%] rounded-lg px-3 py-2 ${
                    m.role === 'user'
                      ? 'ml-auto bg-orange-500 text-white'
                      : 'mr-auto bg-white border border-gray-200 text-gray-900 shadow-sm'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="text-[10px] text-orange-600 font-bold mb-1">Ülgen Asistan</div>
                  )}
                  {m.role === 'assistant' ? (
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => {
                            const cleanHref = (href ?? '#').replace(/https?:\/\/localhost:\d+/, '');
                            const isNav = cleanHref.startsWith('/products');
                            return (
                              <a
                                href={cleanHref}
                                onClick={(e) => {
                                  if (isNav) {
                                    e.preventDefault();
                                    router.push(cleanHref);
                                  }
                                }}
                                className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded hover:bg-orange-100 transition cursor-pointer"
                              >
                                {children}
                              </a>
                            );
                          },
                          p: ({ children }) => <p className="my-0.5">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside my-1 space-y-0.5">{children}</ul>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-stone-800">{children}</strong>,
                        }}
                      >
                        {text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span>{text}</span>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="mr-auto bg-white border border-gray-200 text-gray-500 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:300ms]" />
                </span>
                <span>Yazıyor...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 px-2 py-2 bg-white flex gap-1">
            <input
              value={localInput}
              onChange={e => setLocalInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Mesaj yaz..."
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !localInput.trim()}
              type="button"
              className="text-sm px-3 py-1 rounded-md bg-orange-500 text-white disabled:opacity-60 hover:bg-orange-600 transition"
            >
              Gönder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}