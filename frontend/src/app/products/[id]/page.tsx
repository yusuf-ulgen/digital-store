"use client";

import { useState, useEffect } from "react"; // useEffect eklendi
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
  const product = ALL_PRODUCTS.find((p) => p.id === id);

  // 'items' listesini de alıyoruz
  const { add, items } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [customName, setCustomName] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("description");

  if (!product) return notFound();

  // --- STOK MANTIĞI ---
  const stock = product.stock ?? 0;
  
  // Sepette şu an bu üründen kaç tane var?
  const cartItem = items.find(i => i.id === product.id);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  // Kullanıcının şu an ekleyebileceği maksimum adet (Stok - Sepetteki)
  const remainingStock = Math.max(0, stock - qtyInCart);
  
  // Hiç stok yok mu? (Genel stok 0 ise VEYA kalan hak 0 ise)
  const isOutOfStock = stock === 0;
  const isMaxedOut = remainingStock === 0; // Sepet dolu

  // Miktar değiştiğinde kontrol (Kalan stoktan fazlasını seçtirme)
  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
        const newValue = prev + delta;
        // 1'den küçük olamaz, kalan stoktan büyük olamaz
        return Math.max(1, Math.min(newValue, remainingStock));
    });
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleAddToCart = () => {
    if (isOutOfStock || isMaxedOut) return;
    
    // Güvenlik kontrolü: Seçilen miktar kalandan fazlaysa uyarı ver
    if (quantity > remainingStock) {
        alert(`Stokta sadece ${remainingStock} adet daha ürün kaldı.`);
        setQuantity(remainingStock); // Miktarı düzel
        return;
    }

    add({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl || "",
    }, quantity);
    
    // Ekleme sonrası miktar 1'e dönsün ama eğer stok dolduysa buton pasif olacak
    setQuantity(1);
    
    alert(`${quantity} adet ${product.title} sepete eklendi!`);
  };

  // Kalan stok 0 ise miktarı 1 yerine 0 veya pasif göstermek için
  const displayQuantity = isMaxedOut ? 0 : quantity;

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
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
            
            <div className="mt-4 prose prose-sm text-gray-500">
              <p>
                {product.title}, mutfağınızdaki en büyük yardımcınız olmaya aday. 
                Ülgen Paslanmaz kalitesiyle üretilmiştir.
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
                    // 1'den aşağı inmesin VEYA stok tamamen bittiyse VEYA sepette limit dolduysa basılmasın
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
                    // Seçilen miktar kalan stoğa ulaştıysa basılmasın
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
            
            {/* Kalan stok bilgisi (Opsiyonel ama kullanıcı dostu) */}
            {!isOutOfStock && remainingStock < 5 && remainingStock > 0 && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                    Son {remainingStock} ürün kaldı!
                </p>
            )}

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