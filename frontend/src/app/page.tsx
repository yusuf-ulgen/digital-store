"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import type { LocalProduct } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

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

        {/* ── HERO BANNER ─────────────────────────────── */}
        <section className="bg-stone-950 text-white border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-block px-2 py-1 bg-white/10 rounded text-[9px] font-bold uppercase tracking-widest text-stone-300">
                Profesyonel Kalite
              </span>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black leading-none tracking-tight m-0">
                Ustalıkla Dövülen <span className="text-stone-300">Bıçaklar</span>
              </h1>
            </div>
            
            <div className="flex flex-shrink-0 items-center gap-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-stone-950 font-bold text-[11px] sm:text-xs rounded-md hover:bg-stone-100 transition-colors"
              >
                Tüm Ürünleri Gör
                <ArrowRight size={12} />
              </Link>
              <Link
                href="/products?cat=bicak-seti"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/20 text-white font-semibold text-[11px] sm:text-xs rounded-md hover:bg-white/10 transition-colors"
              >
                Bıçak Setleri
              </Link>
            </div>
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

        {/* ── KATEGORİ KARTLARI ────────────────────────── */}
        <section className="bg-stone-50 border-t border-stone-100 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-1">Koleksiyonumuz</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-950">Kategoriler</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: "Şef Bıçağı", value: "sef-bicagi", emoji: "👨‍🍳" },
                { label: "Bıçak Seti", value: "bicak-seti", emoji: "🗡️" },
                { label: "Outdoor",    value: "outdoor",    emoji: "⛺" },
                { label: "Kasap",      value: "kasap",      emoji: "🥩" },
                { label: "Satırlar",   value: "satirlar",   emoji: "🪓" },
                { label: "Bileyici",   value: "bileyici-masatlar", emoji: "⚙️" },
                { label: "Bıçaklar",   value: "bicaklar",   emoji: "🔪" },
              ].map((cat) => (
                <Link
                  key={cat.value}
                  href={`/products?cat=${cat.value}`}
                  className="group flex flex-col items-center justify-center gap-2 p-4 sm:p-6 bg-white rounded-2xl border border-stone-100 hover:border-stone-950 hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <span className="text-2xl sm:text-3xl">{cat.emoji}</span>
                  <span className="text-xs sm:text-sm font-bold text-stone-700 group-hover:text-stone-950 transition-colors text-center">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}