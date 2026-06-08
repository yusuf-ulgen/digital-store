'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const generateId = () => Math.random().toString(36).substring(7);

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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
          content: 'Bağlantı veya API anahtarı hatası oluştu. Lütfen Gemini API anahtarınızı kontrol edip tekrar deneyin. ⚠️',
        },
      ]);
    },
  } as any);

  const [localInput, setLocalInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';
  const [hasGreeted, setHasGreeted] = useState(false);
  const processedToolCalls = useRef<Set<string>>(new Set());

  // Settings
  const defaultSize = { width: 320, height: 380 };
  const [size, setSize] = useState(defaultSize);
  const minSize = defaultSize;
  const maxSize = {
    width: defaultSize.width * 2,
    height: defaultSize.height * 2,
  };

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
        const text =
          "Merhaba! 👋 Ülgen Paslanmaz'a hoş geldiniz. Size özel bıçaklarımız hakkında yardımcı olabilir miyim?";
        const greetingMessage = {
          id: generateId(),
          role: 'assistant',
          content: text,
        } as any;

        setMessages([greetingMessage]);
        setHasGreeted(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [hasGreeted, messages.length, setMessages]);

  // --- AI Yönlendirme Dinleyicisi ---
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1] as any;

    if (lastMessage.role === 'assistant' && lastMessage.toolInvocations) {
      lastMessage.toolInvocations.forEach((toolInvocation: any) => {
        const toolCallId = toolInvocation.toolCallId;
        if (!toolCallId || processedToolCalls.current.has(toolCallId)) return;

        // Redirection tools
        if (toolInvocation.toolName === 'goToCategoryPage') {
          const slug = toolInvocation.args.categorySlug;
          if (slug) {
            processedToolCalls.current.add(toolCallId);
            router.push(`/products?cat=${slug}`);
          }
        }

        if (toolInvocation.toolName === 'goToProductPage') {
          const pid = toolInvocation.args.productId;
          if (pid) {
            processedToolCalls.current.add(toolCallId);
            router.push(`/products/${pid}`);
          }
        }
      });
    }
  }, [messages, router]);

  // --- Resize Mantığı ---
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
        let newWidth = resizeRef.current.startWidth - dx;
        let newHeight = resizeRef.current.startHeight - dy;
        newWidth = Math.min(maxSize.width, Math.max(minSize.width, newWidth));
        newHeight = Math.min(maxSize.height, Math.max(minSize.height, newHeight));
        return { width: newWidth, height: newHeight };
      });
    }
    function onMouseUp() {
      setIsResizing(false);
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, maxSize, minSize]);

  const handleSend = async () => {
    const value = localInput.trim();
    if (!value || isLoading) return;
    await sendMessage({ text: value });
    setLocalInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full px-4 py-2 shadow-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition flex items-center gap-2"
        >
          <span>Yardım</span>
          {!hasGreeted && (
            <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
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
            <div className="w-2.5 h-2.5 border-l-2 border-t-2 border-orange-400/70 rounded-tl-sm hover:border-orange-600"></div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-orange-500 text-white text-sm font-semibold pl-6">
            <span>Ülgen Asistan</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs opacity-80 hover:opacity-100"
            >
              Kapat
            </button>
          </div>

          {/* Mesaj Alanı */}
          <div className="flex-1 px-3 py-2 overflow-y-auto bg-gray-50 text-sm space-y-2">
            {messages.map((m: any, idx: number) => {
              const text =
                m.content ??
                m.parts?.map((p: any) => (p.type === 'text' ? p.text : '')).join('') ??
                '';

              if (!text && !m.toolInvocations) return null;

              return (
                <div
                  key={m.id ?? idx}
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    m.role === 'user'
                      ? 'ml-auto bg-orange-500 text-white'
                      : 'mr-auto bg-white border border-gray-200 text-gray-900 shadow-sm'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="text-[10px] text-orange-600 font-bold mb-0.5">
                      Ülgen Asistan
                    </div>
                  )}
                  {text}
                </div>
              );
            })}

            {isLoading && (
              <div className="mr-auto bg-white border border-gray-200 text-gray-500 text-xs px-2 py-1 rounded-lg">
                Yazıyor...
              </div>
            )}
          </div>

          {/* Input Alanı */}
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
              className="text-sm px-3 py-1 rounded-md bg-orange-500 text-white disabled:opacity-60"
            >
              Gönder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}