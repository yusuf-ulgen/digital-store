import "@/app/globals.css";

import type { Metadata } from "next";
import Providers from "./providers";
import ClientShell from "@/components/ClientShell"; 
import ChatWidget from "@/components/chat/ChatWidget";

export const metadata: Metadata = {
  title: "Ülgen Paslanmaz",
  description: "Profesyonel Bıçak ve Mutfak Ekipmanları",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-stone-50 text-stone-800 relative">
        <Providers>
          {/* Sayfanın mevcut içeriği */}
          <ClientShell>{children}</ClientShell>
          
          {/* 2. ChatWidget'ı BURAYA EKLE (En alta, body kapanmadan hemen önce) */}
          {/* Bu satır olmazsa buton asla görünmez! */}
          <ChatWidget />
          
        </Providers>
      </body>
    </html>
  );
}