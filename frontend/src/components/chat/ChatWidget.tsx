'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Basit ID üreteci
const generateId = () => Math.random().toString(36).substring(7);

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Yeni API: input/handleInputChange yok, kendi state'imizi tutacağız
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

  // --- AYARLAR ---
  const currentCat = searchParams.get('cat') ?? 'bicaklar';
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

  const goToCategory = (slug: string) => {
    if (isProductsPage && currentCat === slug) return false;
    router.push(`/products?cat=${slug}`);
    return true;
  };

  // --- 1. OTOMATİK ASİSTAN MESAJI ---
  const sendAutomatedMessage = (text: string) => {
    const lastTwo = messages.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every((m: any) => m.role === 'assistant')) {
      return;
    }

    const newMessage = {
      id: generateId(),
      role: 'assistant',
      // yeni tip aslında parts kullanıyor ama biz content de tutuyoruz
      content: text,
      parts: [{ type: 'text', text }],
    } as any;

    setMessages((prev: any[]) => [...prev, newMessage]);
  };

  // --- 2. 10 SANİYE SONRA MERHABA ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasGreeted && messages.length === 0) {
        setIsOpen(true);
        const text =
          "Merhaba! 👋 Ülgen Paslanmaz'a hoş geldiniz. Size özel bıçaklarımız hakkında yardımcı olabilir miyim? Ne tür bir ürün arıyorsunuz?";
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

  // Resize Handler'lar
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

  // --- 3. KULLANICI MESAJ GÖNDERME ---
  const handleSend = async () => {
    const value = localInput.trim();
    if (!value || isLoading) return;

    const lower = value.toLocaleLowerCase('tr');
    let followUpQuestion = '';

    // Yönlendirme Mantığı
    if (lower.includes('şef bıç') || lower.includes('sef bic')) {
      goToCategory('sef-bicagi');
      followUpQuestion =
        'Sizi Şef Bıçakları reyonumuza aldım. 🔪 Profesyonel bir kullanım için mi bakıyorsunuz yoksa ev kullanımı için mi?';
    } else if (
      lower.includes('kasap') ||
      lower.includes('satır') ||
      lower.includes('satir')
    ) {
      goToCategory('kasap');
      followUpQuestion =
        'Kasap reyonuna yönlendirdim. Ağır hizmet tipi satır mı yoksa sıyırma bıçağı mı arıyorsunuz?';
    } else if (lower.includes('masat') || lower.includes('bileyici')) {
      goToCategory('bileyici-masatlar');
      followUpQuestion =
        'Bileyici bölümündeyiz. Bıçaklarınızın şu anki durumu nasıl, çok mu köreldiler?';
    } else if (lower.includes('bıçak') || lower.includes('mutfak')) {
      goToCategory('bicaklar');
    }

    // Filtreleme
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

    // Kullanıcı mesajını AI'ye gönder
    await sendMessage({ text: value });
    setLocalInput(''); // input'u temizle

    // Takip sorusu
    if (followUpQuestion) {
      setTimeout(() => {
        const followUpMsg = {
          id: generateId(),
          role: 'assistant',
          content: followUpQuestion,
          parts: [{ type: 'text', text: followUpQuestion }],
        } as any;

        setMessages((prev: any[]) => [...prev, followUpMsg]);
      }, 4000);
    }
  };

  // Enter tuşu
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full px-4 py-2 shadow-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition flex items-center gap-2"
        >
          <span>Yardıma ihtiyacın var mı?</span>
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
              // hem content hem parts destekleyelim
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
