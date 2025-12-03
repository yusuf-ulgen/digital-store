"use client";

import { useState } from "react";
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
// YENİ: Ortak veriyi import ediyoruz
import { ALL_PRODUCTS } from "@/lib/mock-data"; 

// --- AKORDEON BİLEŞENİ ---
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
  // useParams hook'u ile URL'deki id'yi alıyoruz (Next.js 13+ client component)
  const params = useParams();
  const id = params?.id as string;

  // YENİ: Gerçek veriyi id'ye göre buluyoruz
  const product = ALL_PRODUCTS.find((p) => p.id === id);

  const { add } = useCart();

  // State'ler
  const [quantity, setQuantity] = useState(1);
  const [customName, setCustomName] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("description");

  // Ürün bulunamazsa 404 sayfasına yönlendir
  if (!product) {
    return notFound();
  }

  // Stok kontrolü
  const stock = product.stock ?? 0;
  const isOutOfStock = stock === 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, stock))); // Stoktan fazlasını seçtirme
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    add({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl || "",
    }, quantity);
    
    alert(`${quantity} adet ${product.title} sepete eklendi!`);
  };

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
          
          {/* SOL TARA: Ürün Görseli */}
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

          {/* SAĞ TARAF: Ürün Detayları */}
          <div className="mt-8 lg:mt-0">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{product.title}</h1>
            
            <div className="mt-4 prose prose-sm text-gray-500">
              <p>
                {/* Veride açıklama olmadığı için dinamik başlık ve standart metin kullanıyoruz */}
                {product.title}, mutfağınızdaki en büyük yardımcınız olmaya aday. 
                Ülgen Paslanmaz kalitesiyle üretilmiştir.
              </p>
            </div>

            <div className="mt-6">
              <p className="text-3xl font-bold tracking-tight text-gray-900">
                {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>

            {/* İsim Yazdırma Alanı */}
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
                  disabled={isOutOfStock}
                  className="block w-full rounded-md border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="İsim yazınız..."
                />
              </div>
            </div>

            {/* Miktar ve Sepete Ekle */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <span className="mr-3 text-sm font-medium text-gray-700">Miktar:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-gray-900 font-medium w-12 text-center">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled={quantity >= stock || isOutOfStock}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors
                  ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : 'bg-stone-900 hover:bg-stone-800'}
                `}
              >
                {isOutOfStock ? 'STOKTA YOK' : 'SEPETE EKLE'}
              </button>
            </div>

            {/* Güvenceler */}
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

            {/* Akordeonlar (Generic Bilgiler) */}
            <div className="mt-8 border-t border-gray-200">
              <AccordionItem 
                title="Ürün Açıklaması" 
                isOpen={openSection === 'description'} 
                onClick={() => toggleSection('description')}
              >
                <ul className="list-disc pl-5 space-y-1">
                  <li>Profesyonel el işçiliği</li>
                  <li>Yüksek karbonlu paslanmaz çelik</li>
                  <li>Ergonomik sap tasarımı</li>
                  <li>Uzun ömürlü keskinlik</li>
                </ul>
              </AccordionItem>

              <AccordionItem 
                title="Kullanım Talimatı" 
                isOpen={openSection === 'usage'} 
                onClick={() => toggleSection('usage')}
              >
                <p>Bıçağınızı sadece amacına uygun olarak (kesme, doğrama) kullanınız. Dondurulmuş gıdalar veya kemik gibi sert cisimlerde kullanmayınız.</p>
              </AccordionItem>

              <AccordionItem 
                title="Temizleme" 
                isOpen={openSection === 'cleaning'} 
                onClick={() => toggleSection('cleaning')}
              >
                <p>Bulaşık makinesinde yıkanması tavsiye edilmez. Ilık su ve sünger ile elde yıkayıp hemen kurulayınız.</p>
              </AccordionItem>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}