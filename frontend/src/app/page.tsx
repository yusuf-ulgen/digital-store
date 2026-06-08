"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import type { LocalProduct } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import DisplayCards from "@/components/ui/display-cards";

/* ── Kategori Tanımları (Display Cards Yığını İçin) ── */
const CATEGORY_DISPLAY_CARDS = [
  {
    icon: <span className="text-xl">👨‍🍳</span>,
    title: "Şef Bıçağı",
    description: "Profesyonel mutfak ustaları için",
    date: "Koleksiyonu İncele →",
    href: "/products?cat=sef-bicagi",
    iconClassName: "text-amber-400",
    titleClassName: "text-amber-400",
    className:
      "[grid-area:stack] hover:-translate-y-[64px] hover:z-[100] z-[10]",
  },
  {
    icon: <span className="text-xl">🗡️</span>,
    title: "Bıçak Seti",
    description: "Komple set çözümleri",
    date: "Koleksiyonu İncele →",
    href: "/products?cat=bicak-seti",
    iconClassName: "text-sky-400",
    titleClassName: "text-sky-400",
    className:
      "[grid-area:stack] translate-x-[4px] sm:translate-x-[64px] translate-y-[3px] sm:translate-y-[18px] hover:-translate-y-[64px] hover:z-[100] z-[20]",
  },
  {
    icon: <span className="text-xl">⛺</span>,
    title: "Outdoor",
    description: "Doğa ve kamp bıçakları",
    date: "Koleksiyonu İncele →",
    href: "/products?cat=outdoor",
    iconClassName: "text-emerald-400",
    titleClassName: "text-emerald-400",
    className:
      "[grid-area:stack] translate-x-[8px] sm:translate-x-[128px] translate-y-[6px] sm:translate-y-[36px] hover:-translate-y-[64px] hover:z-[100] z-[30]",
  },
  {
    icon: <span className="text-xl">🥩</span>,
    title: "Kasap",
    description: "Et işleme uzmanları için",
    date: "Koleksiyonu İncele →",
    href: "/products?cat=kasap",
    iconClassName: "text-rose-400",
    titleClassName: "text-rose-400",
    className:
      "[grid-area:stack] translate-x-[12px] sm:translate-x-[192px] translate-y-[9px] sm:translate-y-[54px] hover:-translate-y-[64px] hover:z-[100] z-[40]",
  },
  {
    icon: <span className="text-xl">🪓</span>,
    title: "Satırlar",
    description: "Ağır iş kesim aletleri",
    date: "Koleksiyonu İncele →",
    href: "/products?cat=satirlar",
    iconClassName: "text-orange-400",
    titleClassName: "text-orange-400",
    className:
      "[grid-area:stack] translate-x-[16px] sm:translate-x-[256px] translate-y-[12px] sm:translate-y-[72px] hover:-translate-y-[64px] hover:z-[100] z-[50]",
  },
  {
    icon: <span className="text-xl">⚙️</span>,
    title: "Bileyici",
    description: "Keskinlik bakım araçları",
    date: "Koleksiyonu İncele →",
    href: "/products?cat=bileyici-masatlar",
    iconClassName: "text-violet-400",
    titleClassName: "text-violet-400",
    className:
      "[grid-area:stack] translate-x-[20px] sm:translate-x-[320px] translate-y-[15px] sm:translate-y-[90px] hover:-translate-y-[64px] hover:z-[100] z-[60]",
  },
  {
    icon: <span className="text-xl">🔪</span>,
    title: "Bıçaklar",
    description: "Genel kullanım bıçakları",
    date: "Koleksiyonu İncele →",
    href: "/products?cat=bicaklar",
    iconClassName: "text-cyan-400",
    titleClassName: "text-cyan-400",
    className:
      "[grid-area:stack] translate-x-[24px] sm:translate-x-[384px] translate-y-[18px] sm:translate-y-[108px] hover:-translate-y-[64px] hover:z-[100] z-[70]",
  },
];


export default function Home() {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const allItems: LocalProduct[] = [];
        querySnapshot.forEach((doc) => {
          allItems.push({ id: doc.id, ...doc.data() } as LocalProduct);
        });

        const inStockItems = allItems.filter(p => (p.stock ?? 0) > 0);
        const random12 = inStockItems.sort(() => 0.5 - Math.random()).slice(0, 12);
        setProducts(random12);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <>
      <div className="bg-white">

        {/* ── KATEGORİ KARTLARI (Display Cards tarzı) ── */}
        <section className="bg-stone-950 border-b border-white/5 pt-20 pb-4 sm:pt-20 sm:pb-4 overflow-hidden flex items-center justify-center select-none">
          <div className="relative w-full max-w-[32rem] sm:max-w-[44rem] h-[18rem] flex items-center justify-center -translate-x-[12px] sm:-translate-x-[192px] -translate-y-[12px] sm:-translate-y-[72px]">
            <DisplayCards cards={CATEGORY_DISPLAY_CARDS} />
          </div>
        </section>

        {/* ── ÜRÜN BÖLÜMÜ ──────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 py-10 sm:py-14">

          {/* Başlık + "Tümünü Gör" Butonu */}
          <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-1">
                Öne Çıkanlar
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-950">
                Sizin İçin Seçtiklerimiz
              </h2>
            </div>

            {/* "Tümünü Gör" — Düzgün buton */}
            <Link
              href="/products"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-950 hover:text-white hover:border-stone-950 transition-all group"
            >
              <span className="hidden sm:inline">Tümünü Gör</span>
              <span className="sm:hidden">Tümü</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Ürün Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-stone-100 rounded-2xl aspect-[3/4]"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-stone-400">
              <p className="text-lg font-medium mb-2">Stokta ürün bulunmamaktadır.</p>
              <p className="text-sm">Yakında yeni ürünler eklenecek.</p>
            </div>
          )}
        </section>

      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}