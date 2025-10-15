// src/app/layout.tsx
import "@/app/globals.css";
import "@/styles/admin.css";
import type { Metadata } from "next";
import Providers from "./providers";
import ClientShell from "@/components/ClientShell"; // yeni client kabuk

export const metadata: Metadata = {
  title: "Ülgen Paslanmaz",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-stone-50 text-stone-800">
        <Providers>
          <ClientShell>{children}</ClientShell>
        </Providers>
      </body>
    </html>
  );
}
