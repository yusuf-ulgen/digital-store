"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export type ProductInput = {
  title: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
  active?: boolean;
};

type Props = {
  open: boolean;
  title?: string;
  initial?: Partial<ProductInput>;
  loading?: boolean;
  onSubmit: (data: ProductInput) => void | Promise<void>;
  onClose: () => void;
};

export default function ProductForm({
  open,
  title = "Ürün",
  initial,
  loading,
  onSubmit,
  onClose,
  
}: Props) {
  // 1. YÖNLENDİRİCİYİ TANIMLA (useRouter hook'unu çağır)
  const router = useRouter(); 
  
  const [form, setForm] = useState<ProductInput>({
    title: "",
    price: 0,
    stock: 0,
    imageUrl: "",
    category: "",
    active: true,
  });
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    setForm({
      title: initial?.title ?? "",
      price: typeof initial?.price === "number" ? initial!.price : 0,
      stock: typeof initial?.stock === "number" ? initial!.stock : 0,
      imageUrl: initial?.imageUrl ?? "",
      category: initial?.category ?? "",
      active: initial?.active ?? true,
    });
  }, [open, initial]);

  const update = (patch: Partial<ProductInput>) =>
    setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async () => {
    // basit doğrulama (UI)
    if (!form.title.trim()) return setErr("Başlık gerekli.");
    if (form.price < 0) return setErr("Fiyat 0'dan küçük olamaz.");
    if (form.stock < 0) return setErr("Stok 0'dan küçük olamaz.");

    setErr(null);
    await onSubmit({
      title: form.title.trim(),
      price: Number(form.price),
      stock: Math.floor(Number(form.stock)),
      imageUrl: form.imageUrl?.trim() || undefined,
      category: form.category?.trim() || undefined,
      active: !!form.active,
    });

    // 2. SAYFAYI YENİLE (Başarılı kayıttan sonra sunucudan veriyi tekrar çeker)
    router.refresh();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-stone-900">{title}</h3>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm text-stone-600 mb-1">Başlık</label>
            <input
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
              placeholder="Ürün adı"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-stone-600 mb-1">Fiyat</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => update({ price: Number(e.target.value) })}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm text-stone-600 mb-1">Stok</label>
        S       <input
                type="number"
                value={form.stock}
                onChange={(e) => update({ stock: Number(e.target.value) })}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-stone-600 mb-1">Kategori</label>
          	<input
              value={form.category ?? ""}
              onChange={(e) => update({ category: e.target.value })}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
              placeholder="Örn: bıçak"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-600 mb-1">Görsel URL</label>
          	<input
              value={form.imageUrl ?? ""}
              onChange={(e) => update({ imageUrl: e.target.value })}
            	className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
            	placeholder="https://…"
      	    />
  	    </div>

    	  <label className="inline-flex items-center gap-2 text-sm mt-1">
          <input
            type="checkbox"
            checked={!!form.active}
            onChange={(e) => update({ active: e.target.checked })}
          	/>
          	Aktif
      	</label>

      	{err && (
        	<div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          	{err}
        	</div>
      	)}
    	</div>

    	<div className="mt-5 flex justify-end gap-2">
      	<button
        	onClick={onClose}
        	className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
        	disabled={loading}
      	>
        	İptal
      	</button>
      	<button
        	onClick={handleSubmit}
      	  className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        	disabled={loading}
      	>
      	  {loading ? "Kaydediliyor…" : "Kaydet"}
      	</button>
  	  </div>
  	</div>
  </div>
  );
}