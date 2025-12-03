"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
// Daha önce oluşturduğumuz ortak veri ve bileşenleri kullanıyoruz
import { ALL_PRODUCTS, type LocalProduct } from "@/lib/mock-data";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  // Rastgele ürünleri tutacak state
  const [randomProducts, setRandomProducts] = useState<LocalProduct[]>([]);

  // 1. EFFECT: Firebase Auth Kontrolü (Senin kodun)
  useEffect(() => {
    const checkUser = async () => {
      if (!auth.currentUser) {
        console.log("⚠️ Henüz login değil, token alınmadı.");
        return;
      }
      const token = await auth.currentUser.getIdToken(true);
      console.log("🔥 Token otomatik alındı:", token);
    };
    checkUser();
  }, []);

  // 2. EFFECT: Rastgele 12 Ürün Seçimi
  // "use client" olduğu için bu işlem useEffect içinde yapılmalı,
  // yoksa sunucu ve tarayıcı farklı sonuçlar üretir ve hata verir.
  useEffect(() => {
    const shuffled = [...ALL_PRODUCTS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 12);
    setRandomProducts(shuffled);
  }, []);

  return (
    <main className="bg-white">
      {/* --- HERO SECTION KALDIRILDI --- */}

      {/* --- ÜRÜN LİSTESİ BÖLÜMÜ --- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        {/* Başlık ve Link Alanı */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Sizin İçin Seçtiklerimiz
          </h2>
          <Link 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500" 
            href="/products"
          >
            Tümünü Gör &rarr;
          </Link>
        </div>

        {/* 4 Sütunlu Grid Yapısı */}
        {/* lg:grid-cols-4 sınıfı büyük ekranlarda 4 sütun oluşturur. */}
        {/* 12 ürün gösterildiğinde, 3 satır (4x3) düzeni oluşacaktır. */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {randomProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        
        {/* Yükleniyor durumu için boşluk kontrolü */}
        {randomProducts.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            Ürünler yükleniyor...
          </div>
        )}
      </section>
    </main>
  );
}