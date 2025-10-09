import ProductCard from "../../components/ProductCard";

function FilterSidebar() {
  return (
    <aside className="card p-4 sticky top-6 h-max">
      <div className="font-semibold mb-3">Stok Durumu</div>
      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Stokta</label>
        <label className="flex items-center gap-2"><input type="checkbox"/> Stokta Yok</label>
      </div>

      <div className="font-semibold mt-6 mb-3">Fiyat</div>
      <div className="flex items-center gap-2">
        <input className="w-20 card px-2 py-1" defaultValue={0}/>
        <span>—</span>
        <input className="w-20 card px-2 py-1" defaultValue={3000}/>
        <button className="btn btn-primary ml-auto">Uygula</button>
      </div>
    </aside>
  );
}

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* Üstte başlık ve açıklama bloğu */}
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Şef Bıçağı</h1>
        <p className="max-w-4xl mx-auto text-stone-600 mt-3">
          Profesyonel şeflerin ve yemek tutkunu amatörlerin tercihi olan <b>şef bıçakları</b> ile mutfakta harikalar yaratın.
          Üstün kaliteli paslanmaz çelikten üretilen bu bıçaklar, hem dayanıklılığı hem de mükemmel keskinliği ile zor kesim
          işlerini bile kolaylıkla halleder. Ergonomik sap tasarımı sayesinde uzun süreli kullanımlarda bile konfor sağlar
          ve el yorgunluğunu minimuma indirir.
        </p>
      </section>

      {/* Sol filtre – sağ ürün grid (Cavitinox yerleşimi) */}
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <FilterSidebar />
        <div className="space-y-6">
          {/* Ürün grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProductCard
                key={i}
                title={`Şef Bıçağı Model ${i + 1}`}
                price={499 + i * 20}
                image={`https://picsum.photos/seed/knife${i}/800/600`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
