import Link from 'next/link';
import { notFound } from 'next/navigation';
import CategorySidebar from '@/components/CategorySidebar';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/api/products-admin';

// --- Kategori Bilgileri (BİLEYİCİ EKLENDİ) ---
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
  // HATA 2 ÇÖZÜMÜ: Eksik olan anahtar buraya eklendi
  'bileyici-masatlar': {
    title: 'Bileyici & Masatlar',
    description: 'Bıçaklarınızın keskinliğini ilk günkü gibi korumak için ihtiyacınız olan en kaliteli bileyiciler ve profesyonel masatlar.'
  }
};
// --- Veri Çekme Fonksiyonları ---

const fakeProduct = (id: string, category: string, title: string, price: number, stock: number) => ({
  id, title, price, stock, category,
  imageUrl: `https://placehold.co/400x400/eeeeee/333333?text=${title.replace(/ /g, '+')}`,
  active: stock > 0,
  createdAt: new Date().toISOString()
});

async function getProductsForCategory(categorySlug: string, searchParams: { [key: string]: string | string[] | undefined }): Promise<Product[]> {
  const { minFiyat, maxFiyat, stokta } = searchParams;

  // --- HATA 1 ÇÖZÜMÜ: TÜM KATEGORİLER İÇİN 12 ÜRÜN EKLENDİ ---
  const allProducts: Product[] = [
    // Şef Bıçağı (12 ürün)
    fakeProduct('1', 'sef-bicagi', 'Şef Bıçağı Santoku', 599, 10),
    fakeProduct('2', 'sef-bicagi', '100. Yıl Özel Şef Bıçağı', 449.90, 5),
    fakeProduct('3', 'sef-bicagi', 'Şef Bıçağı Paslanmaz Çelik', 599, 0),
    fakeProduct('4', 'sef-bicagi', 'Japon Şef Bıçağı', 750, 8),
    fakeProduct('5', 'sef-bicagi', 'Dövme Çelik Şef Bıçağı', 899, 3),
    fakeProduct('6', 'sef-bicagi', 'Mini Santoku Bıçağı', 399, 12),
    fakeProduct('7', 'sef-bicagi', 'Profesyonel Şef Seti', 1599, 2),
    fakeProduct('8', 'sef-bicagi', 'Sebze Bıçağı', 299, 20),
    fakeProduct('9', 'sef-bicagi', 'Et Doğrama Bıçağı', 650, 7),
    fakeProduct('10', 'sef-bicagi', 'Şef Bıçağı (Ahşap Sap)', 620, 0),
    fakeProduct('11', 'sef-bicagi', 'Hobi Şef Bıçağı', 410, 4),
    fakeProduct('12', 'sef-bicagi', 'Premium Şef Bıçağı', 1999, 1),
    
    // Outdoor (12 ürün)
    fakeProduct('13', 'outdoor', 'Outdoor Av Bıçağı', 799, 10),
    fakeProduct('14', 'outdoor', 'Kamp Baltası', 1200, 5),
    fakeProduct('15', 'outdoor', 'Çakı (Survival)', 450, 0),
    fakeProduct('16', 'outdoor', 'Outdoor Taktik Bıçak', 990, 8),
    fakeProduct('17', 'outdoor', 'Bushcraft Bıçağı', 1100, 3),
    fakeProduct('18', 'outdoor', 'Mini Outdoor Çakı', 300, 12),
    fakeProduct('19', 'outdoor', 'Outdoor Set (Pusula)', 1800, 2),
    fakeProduct('20', 'outdoor', 'Balıkçı Bıçağı', 500, 20),
    fakeProduct('21', 'outdoor', 'Dağcı Bıçağı', 850, 7),
    fakeProduct('22', 'outdoor', 'Outdoor Bıçak (Kılıflı)', 920, 0),
    fakeProduct('23', 'outdoor', 'Ahşap Saplı Av Bıçağı', 710, 4),
    fakeProduct('24', 'outdoor', 'Premium Outdoor Bıçak', 2100, 1),

    // Bıçaklar (12 ürün)
    fakeProduct('25', 'bicaklar', 'Mutfak Bıçağı', 199, 15),
    fakeProduct('26', 'bicaklar', 'Ekmek Bıçağı', 250, 10),
    fakeProduct('27', 'bicaklar', 'Peynir Bıçağı', 180, 0),
    fakeProduct('28', 'bicaklar', 'Soyma Bıçağı', 150, 30),
    fakeProduct('29', 'bicaklar', 'Domates Bıçağı', 170, 25),
    fakeProduct('30', 'bicaklar', 'Fileto Bıçağı', 350, 10),
    fakeProduct('31', 'bicaklar', 'Lazer Kesim Bıçak', 220, 5),
    fakeProduct('32', 'bicaklar', 'Seramik Bıçak', 400, 8),
    fakeProduct('33', 'bicaklar', 'Meyve Bıçağı', 99, 50),
    fakeProduct('34', 'bicaklar', 'Dekor Bıçağı', 210, 0),
    fakeProduct('35', 'bicaklar', 'Pizza Bıçağı', 190, 14),
    fakeProduct('36', 'bicaklar', 'Genel Amaçlı Bıçak', 230, 11),

    // Bıçak Seti (12 ürün)
    fakeProduct('37', 'bicak-seti', '3\'lü Bıçak Seti', 799, 10),
    fakeProduct('38', 'bicak-seti', '5\'li Bıçak Seti (Standlı)', 1499, 5),
    fakeProduct('39', 'bicak-seti', 'Mıknatıslı Bıçak Seti', 1899, 0),
    fakeProduct('40', 'bicak-seti', 'Profesyonel Başlangıç Seti', 2100, 8),
    fakeProduct('41', 'bicak-seti', 'Steak Bıçak Seti', 999, 3),
    fakeProduct('42', 'bicak-seti', 'Renkli Bıçak Seti', 699, 12),
    fakeProduct('43', 'bicak-seti', 'Ahşap Bloklu Set', 2499, 2),
    fakeProduct('44', 'bicak-seti', 'Full Çelik Set', 2999, 20),
    fakeProduct('45', 'bicak-seti', 'Ekonomik Set', 499, 7),
    fakeProduct('46', 'bicak-seti', 'Lüks Bıçak Seti', 3499, 0),
    fakeProduct('47', 'bicak-seti', 'Taşıma Çantalı Set', 2899, 4),
    fakeProduct('48', 'bicak-seti', '2\'li Şef Seti', 1199, 1),

    // Kasap (12 ürün)
    fakeProduct('49', 'kasap', 'Kasap Bıçağı No:1', 300, 10),
    fakeProduct('50', 'kasap', 'Kasap Bıçağı No:2', 350, 5),
    fakeProduct('51', 'kasap', 'Kasap Bıçağı No:3', 400, 0),
    fakeProduct('52', 'kasap', 'Sıyırma Bıçağı', 280, 8),
    fakeProduct('53', 'kasap', 'Yüzme Bıçağı', 290, 3),
    fakeProduct('54', 'kasap', 'Kurban Bıçağı Seti', 1200, 12),
    fakeProduct('55', 'kasap', 'Dövme Kasap Bıçağı', 550, 2),
    fakeProduct('56', 'kasap', 'Kemik Sıyırma Bıçağı', 310, 20),
    fakeProduct('57', 'kasap', 'Deri Yüzme Bıçağı', 300, 7),
    fakeProduct('58', 'kasap', 'Kasap Satırı (Küçük)', 600, 0),
    fakeProduct('59', 'kasap', 'Et Açma Bıçağı', 450, 4),
    fakeProduct('60', 'kasap', 'Premium Kasap Seti', 1999, 1),

    // Satırlar (12 ürün)
    fakeProduct('61', 'satirlar', 'Ağır Hizmet Satır', 899, 10),
    fakeProduct('62', 'satirlar', 'Et Parçalama Satırı', 750, 5),
    fakeProduct('63', 'satirlar', 'Mutfak Tipi Satır', 550, 0),
    fakeProduct('64', 'satirlar', 'Dövme Çelik Satır', 990, 8),
    fakeProduct('65', 'satirlar', 'Kasap Satırı (Büyük)', 950, 3),
    fakeProduct('66', 'satirlar', 'Kallavi Satır', 1100, 12),
    fakeProduct('67', 'satirlar', 'Zırh Satırı (Tek Sap)', 450, 2),
    fakeProduct('68', 'satirlar', 'Zırh Satırı (Çift Sap)', 650, 20),
    fakeProduct('69', 'satirlar', 'Döner Bıçağı Satırı', 700, 7),
    fakeProduct('70', 'satirlar', 'İnce Et Satırı', 610, 0),
    fakeProduct('71', 'satirlar', 'Kemik Kırma Satırı', 920, 4),
    fakeProduct('72', 'satirlar', 'Premium Dövme Satır', 1400, 1),

    // Bileyici & Masatlar (12 ürün)
    fakeProduct('73', 'bileyici-masatlar', 'Profesyonel Masat', 350, 10),
    fakeProduct('74', 'bileyici-masatlar', 'Elmas Masat', 550, 5),
    fakeProduct('75', 'bileyici-masatlar', 'Bileme Taşı (1000/3000)', 700, 0),
    fakeProduct('76', 'bileyici-masatlar', 'Bileme Taşı (400/1000)', 650, 8),
    fakeProduct('77', 'bileyici-masatlar', 'Çelik Bileme Çubuğu', 400, 3),
    fakeProduct('78', 'bileyici-masatlar', 'Mekanik Bileyici', 250, 12),
    fakeProduct('79', 'bileyici-masatlar', 'Kaydırmaz Standlı Bileme Taşı', 850, 2),
    fakeProduct('80', 'bileyici-masatlar', 'Seramik Masat', 480, 20),
    fakeProduct('81', 'bileyici-masatlar', 'Kasap Masatı (Uzun)', 420, 7),
    fakeProduct('82', 'bileyici-masatlar', 'Bıçak Bileme Aleti', 199, 0),
    fakeProduct('83', 'bileyici-masatlar', 'Mini Masat', 150, 4),
    fakeProduct('84', 'bileyici-masatlar', 'Premium Bileme Seti', 1800, 1),
  ];
  
  let products = allProducts.filter(p => p.category === categorySlug);
  
  // Filtreleri uygula
  if (stokta === 'stokta') {
    products = products.filter(p => (p.stock ?? 0) > 0);
  } else if (stokta === 'stokta-yok') {
    products = products.filter(p => (p.stock ?? 0) === 0);
  }
  if (minFiyat) {
    products = products.filter(p => p.price >= Number(minFiyat));
  }
  if (maxFiyat) {
    products = products.filter(p => p.price <= Number(maxFiyat));
  }

  return products;
}

function getCategoryInfo(categorySlug: string) {
  return CATEGORY_DATA[categorySlug] || null;
}

type CategoryPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ProductsPage({ searchParams }: CategoryPageProps) {
  const categorySlug = searchParams.cat as string || 'bicaklar'; 
  
  const categoryInfo = getCategoryInfo(categorySlug);
  const products = await getProductsForCategory(categorySlug, searchParams);

  // Kategori bulunamazsa
  if (!categoryInfo) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold">Kategori Bulunamadı</h1>
        <p className="mt-2 text-gray-600">Aradığınız kategori (`{categorySlug}`) mevcut değil.</p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
          Ana Sayfaya Dön
        </Link>
      </main>
    );
  }

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center space-x-2 py-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">Ana Sayfa</Link>
          <span>/</span>
          <span className="font-medium text-gray-700">{categoryInfo.title}</span>
        </div>

        <div className="border-b border-gray-200 pb-6 pt-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{categoryInfo.title}</h1>
          <p className="mt-4 text-base text-gray-600">{categoryInfo.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 lg:grid-cols-4">
          
          <div className="hidden lg:block">
            <CategorySidebar searchParams={searchParams} />
          </div>

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
          
        </div>
      </main>
    </div>
  );
}