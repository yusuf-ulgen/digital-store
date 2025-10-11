// src/app/products/page.tsx
"use client";
import ProductCard, { Product } from "@/components/ProductCard";

const mock: Product[] = [
  { id: "1", title: "Şef Bıçağı Santoku Paslanmaz Çelik", price: 599, stock: 8, imageUrl: "/images/p1.jpg" },
  { id: "2", title: "100. Yıla Özel Şef Bıçağı", price: 449.9, oldPrice: 499.9, stock: 5, imageUrl: "/images/p2.jpg" },
  { id: "3", title: "Şef Bıçağı Santoku Paslanmaz Çelik", price: 599, stock: 0, imageUrl: "/images/p3.jpg" },
];

function FilterSidebar() {
  return (
    <aside className="card p-4 sticky top-6 h-max">
      <div className="font-semibold mb-3">Stok Durumu</div>
      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Stokta</label>
        <label className="flex items-center gap-2"><input type="checkbox" /> Stokta Yok</label>
      </div>

      <div className="font-semibold mt-6 mb-3">Fiyat</div>
      <div className="flex items-center gap-2">
        <input className="w-20 card px-2 py-1" defaultValue={0} />
        <span>—</span>
        <input className="w-20 card px-2 py-1" defaultValue={3000} />
        <button className="btn btn-primary ml-auto">Uygula</button>
      </div>
    </aside>
  );
}

export default function ProductsPage() {
  return (
    <div
      style={{ maxWidth: "72rem", margin: "0 auto", padding: "1.5rem 1rem" }}
      className="space-y-6"
    >
      {/* Üstte başlık ve açıklama */}
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Şef Bıçağı</h1>
        <p className="max-w-4xl mx-auto text-stone-600 mt-3">
          Profesyonel şeflerin ve yemek tutkunu amatörlerin tercihi olan <b>şef bıçakları</b> ile mutfakta harikalar yarat.
          Üstün kaliteli paslanmaz çelik, dayanıklılık ve mükemmel keskinlik sağlar. Ergonomik sap tasarımı uzun kullanımda konfor sunar.
        </p>
      </section>

      {/* Sol filtre – sağ ürün grid */}
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <FilterSidebar />
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mock.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
