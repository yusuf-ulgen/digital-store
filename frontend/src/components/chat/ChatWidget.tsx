'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState, FormEvent } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, status, sendMessage } = useChat();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCat = searchParams.get('cat') ?? 'bicaklar';
  const isProductsPage = pathname === '/products';

  const defaultSize = { width: 320, height: 380 };
  const [size, setSize] = useState(defaultSize);

  const minSize = defaultSize;
  const maxSize = {
    width: defaultSize.width * 2,
    height: defaultSize.height * 2,
  };

  const [input, setInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';

  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef({
    startX: 0,
    startY: 0,
    startWidth: defaultSize.width,
    startHeight: defaultSize.height,
  });

  const goToCategory = (slug: string) => {
    if (isProductsPage && currentCat === slug) {
      return false;
    }
    router.push(`/products?cat=${slug}`);
    return true;
  };

  // Resize işlemi başladığında
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
        // --- DEĞİŞİKLİK 1: MATEMATİKSEL MANTIK ---
        // Köşe sol-üste taşındığı için;
        // Mouse sola giderse (negatif dx) genişlik artmalı -> Çıkarma işlemi
        // Mouse yukarı giderse (negatif dy) yükseklik artmalı -> Çıkarma işlemi
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
  }, [isResizing, maxSize.height, maxSize.width, minSize.height, minSize.width]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = input.trim();
    if (!value || isLoading) return;

    const lower = value.toLocaleLowerCase('tr');
    let handledRouting = false;

    if (
      lower.includes('şef bıç') ||
      lower.includes('sef bic')
    ) {
      handledRouting = goToCategory('sef-bicagi');
    }
    else if (
      lower.includes('kasap') ||
      lower.includes('satır') ||
      lower.includes('satir')
    ) {
      handledRouting = goToCategory('kasap');
    }
    else if (
      lower.includes('mutfak bıça') ||
      lower.includes('mutfak bic') ||
      (lower.includes('bıçak') && !lower.includes('şef') && !lower.includes('kasap'))
    ) {
      handledRouting = goToCategory('bicaklar');
    }
    else if (
      lower.includes('masat') ||
      lower.includes('bileyici') ||
      lower.includes('bileyle')
    ) {
      handledRouting = goToCategory('bileyici-masatlar');
    }

    if (isProductsPage) {
      const params = new URLSearchParams(searchParams.toString());

      if (
        lower.includes('stok') &&
        (lower.includes('olan') || lower.includes('var') || lower.includes('mevcut'))
      ) {
        params.set('stokta', 'stokta');
        router.push(`/products?${params.toString()}`);
        handledRouting = true;
      }

      if (
        lower.includes('en ucuz') ||
        lower.includes('ucuzdan')
      ) {
        params.set('sirala', 'fiyat-artan');
        router.push(`/products?${params.toString()}`);
        handledRouting = true;
      }

      if (
        lower.includes('en pahalı') ||
        lower.includes('en pahali') ||
        lower.includes('pahalıdan') ||
        lower.includes('pahalidan')
      ) {
        params.set('sirala', 'fiyat-azalan');
        router.push(`/products?${params.toString()}`);
        handledRouting = true;
      }
    }

    sendMessage({ text: value });
    setInput('');
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full px-4 py-2 shadow-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition"
        >
          Yardıma ihtiyacın var mı
        </button>
      )}

      {isOpen && (
        <div
          className="bg-white shadow-xl rounded-xl border border-gray-200 flex flex-col overflow-hidden relative"
          style={{ width: size.width, height: size.height }}
        >
          {/* --- DEĞİŞİKLİK 2: GÖRSEL KONUM --- */}
          {/* 🟧 Sol-üst köşede resize tutamacı */}
          {/* cursor-nwse-resize: KuzeyBatı-GüneyDoğu yönü */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute top-0 left-0 w-4 h-4 z-50 cursor-nwse-resize flex items-start justify-start pl-0.5 pt-0.5"
          >
             {/* Görsel olarak bir köşe çizgisi (Border ile) */}
             <div className="w-2.5 h-2.5 border-l-2 border-t-2 border-orange-400/70 rounded-tl-sm hover:border-orange-600"></div>
          </div>

          {/* Başlık */}
          <div className="flex items-center justify-between px-3 py-2 bg-orange-500 text-white text-sm font-semibold pl-6"> {/* pl-6 eklendi ki tutamaç başlığın üstüne binmesin */}
            <span>Ülgen Asistan</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs opacity-80 hover:opacity-100"
            >
              Kapat
            </button>
          </div>

          <div className="flex-1 px-3 py-2 overflow-y-auto bg-gray-50 text-sm space-y-2">
            {messages.length === 0 && (
              <p className="text-gray-500 text-xs">
                Merhaba. Ürünler, sipariş, kargo veya iade hakkında sorularını
                bana yazabilirsin.
              </p>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-lg px-2 py-1 ${
                  m.role === 'user'
                    ? 'ml-auto bg-orange-500 text-white'
                    : 'mr-auto bg-white border border-gray-200 text-gray-900'
                }`}
              >
                {m.parts
                  .filter((p) => p.type === 'text')
                  .map((p, i) => (
                    <div key={i}>{'text' in p ? p.text : null}</div>
                  ))}
              </div>
            ))}

            {isLoading && (
              <div className="mr-auto bg-white border border-gray-200 text-gray-500 text-xs px-2 py-1 rounded-lg">
                Yazıyor...
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 px-2 py-2 bg-white flex gap-1"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Mesaj yaz..."
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="text-sm px-3 py-1 rounded-md bg-orange-500 text-white disabled:opacity-60"
            >
              Gönder
            </button>
          </form>
        </div>
      )}
    </div>
  );
}