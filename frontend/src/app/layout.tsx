import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CartProvider } from "@/lib/cart";

export const metadata: Metadata = {
  title: "ULGEN Paslanmaz",
  description: "Kalitelinin adresi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <CartProvider>
        <Header />
        <main className="container-tight py-8">{children}</main>
        <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
