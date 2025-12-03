"use client";

import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton'; 
import type { Product } from '@/lib/api/products-admin';

type ProductCardProps = {
  product: Product; 
};

export default function ProductCard({ product }: ProductCardProps) {
  const isInStock = (product.stock ?? 0) > 0;
  
  // DÜZELTME BURADA:
  // Eski Hali: const productUrl = `/products?cat=${product.category}&product_id=${product.id}`;
  // Yeni Hali: Dinamik ürün detay sayfasına yönlendiriyoruz.
  const productUrl = `/products/${product.id}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <Link href={productUrl} className="block">
        
        {/* GÖRSEL ALANI */}
        <div className="aspect-h-1 aspect-w-1 relative overflow-hidden bg-white h-64"> 
          <Image
            src={product.imageUrl || 'https://placehold.co/400x400/eeeeee/333333?text=Görsel+Yok'}
            alt={product.title}
            fill 
            className="object-contain object-center p-4 transition-all duration-300 group-hover:scale-105"
            onError={(e) => e.currentTarget.src = 'https://placehold.co/400x400/eeeeee/333333?text=Görsel+Yüklenemedi'}
          />
          
          {!isInStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <span className="rounded-full bg-gray-800 px-4 py-1.5 text-sm font-medium text-white">
                Stokta Yok
              </span>
            </div>
          )}
        </div>

        {/* ÜRÜN BİLGİLERİ */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-indigo-600">
            {product.title}
          </h3>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </p>
        </div>
      </Link>
      
      {/* SEPETE EKLE BUTONU */}
      <div className="mt-auto p-4 pt-0">
        <AddToCartButton 
          id={product.id}
          title={product.title}
          price={product.price}
          imageUrl={product.imageUrl || 'https://placehold.co/400x400/eeeeee/333333?text=Görsel+Yok'}
          stock={product.stock}
        />
      </div>
    </div>
  );
}