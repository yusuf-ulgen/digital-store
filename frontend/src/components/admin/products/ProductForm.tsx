"use client";

import { useEffect, useState } from "react";

// Formdan dönecek veri tipi
export type ProductInput = {
  title: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  active: boolean;
};

type Props = {
  open: boolean;
  title: string;
  initial?: Partial<ProductInput>; // Düzenleme modunda dolu gelir
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: ProductInput) => void;
};

// İkonlar
const XIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-8 h-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function ProductForm({ open, title, initial, loading, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState<ProductInput>({
    title: "",
    price: 0,
    stock: 0,
    category: "",
    imageUrl: "",
    active: true,
  });

  // Form açıldığında verileri doldur
  useEffect(() => {
    if (open) {
      setFormData({
        title: initial?.title ?? "",
        price: initial?.price ?? 0,
        stock: initial?.stock ?? 0,
        category: initial?.category ?? "",
        imageUrl: initial?.imageUrl ?? "",
        active: initial?.active ?? true,
      });
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Arkaplan Karartma (Backdrop) */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Sağ Panel (Slide-over) */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform transition-transform duration-300 ease-in-out">
          <div className="flex h-full flex-col bg-white shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-stone-800">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              >
                <XIcon />
              </button>
            </div>

            {/* Form Alanı (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="product-form" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
                
                {/* Görsel Önizleme & URL */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-stone-700">Ürün Görseli</label>
                  <div className="flex gap-4">
                    <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
                      {formData.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={formData.imageUrl} 
                          alt="Önizleme" 
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')} 
                        />
                      ) : (
                        <ImageIcon />
                      )}
                    </div>
                    <div className="flex-1">
                       <label className="mb-1 block text-xs text-stone-500">Görsel Bağlantısı (URL)</label>
                       <input
                        type="text"
                        placeholder="https://..."
                        className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                      <p className="mt-1 text-[10px] text-stone-400">Örn: /products/resim.png veya harici link</p>
                    </div>
                  </div>
                </div>

                {/* Başlık */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Ürün Adı</label>
                  <input
                    type="text"
                    required
                    className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Kategori</label>
                  <input
                    type="text"
                    list="categories"
                    placeholder="Örn: sef-bicagi"
                    className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                  {/* Örnek kategori önerileri (Data list) */}
                  <datalist id="categories">
                    <option value="sef-bicagi" />
                    <option value="kasap" />
                    <option value="outdoor" />
                    <option value="bicaklar" />
                    <option value="bicak-seti" />
                    <option value="satirlar" />
                  </datalist>
                </div>

                {/* Fiyat ve Stok (Grid) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Fiyat (₺)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Stok Adedi</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Aktiflik Toggle */}
                <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-stone-900">Satış Durumu</span>
                    <span className="text-xs text-stone-500">Bu ürün müşterilere gösterilsin mi?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.active ? 'bg-orange-500' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

              </form>
            </div>

            {/* Footer / Butonlar */}
            <div className="border-t border-stone-100 bg-stone-50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-200"
              >
                İptal
              </button>
              <button
                form="product-form"
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Kaydediliyor...
                  </>
                ) : (
                  "Kaydet"
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}