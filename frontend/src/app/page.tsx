"use client";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  price: number;
  stock: number;
  imageUrl: string;
};

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE; // örn: http://localhost:5180
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data: Product[] = await res.json();
        setItems(data);
      } catch (e: any) {
        setErr(String(e?.message ?? e));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (err) return <div className="p-6 text-red-500">Hata: {err}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Ürünler</h1>

      {loading ? (
        <p>Yükleniyor…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="border rounded-lg p-3">
              <img
                src={p.imageUrl}
                alt={p.title}
                className="w-full h-40 object-cover rounded"
              />
              <h4 className="mt-2 font-medium">{p.title}</h4>
              <p className="text-sm opacity-80">
                ₺{p.price} • Stok: {p.stock}
              </p>
            </div>
          ))}

          {items.length === 0 && <p>Henüz ürün yok</p>}
        </div>
      )}
    </div>
  );
}
