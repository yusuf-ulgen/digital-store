import Link from "next/link";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import SortDropdown from "@/components/SortDropdown";
import type { Product } from "@/lib/api/products-admin"; 
import { ALL_PRODUCTS, type LocalProduct } from "@/lib/mock-data";

const allProducts = ALL_PRODUCTS; 

// --- Kategori Bilgileri (BİLEYİCİ EKLENDİ) ---
const CATEGORY_DATA: Record<string, { title: string; description: string }> = {
  bicaklar: {
    title: "Bıçaklar",
    description:
      "Mutfakta ve açık havada ihtiyacınız olan tüm kesici aletler. Profesyonel şef bıçaklarından günlük kullanıma uygun bıçaklara kadar geniş bir yelpaze.",
  },
  "bicak-seti": {
    title: "Bıçak Seti",
    description:
      "Birbiriyle uyumlu, farklı amaçlara yönelik bıçakları bir arada sunan profesyonel bıçak setleri. Mutfağınızın temel ihtiyacı.",
  },
  "sef-bicagi": {
    title: "Şef Bıçağı",
    description:
      "Profesyonel şeflerin ve yemek tutkunlarının bir numaralı tercihi olan şef bıçakları ile mutfakta harikalar yaratın. Keskin, dayanıklı ve ergonomik.",
  },
  outdoor: {
    title: "Outdoor",
    description:
      "Kamp, avcılık ve doğa yürüyüşleri için özel olarak tasarlanmış dayanıklı ve güvenilir outdoor bıçakları ve ekipmanları.",
  },
  kasap: {
    title: "Kasap",
    description:
      "Et işleme sanatı için özel olarak üretilmiş, keskinliğini uzun süre koruyan profesyonel kasap bıçakları ve satırları.",
  },
  satirlar: {
    title: "Satırlar",
    description:
      "Zorlu kesim işlemleri, kemik kırma ve büyük et parçalama işleri için ideal, güçlü ve ağır hizmet tipi satırlar.",
  },
  // HATA 2 ÇÖZÜMÜ: Eksik olan anahtar buraya eklendi
  "bileyici-masatlar": {
    title: "Bileyici & Masatlar",
    description:
      "Bıçaklarınızın keskinliğini ilk günkü gibi korumak için ihtiyacınız olan en kaliteli bileyiciler ve profesyonel masatlar.",
  },
};

// --- Veri Çekme Fonksiyonları ---
const fakeProduct = (
  id: string,
  category: string,
  title: string,
  price: number,
  stock: number,
  imageFileName?: string,
  soldCount: number = 0
): LocalProduct => ({
  id,
  title,
  price,
  stock,
  category,
  imageUrl: imageFileName
    ? `/products/${imageFileName}`
    : `https://placehold.co/400x400/eeeeee/333333?text=${title.replace(/ /g, "+")}`,
  active: stock > 0,
  createdAt: new Date().toISOString(),
  soldCount,
});

// --- GÜNCELLENMİŞ Veri Çekme Fonksiyonu ---
async function getFilteredProducts(
  categorySlug: string | null, // Kategori (arama yapılıyorsa null olabilir)
  searchQuery: string | null,  // Arama terimi
  searchParams: { [key: string]: string | string[] | undefined }
): Promise<LocalProduct[]> {
  const { minFiyat, maxFiyat, stokta, sirala } = searchParams as {
    minFiyat?: string;
    maxFiyat?: string;
    stokta?: string;
    sirala?: string;
  };

  let products = ALL_PRODUCTS;

  // 1. ARAMA FİLTRESİ (En öncelikli)
  if (searchQuery) {
    const q = searchQuery.toLocaleLowerCase("tr"); // Türkçe karakter uyumu
    products = products.filter((p) => 
      p.title.toLocaleLowerCase("tr").includes(q) ||
      p.shortDescription?.toLocaleLowerCase("tr").includes(q)
    );
  } 
  // 2. KATEGORİ FİLTRESİ (Eğer arama yapılmıyorsa çalışır)
  else if (categorySlug) {
    products = products.filter((p) => p.category === categorySlug);
  }

  // --- Ortak Filtreler (Stok, Fiyat, Sıralama) ---

  // Stok filtresi
  if (stokta === "stokta") {
    products = products.filter((p) => (p.stock ?? 0) > 0);
  } else if (stokta === "stokta-yok") {
    products = products.filter((p) => (p.stock ?? 0) === 0);
  }

  // Fiyat filtresi
  if (minFiyat) {
    products = products.filter((p) => p.price >= Number(minFiyat));
  }
  if (maxFiyat) {
    products = products.filter((p) => p.price <= Number(maxFiyat));
  }

  // Sıralama
  if (sirala === "fiyat-artan") {
    products.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  } else if (sirala === "fiyat-azalan") {
    products.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  } else if (sirala === "yeni") {
    products.sort(
      (a, b) =>
        new Date(b.createdAt ?? "").getTime() -
        new Date(a.createdAt ?? "").getTime()
    );
  } else if (sirala === "cok-satan") {
    products.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
  }

  return products;
}

