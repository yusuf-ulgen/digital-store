import "@/app/globals.css";
import "@/styles/admin.css";
import type { Metadata } from "next";
import ToastProvider from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
  title: "Ülgen Paslanmaz",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
