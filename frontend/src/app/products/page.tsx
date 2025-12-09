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
    // Aramayı null gönderiyoruz, kategoriyi gönderiyoruz
    products = await getFilteredProducts(categorySlug, null, resolvedSearchParams);
  }

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb (Gezinti Yolu) */}
        <div className="flex items-center space-x-2 py-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">Ana Sayfa</Link>
          <span>/</span>
          <span className="font-medium text-gray-700">
            {isSearchMode ? "Arama Sonuçları" : pageTitle}
          </span>
        </div>

        {/* Başlık + Sıralama */}
        <div className="border-b border-gray-200 pb-6 pt-12 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              {pageTitle}
            </h1>
            <p className="mt-4 text-base text-gray-600">{pageDescription}</p>
          </div>
          <SortDropdown />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 lg:grid-cols-4">
          {/* Sidebar: Arama modunda bile filtreleri (fiyat/stok) kullanabilmek için sidebar kalabilir */}
          <div className="hidden lg:block">
            <CategorySidebar searchParams={resolvedSearchParams} />
          </div>

          {/* Ürün Listesi */}
          <div className="lg:col-span-3">
            {products.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-500">
                  Toplam {products.length} ürün bulundu.
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-gray-500 py-20 bg-gray-50 rounded-lg">
                <p className="text-lg font-medium mb-2">Ürün Bulunamadı</p>
                <p>
                  {isSearchMode 
                    ? `"${searchQuery}" ile eşleşen bir sonuç bulamadık.` 
                    : "Bu kategoride şu an ürün bulunmamaktadır."}
                </p>
                {isSearchMode && (
                   <Link href="/products" className="mt-4 text-indigo-600 underline">
                     Tüm ürünleri gör
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