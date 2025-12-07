'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const generateId = () => Math.random().toString(36).substring(7);

export default function ChatWidget() {
  // -----------------------------------------------------------------------
  // 1. ADIM: TÜM HOOK'LAR BURADA TANIMLANMAK ZORUNDA (Sıralama Bozulamaz)
  // -----------------------------------------------------------------------
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    messages,
    sendMessage,
    setMessages,
    status,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: (e: unknown) => console.error('Chat error:', e),
  } as any) as any;

  const [localInput, setLocalInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';
  const [hasGreeted, setHasGreeted] = useState(false);

  // Ayarlar
  const isProductsPage = pathname === '/products';
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
          parts: [{ type: 'text', text }],
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
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role === 'assistant' && lastMessage.toolInvocations) {
      lastMessage.toolInvocations.forEach((toolInvocation: any) => {
        
        // Kategori Yönlendirmesi
        if (toolInvocation.toolName === 'goToCategoryPage') {
          const args = toolInvocation.args;
          const slug = args.categorySlug || args.slug;
          if (slug) {
             router.push(`/products?cat=${slug}`);
          }
        }

        // Ürün Yönlendirmesi
        if (toolInvocation.toolName === 'goToProductPage') {
          const args = toolInvocation.args;
          const pid = args.id || args.productId;
          if (pid) {
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

  // --- Mesaj Gönderme ---
  const handleSend = async () => {
    const value = localInput.trim();
    if (!value || isLoading) return;
    
    // AI ile çakışan manuel yönlendirmeleri kaldırdım.
    // Artık kararı tamamen AI (route.ts) verecek.

    const lower = value.toLocaleLowerCase('tr');

    // Filtreleme (Frontend tarafında kalabilir)
    if (isProductsPage) {
      const params = new URLSearchParams(searchParams.toString());
      let changed = false;
      if (lower.includes('stok') && (lower.includes('olan') || lower.includes('var'))) {
        params.set('stokta', 'stokta');
        changed = true;
      }
      if (lower.includes('en ucuz') || lower.includes('ucuzdan')) {
        params.set('sirala', 'fiyat-artan');
        changed = true;
      }
      if (lower.includes('en pahalı') || lower.includes('pahalıdan')) {
        params.set('sirala', 'fiyat-azalan');
        changed = true;
      }
      if (changed) {
        router.push(`/products?${params.toString()}`);
      }
    }

    await sendMessage({ text: value });
    setLocalInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // -----------------------------------------------------------------------
  // 2. ADIM: ADMIN KONTROLÜ BURADA YAPILIR (Hook'lardan Sonra)
  // -----------------------------------------------------------------------
  // Eğer url /admin ile başlıyorsa widget'ı render etme (null döndür).
  // Bu, React kurallarını bozmadan botu gizler.
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // -----------------------------------------------------------------------
  // 3. ADIM: ARAYÜZ (HTML)
  // -----------------------------------------------------------------------
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