function normalizeCategorySlug(slug: string) {
  if (slug === "bileyici-masat") return "bileyici-masatlar";
  return slug;
}

function getCategoryInfo(categorySlug: string) {
  return CATEGORY_DATA[categorySlug] || null;
}

type CategoryPageSearchParams = {
  [key: string]: string | string[] | undefined;
};

type CategoryPageProps = {
  searchParams: Promise<CategoryPageSearchParams>;
};

// --- GÜNCELLENMİŞ Ana Bileşen ---
export default async function ProductsPage({ searchParams }: CategoryPageProps) {
  const resolvedSearchParams = await searchParams;

  // URL Parametrelerini Al
  const searchQuery = resolvedSearchParams.query as string | undefined;
  const rawCat = resolvedSearchParams.cat as string | undefined;

  // Sayfa Başlığı ve Açıklaması için değişkenler
  let pageTitle = "";
  let pageDescription = "";
  let products: LocalProduct[] = [];
  let isSearchMode = false;

  // DURUM 1: ARAMA YAPILIYORSA
  if (searchQuery) {
    isSearchMode = true;
    pageTitle = `"${searchQuery}" için arama sonuçları`;
    pageDescription = "Aradığınız kriterlere uygun ürünler listeleniyor.";
    // Kategoriyi null gönderiyoruz, aramayı gönderiyoruz
    products = await getFilteredProducts(null, searchQuery, resolvedSearchParams);
  } 
  
  // DURUM 2: KATEGORİ GEZİLİYORSA
  else {
    // Kategori slug'ını belirle (Varsayılan: bicaklar)
    const categorySlug = normalizeCategorySlug(rawCat || "bicaklar");
    const categoryInfo = getCategoryInfo(categorySlug);

    // Kategori verisi yoksa 404 ekranı göster
    if (!categoryInfo) {
      return (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold">Kategori Bulunamadı</h1>
          <p className="mt-2 text-gray-600">Aradığınız kategori mevcut değil.</p>
          <Link href="/" className="mt-6 inline-block rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white">
            Ana Sayfaya Dön
          </Link>
        </main>
      );
    }

    pageTitle = categoryInfo.title;
    pageDescription = categoryInfo.description;
    products = await getFilteredProducts(categorySlug, null, resolvedSearchParams);
  }

  return (
    <div className="bg-white min-h-screen">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 py-3 text-xs text-stone-400 font-medium">
          <Link href="/" className="hover:text-stone-700 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-stone-700">{isSearchMode ? "Arama Sonuçları" : pageTitle}</span>
        </div>

        {/* Başlık + Sıralama + Mobil Filtre Butonu */}
        <div className="py-4 sm:py-6 flex items-start sm:items-center justify-between gap-3 flex-wrap border-b border-stone-100">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-stone-950">
              {pageTitle}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-xl">{pageDescription}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobil: Filtre Butonu */}
            <label
              htmlFor="mobile-filter-toggle"
              className="flex lg:hidden items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10M11 20h2" />
              </svg>
              Filtrele
            </label>
            <SortDropdown />
          </div>
        </div>

        {/* Mobil Filtre Drawer (CSS checkbox trick) */}
        <input type="checkbox" id="mobile-filter-toggle" className="peer hidden" />
        {/* Overlay */}
        <label
          htmlFor="mobile-filter-toggle"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm hidden peer-checked:flex lg:hidden cursor-pointer"
        />
        {/* Drawer */}
        <div className="fixed top-0 left-0 z-50 h-full w-[min(300px,85vw)] bg-white shadow-2xl transform -translate-x-full peer-checked:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col lg:hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
            <span className="font-bold text-stone-950">Filtrele</span>
            <label htmlFor="mobile-filter-toggle" className="p-2 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors">
              <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </label>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <CategorySidebar searchParams={resolvedSearchParams} />
          </div>
        </div>

        {/* Ana İçerik: Sidebar + Ürünler */}
        <div className="flex gap-8 py-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <CategorySidebar searchParams={resolvedSearchParams} />
            </div>
          </aside>

          {/* Ürün Listesi */}
          <div className="flex-1 min-w-0">
            {products.length > 0 ? (
              <>
                <div className="mb-3 text-xs text-stone-400 font-medium">
                  Toplam <span className="font-bold text-stone-700">{products.length}</span> ürün bulundu.
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-stone-400 py-20 bg-stone-50 rounded-2xl">
                <p className="text-base font-bold text-stone-600 mb-1">Ürün Bulunamadı</p>
                <p className="text-sm mb-4">
                  {isSearchMode
                    ? `"${searchQuery}" ile eşleşen bir sonuç bulamadık.`
                    : "Bu kategoride şu an ürün bulunmamaktadır."}
                </p>
                {isSearchMode && (
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-950 text-white text-sm font-semibold rounded-xl hover:bg-stone-800 transition-colors"
                  >
                    Tüm Ürünleri Gör
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}