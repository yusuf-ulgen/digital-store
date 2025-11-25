// src/app/layout.tsx
import "@/app/globals.css";
import "@/styles/admin.css";
import type { Metadata } from "next";
import Providers from "./providers";
import ClientShell from "@/components/ClientShell"; // yeni client kabuk
import ChatWidget from "@/app/components/chat/ChatWidget";

export const metadata: Metadata = {
  title: "Ülgen Paslanmaz",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-stone-50 text-stone-800">
        <Providers>
          {/* Sayfanın geri kalanı */}
          <ClientShell>{children}</ClientShell>
          
          {/* 2. ChatWidget'ı BURAYA EKLE (ClientShell'in dışına, en alta) */}
          <ChatWidget />
          
        </Providers>
      </body>
    </html>
  );
}
