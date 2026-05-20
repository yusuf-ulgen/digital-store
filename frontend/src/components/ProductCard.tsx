"use client";

import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton'; 
import { Heart, Maximize2 } from 'lucide-react';
import type { Product } from '@/lib/api/products-admin';

// Kategori slug → okunabilir Türkçe isim dönüşüm tablosu
const CATEGORY_LABELS: Record<string, string> = {
  "bicaklar":          "Bıçaklar",
  "bicak-seti":        "Bıçak Seti",
  "sef-bicagi":        "Şef Bıçağı",
  "outdoor":           "Outdoor",
  "kasap":             "Kasap Bıçağı",
  "satirlar":          "Satırlar",
  "bileyici-masatlar": "Bileyici & Masat",
  "bileyici-masat":    "Bileyici & Masat",
};

function getCategoryLabel(slug?: string): string {
  if (!slug) return "Genel";
  return CATEGORY_LABELS[slug.toLowerCase()] ?? slug;
}

type ProductCardProps = {
  product: Product; 
};

export default function ProductCard({ product }: ProductCardProps) {
  const isInStock = (product.stock ?? 0) > 0;
  const productUrl = `/products/${product.id}`;
  const categoryLabel = getCategoryLabel(product.category);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-400 hover:shadow-[0_12px_36px_rgba(0,0,0,0.09)] hover:-translate-y-1 flex flex-col h-full">
      {/* Visual Area */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 group-hover:bg-white transition-colors duration-500">
        <Link href={productUrl} className="block w-full h-full">
          <Image
            src={product.imageUrl || 'https://placehold.co/400x400/f3f4f6/6b7280?text=Görsel+Yok'}
            alt={product.title}
            fill 
            className="object-contain object-center p-4 transition-transform duration-700 group-hover:scale-105"
            onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x400/f3f4f6/6b7280?text=Görsel+Yüklenemedi')}
          />
        </Link>
        
        {/* Tükendi Overlay */}
        {!isInStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-stone-900/90 px-4 py-1.5 text-[10px] font-bold text-white uppercase tracking-widest shadow-xl">
              Tükendi
            </span>
          </div>
        )}

        {/* Action Bar — hover'da görünür */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
           <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-stone-900 hover:text-white transition-colors border border-stone-100">
              <Heart size={15} />
           </button>
           <Link href={productUrl} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-stone-900 hover:text-white transition-colors border border-stone-100">
              <Maximize2 size={15} />
           </Link>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 border-t border-gray-50">
        <div className="mb-3">
          {/* Kategori Etiketi — artık Türkçe */}
          <span className="inline-block text-[9px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-1">
            {categoryLabel}
          </span>
          <Link href={productUrl}>
            <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 group-hover:text-stone-600 transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="mt-auto">
          {/* Fiyat */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-[10px] text-stone-400 font-medium line-through">
              {(product.price * 1.3).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </span>
            <span className="text-lg font-bold text-stone-950 tracking-tight">
              {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </span>
          </div>

          {/* Sepete Ekle Butonu */}
          <AddToCartButton 
            id={product.id}
            title={product.title}
            price={product.price}
            imageUrl={product.imageUrl || 'https://placehold.co/400x400/f3f4f6/6b7280?text=Görsel+Yok'}
            stock={product.stock}
          />
        </div>
      </div>
    </div>
  );
}