"use client";

import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton'; 
import { Heart, Maximize2, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/api/products-admin';

type ProductCardProps = {
  product: Product; 
};

export default function ProductCard({ product }: ProductCardProps) {
  const isInStock = (product.stock ?? 0) > 0;
  const productUrl = `/products/${product.id}`;

  return (
    <div className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 flex flex-col h-full">
      {/* Visual Area */}
      <div className="relative aspect-square overflow-hidden bg-white group-hover:bg-gray-50/50 transition-colors duration-500">
        <Link href={productUrl} className="block w-full h-full p-6">
          <Image
            src={product.imageUrl || 'https://placehold.co/400x400/eeeeee/333333?text=Görsel+Yok'}
            alt={product.title}
            fill 
            className="object-contain object-center p-4 transition-transform duration-700 group-hover:scale-110"
            onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x400/eeeeee/333333?text=Görsel+Yüklenemedi')}
          />
        </Link>
        
        {/* Badges */}
        {!isInStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-gray-900/90 px-4 py-1.5 text-[10px] font-bold text-white uppercase tracking-widest shadow-xl">
              Tükendi
            </span>
          </div>
        )}

        {/* Action Bar */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
           <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors border border-gray-50">
              <Heart size={18} />
           </button>
           <Link href={productUrl} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-50">
              <Maximize2 size={18} />
           </Link>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 border-t border-gray-50">
        <div className="mb-4">
          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 opacity-80">
            {product.category || "Hırvat Çeliği"}
          </div>
          <Link href={productUrl}>
            <h3 className="font-display font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 font-bold line-through tracking-tighter">
                {(product.price * 1.3).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
             </span>
             <span className="text-xl font-bold text-gray-900 tracking-tight">
               {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
             </span>
          </div>

          <div className="flex-shrink-0">
            <AddToCartButton 
              id={product.id}
              title={product.title}
              price={product.price}
              imageUrl={product.imageUrl || 'https://placehold.co/400x400/eeeeee/333333?text=Görsel+Yok'}
              stock={product.stock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}