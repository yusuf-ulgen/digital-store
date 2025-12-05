"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
// Firebase importları
import { db } from "@/lib/firebase"; 
import { collection, getDocs, query, orderBy } from "firebase/firestore";
// Tip ve Bileşen
import ProductCard from "@/components/ProductCard";
import type { LocalProduct } from "@/lib/mock-data";

export default function Home() {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Veritabanından Stokta Olan Rastgele Ürünleri Çek
  useEffect(() => {
    async function fetchProducts() {
      try {
        // Tüm ürünleri tarihe göre çekiyoruz
        const productsRef = collection(db, "products");
        const q = query(productsRef, orderBy("createdAt", "desc"));
        
        const querySnapshot = await getDocs(q);
        
        const allItems: LocalProduct[] = [];
        querySnapshot.forEach((doc) => {
          allItems.push({ id: doc.id, ...doc.data() } as LocalProduct);
        });

        // 1. ADIM: Sadece stoğu 0'dan büyük olanları filtrele
        const inStockItems = allItems.filter(p => (p.stock ?? 0) > 0);

        // 2. ADIM: Kalanları rastgele karıştır ve ilk 12 tanesini al
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
    <main className="bg-white">
      {/* --- ÜRÜN LİSTESİ BÖLÜMÜ --- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        
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

        {loading ? (
           // Yükleme sırasında iskelet görünüm
           <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
             {[1,2,3,4].map(i => (
               <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="py-20 text-center text-gray-500">
             Şu an stokta ürün bulunmamaktadır.
          </div>
        )}
      </section>
    </main>
  );
}