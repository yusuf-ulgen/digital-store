import Link from 'next/link';
import { notFound } from 'next/navigation';
import CategorySidebar from '@/components/CategorySidebar';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/api/products-admin'; // Product tipini admin'den alabiliriz

// --- Kategori Bilgileri (Normalde API'den veya CMS'den gelir) ---
// Bu, URL'deki 'categorySlug' ile eşleşecek veriyi sağlar.
const CATEGORY_DATA: Record<string, { title: string; description: string }> = {
  'bicaklar': {
    title: 'Bıçaklar',
    description: 'Mutfakta ve açık havada ihtiyacınız olan tüm kesici aletler. Profesyonel şef bıçaklarından günlük kullanıma uygun bıçaklara kadar geniş bir yelpaze.'
  },
  'bicak-seti': {
    title: 'Bıçak Seti',
    description: 'Birbiriyle uyumlu, farklı amaçlara yönelik bıçakları bir arada sunan profesyonel bıçak setleri. Mutfağınızın temel ihtiyacı.'
  },
  'sef-bicagi': {
    title: 'Şef Bıçağı',
    description: 'Profesyonel şeflerin ve yemek tutkunlarının bir numaralı tercihi olan şef bıçakları ile mutfakta harikalar yaratın. Keskin, dayanıklı ve ergonomik.'
  },
  'outdoor': {
    title: 'Outdoor',
    description: 'Kamp, avcılık ve doğa yürüyüşleri için özel olarak tasarlanmış dayanıklı ve güvenilir outdoor bıçakları ve ekipmanları.'
  },
  'kasap': {
    title: 'Kasap',
    description: 'Et işleme sanatı için özel olarak üretilmiş, keskinliğini uzun süre koruyan profesyonel kasap bıçakları ve satırları.'
  },
  'satirlar': {
    title: 'Satırlar',
    description: 'Zorlu kesim işlemleri, kemik kırma ve büyük et parçalama işleri için ideal, güçlü ve ağır hizmet tipi satırlar.'
  },
  'bileyici-masatlar': {
    title: 'Bileyici & Masatlar',
    description: 'Bıçaklarınızın keskinliğini ilk günkü gibi korumak için ihtiyacınız olan en kaliteli bileyiciler ve profesyonel masatlar.'
  }
};
// --- Veri Çekme Fonksiyonları (API'nize göre güncelleyin) ---

/**
 * Kategori slug'ına göre ürünleri API'den çeker
 * Not: Bu fonksiyonu kendi C# API'nize göre güncellemelisiniz.
 */
async function getProductsForCategory(categorySlug: string, searchParams: { [key: string]: string | string[] | undefined }): Promise<Product[]> {
  const { minFiyat, maxFiyat, stokta } = searchParams;
  
  // Örnek API URL'i (kendi API adresinizle değiştirin)
  // const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
  // url.searchParams.set('category', categorySlug);
  // if (minFiyat) url.searchParams.set('minPrice', String(minFiyat));
  // if (maxFiyat) url.searchParams.set('maxPrice', String(maxFiyat));
  // if (stokta) url.searchParams.set('inStock', 'true');
  
  // const res = await fetch(url.toString());
  // if (!res.ok) return [];
  // const data = await res.json();
  // return data.items;

  // --- Şimdilik Sahte Veri (API'yi bağlayana kadar) ---
  console.log("Ürünler getiriliyor:", categorySlug, searchParams);
  // Sahte ürün verisi (Mevcut ekran görüntülerinizden alındı)
  const allProducts: Product[] = [
    { id: '1', title: 'Şef Bıçağı Santoku Paslanmaz Çelik', price: 599.00, imageUrl: '/uploads/sef-santoku.jpg', active: true, stock: 10, category: 'sef-bicagi', createdAt: '' },
    { id: '2', title: '100. Yıla Özel Şef Bıçağı', price: 449.90, imageUrl: '/uploads/100-yil-sef.jpg', active: true, stock: 5, category: 'sef-bicagi', createdAt: '' },
    { id: '3', title: 'Şef Bıçağı Paslanmaz Çelik', price: 599.00, imageUrl: '/uploads/sef-celik.jpg', active: false, stock: 0, category: 'sef-bicagi', createdAt: '' },
    { id: '4', title: 'Kasap Bıçağı No:2', price: 350.00, imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Kasap+Bıçağı', active: true, stock: 20, category: 'kasap', createdAt: '' },
    { id: '5', title: '6\'lı Bıçak Seti (Standlı)', price: 1299.00, imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Bıçak+Seti', active: true, stock: 15, category: 'bicak-seti', createdAt: '' },
  ];
  
  // Kategoriye göre filtrele
  let products = allProducts.filter(p => p.category === categorySlug);
  
  // Stok filtresi (Ekran görüntünüzdeki gibi)
  if (stokta === 'stokta') {
    products = products.filter(p => (p.stock ?? 0) > 0);
  } else if (stokta === 'stokta-yok') {
    products = products.filter(p => (p.stock ?? 0) === 0);
  }
  
  // Fiyat filtresi (Ekran görüntünüzdeki gibi)
  if (minFiyat) {
    products = products.filter(p => p.price >= Number(minFiyat));
  }
  if (maxFiyat) {
    products = products.filter(p => p.price <= Number(maxFiyat));
  }

  return products;
}

/**
 * Kategori slug'ına göre başlık ve açıklamayı alır
 */
function getCategoryInfo(categorySlug: string) {
  return CATEGORY_DATA[categorySlug] || null;
}

// Arama parametrelerinin tipini belirliyoruz
type CategoryPageProps = {
  params: { categorySlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categorySlug } = params;
  
  // 1. Kategori bilgilerini ve ürünleri paralel olarak çek
  const categoryInfo = getCategoryInfo(categorySlug);
  const products = await getProductsForCategory(categorySlug, searchParams);

  // Kategori bulunamazsa 404 sayfası göster
  if (!categoryInfo) {
    notFound();
  }

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Yol haritası (Breadcrumbs) */}
        <div className="flex items-center space-x-2 py-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">Ana Sayfa</Link>
          <span>/</span>
          <span className="font-medium text-gray-700">{categoryInfo.title}</span>
        </div>

        {/* Başlık ve Açıklama */}
        <div className="border-b border-gray-200 pb-6 pt-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{categoryInfo.title}</h1>
          <p className="mt-4 text-base text-gray-600">{categoryInfo.description}</p>
        </div>

        {/* Ana İçerik: Filtre + Ürün Listesi */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 lg:grid-cols-4">
          
          {/* 1. Sütun: Filtreler (Sidebar) */}
          <div className="hidden lg:block">
            <CategorySidebar searchParams={searchParams} />
          </div>

          {/* 2. Sütun: Ürün Listesi */}
          <div className="lg:col-span-3">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-16">
                <p>Bu kategoride ve filtrelerde ürün bulunamadı.</p>
              </div>
            )}
          </div>
          
          {/* Mobil için Filtre (İsteğe bağlı, şimdilik kapalı) */}
          {/* Mobil için buraya bir "Filtrele" butonu ve modal eklenebilir. */}

        </div>
      </main>
    </div>
  );
}