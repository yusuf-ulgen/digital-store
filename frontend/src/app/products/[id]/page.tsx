"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { 
  TruckIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  MinusIcon, 
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline";
import { useCart } from "@/lib/cart";
import { ALL_PRODUCTS } from "@/lib/mock-data"; 

// Accordion Bileşeni
function AccordionItem({ title, isOpen, onClick, children }: { title: string, isOpen: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200">
      <button
        className="flex w-full items-center justify-between py-4 text-left font-medium text-gray-900 focus:outline-none"
        onClick={onClick}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-gray-600 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  // Ürünü buluyoruz. mock-data'daki tip güncellendiği için yeni alanlar (shortDescription vs) burada erişilebilir olacak.
  const product = ALL_PRODUCTS.find((p) => p.id === id);

  const { add, items } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [customName, setCustomName] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("description");

  if (!product) return notFound();

  // --- STOK MANTIĞI ---
  const stock = product.stock ?? 0;
  const cartItem = items.find(i => i.id === product.id);
  const qtyInCart = cartItem ? cartItem.qty : 0;
  const remainingStock = Math.max(0, stock - qtyInCart);
  const isOutOfStock = stock === 0;
  const isMaxedOut = remainingStock === 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
        const newValue = prev + delta;
        return Math.max(1, Math.min(newValue, remainingStock));
    });
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleAddToCart = () => {
    if (isOutOfStock || isMaxedOut) return;
    
    if (quantity > remainingStock) {
        alert(`Stokta sadece ${remainingStock} adet daha ürün kaldı.`);
        setQuantity(remainingStock);
        return;
    }

    add({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl || "",
    }, quantity);
    
    setQuantity(1);
    alert(`${quantity} adet ${product.title} sepete eklendi!`);
  };

  const displayQuantity = isMaxedOut ? 0 : quantity;

  // --- VARSAYILAN DEĞERLER (Mock Data boşsa bunlar görünür) ---
  const defaultShortDesc = `${product.title}, mutfağınızdaki en büyük yardımcınız olmaya aday. Ülgen Paslanmaz kalitesiyle üretilmiştir.`;
  
  const defaultFeatures = [
    "Profesyonel el işçiliği",
    "Yüksek karbonlu paslanmaz çelik",
    "Ergonomik sap tasarımı",
    "Uzun ömürlü keskinlik"
  ];

  const defaultUsage = "Bıçağınızı sadece amacına uygun olarak (kesme, doğrama) kullanınız. Dondurulmuş gıdalar veya kemik gibi sert cisimlerde kullanmayınız.";
  const defaultCare = "Bulaşık makinesinde yıkanması tavsiye edilmez. Ilık su ve sünger ile elde yıkayıp hemen kurulayınız.";

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <Link href={`/products?cat=${product.category}`} className="hover:text-gray-900 capitalize">
            {(product.category || "").replace("-", " ")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium truncate">{product.title}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          
          {/* Görsel */}
          <div className="product-image-container relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
            <Image
              src={product.imageUrl || "/placeholder.png"}
              alt={product.title}
              fill
              className="object-contain object-center p-4" 
              priority
            />
            {isOutOfStock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                  <span className="rounded-full bg-gray-800 px-6 py-2 text-lg font-medium text-white shadow-lg">
                    STOKTA YOK
                  </span>
                </div>
            )}
          </div>

          {/* Detaylar */}
          <div className="mt-8 lg:mt-0">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{product.title}</h1>
            
            {/* --- DİNAMİK KISA AÇIKLAMA --- */}
            <div className="mt-4 prose prose-sm text-gray-500">
              <p>
                {/* Eğer data'da shortDescription varsa onu, yoksa varsayılanı göster */}
                {product.shortDescription || defaultShortDesc}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-3xl font-bold tracking-tight text-gray-900">
                {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>

            {/* İsim Yazdırma */}
            <div className="mt-8">
              <label htmlFor="custom-name" className="block text-sm font-medium text-gray-700">
                Bıçak Üzerine Yazılacak İsim (Opsiyonel)
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="custom-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  disabled={isOutOfStock || isMaxedOut}
                  className="block w-full rounded-md border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="İsim yazınız..."
                />
              </div>
            </div>

            {/* Miktar ve Buton */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <span className="mr-3 text-sm font-medium text-gray-700">Miktar:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled={displayQuantity <= 1 || isOutOfStock || isMaxedOut}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-gray-900 font-medium w-12 text-center">
                    {displayQuantity}
                  </span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled={displayQuantity >= remainingStock || isOutOfStock || isMaxedOut}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isMaxedOut}
                className={`flex-1 flex items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors
                  ${(isOutOfStock || isMaxedOut) ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : 'bg-stone-900 hover:bg-stone-800'}
                `}
              >
                {isOutOfStock 
                  ? 'STOKTA YOK' 
                  : isMaxedOut 
                    ? 'STOK LİMİTİ DOLDU' 
                    : 'SEPETE EKLE'}
              </button>
            </div>
            
            {!isOutOfStock && remainingStock < 5 && remainingStock > 0 && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                    Son {remainingStock} ürün kaldı!
                </p>
            )}

            {/* İkonlar (Kargo vb.) */}
            <div className="mt-8 space-y-4 border-t border-gray-200 pt-8">
              <div className="flex items-center gap-3">
                <TruckIcon className="h-6 w-6 text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-600">Aynı gün kargo</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="h-6 w-6 text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-600">Ücretsiz Kargo</span>
              </div>
              <div className="flex items-center gap-3">
                <SparklesIcon className="h-6 w-6 text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-600">Orijinal Ülgen Paslanmaz</span>
              </div>
            </div>

            {/* --- DİNAMİK ACCORDION BÖLÜMÜ --- */}
            <div className="mt-8 border-t border-gray-200">
              
              {/* 1. Ürün Açıklaması & Özellikler */}
              <AccordionItem 
                title="Ürün Açıklaması" 
                isOpen={openSection === 'description'} 
                onClick={() => toggleSection('description')}
              >
                <div className="space-y-4">
                    {/* Uzun açıklama varsa göster */}
                    {product.longDescription && (
                        <p>{product.longDescription}</p>
                    )}

                    {/* Özellikler listesi varsa göster, yoksa varsayılanı göster */}
                    <ul className="list-disc pl-5 space-y-1">
                      {(product.features && product.features.length > 0 
                          ? product.features 
                          : defaultFeatures
                      ).map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                </div>
              </AccordionItem>

              {/* 2. Kullanım Talimatı */}
              <AccordionItem 
                title="Kullanım Talimatı" 
                isOpen={openSection === 'usage'} 
                onClick={() => toggleSection('usage')}
              >
                <p>{product.usage || defaultUsage}</p>
              </AccordionItem>

              {/* 3. Temizleme */}
              <AccordionItem 
                title="Temizleme" 
                isOpen={openSection === 'cleaning'} 
                onClick={() => toggleSection('cleaning')}
              >
                <p>{product.care || defaultCare}</p>
              </AccordionItem>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}