"use client";
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton'; 
import type { Product } from '@/lib/api/products-admin';

// Ürün kartının beklediği veri tipi
type ProductCardProps = {
  product: Product; 
};

/**
 * Ürün listeleme sayfalarındaki tek bir ürün kartı component'i
 */
export default function ProductCard({ product }: ProductCardProps) {
  const isInStock = (product.stock ?? 0) > 0;
  
  const productUrl = `/products/${product.category}/${product.id}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <Link href={productUrl} className="block">
        <div className="aspect-h-1 aspect-w-1 overflow-hidden bg-gray-100">
          <Image
            src={product.imageUrl || 'https://placehold.co/400x400/eeeeee/333333?text=Görsel+Yok'}
            alt={product.title}
            width={400}
            height={400}
            className="h-full w-full object-cover object-center transition-all duration-300 group-hover:scale-105"
            onError={(e) => e.currentTarget.src = 'https://placehold.co/400x400/eeeeee/333333?text=Görsel+Yüklenemedi'}
          />
          {!isInStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="rounded-full bg-gray-800 px-4 py-1.5 text-sm font-medium text-white">
                Stokta Yok
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
            {product.title}
          </h3>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </p>
          {/* İndirimli fiyat varsa buraya eklenebilir... */}
        </div>
      </Link>
      
      {/* Sepete Ekle Butonu */}
      <div className="mt-auto p-4 pt-0">
        
        {/* HATA BURADAYDI, DÜZELTİLDİ: 
            'product' objesi yerine özelliklerini tek tek gönderiyoruz.
            'isInStock' prop'u kaldırıldı (AddToCartButton bunu kendi hesaplıyor).
        */}
        <AddToCartButton 
          id={product.id}
          title={product.title}
          price={product.price}
          imageUrl={product.imageUrl || 'https://placehold.co/400x400/eeeeee/333333?text=Görsel+Yok'}
          stock={product.stock}
        />

        {/* Eğer AddToCartButton component'iniz yoksa, basit bir buton kullanabilirsiniz... */}
      </div>
    </div>
  );
}