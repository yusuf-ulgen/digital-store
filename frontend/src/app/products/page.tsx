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

async function getProductsForCategory(
  categorySlug: string,
  searchParams: { [key: string]: string | string[] | undefined }
): Promise<LocalProduct[]> {
  const { minFiyat, maxFiyat, stokta, sirala } = searchParams as {
    minFiyat?: string;
    maxFiyat?: string;
    stokta?: string;
    sirala?: string;
  };

  const allProducts = ALL_PRODUCTS;

  let products = allProducts.filter((p) => p.category === categorySlug);

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

export default async function ProductsPage({ searchParams }: CategoryPageProps) {
  const resolvedSearchParams = await searchParams;

  const rawSlug = (resolvedSearchParams.cat as string) || "bicaklar";
  const categorySlug = normalizeCategorySlug(rawSlug);

  const categoryInfo = getCategoryInfo(categorySlug);
  const products = await getProductsForCategory(categorySlug, resolvedSearchParams);

  if (!categoryInfo) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold">Kategori Bulunamadı</h1>
        <p className="mt-2 text-gray-600">
          Aradığınız kategori (`{categorySlug}`) mevcut değil.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          Ana Sayfaya Dön
        </Link>
      </main>
    );
  }

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 py-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Ana Sayfa
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-700">{categoryInfo.title}</span>
        </div>

        {/* Başlık + sıralama */}
        <div className="border-b border-gray-200 pb-6 pt-12 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              {categoryInfo.title}
            </h1>
            <p className="mt-4 text-base text-gray-600">{categoryInfo.description}</p>
          </div>

          <SortDropdown />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 lg:grid-cols-4">
          <div className="hidden lg:block">
            <CategorySidebar searchParams={resolvedSearchParams} />
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
