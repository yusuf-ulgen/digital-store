// src/app/ClientLayoutShell.tsx
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/chat/ChatWidget';

export default function ClientLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // /admin ile başlayan tüm sayfalarda header/footer/chat gizlensin
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}

      <main className="flex-1">
        {children}
      </main>

      {!isAdmin && (
        <>
          <Footer />
          <ChatWidget />
        </>
      )}
    </>
  );
}
