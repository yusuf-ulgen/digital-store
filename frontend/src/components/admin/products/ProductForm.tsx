"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { ActiveToggle } from "../ActiveToggle";

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
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  const [uploading, setUploading] = useState(false);

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
      setUploading(false); // Modal her açıldığında yükleniyor durumunu sıfırla
    }
  }, [open, initial]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const storageRef = ref(storage, fileName);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Görsel yükleme oranı: %${progress.toFixed(1)}`);
        },
        (error) => {
          console.error("Görsel yükleme hatası:", error);
          alert("Görsel yüklenirken bir hata oluştu: " + error.message);
          setUploading(false);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData(prev => ({ ...prev, imageUrl: url }));
          } catch (err: any) {
            console.error("Görsel URL alınamadı:", err);
            alert("Görsel başarıyla yüklendi fakat bağlantısı alınamadı.");
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (error: any) {
      console.error("Yükleme başlatılamadı:", error);
      alert("Yükleme başlatılamadı: " + error.message);
      setUploading(false);
    } finally {
      e.target.value = ""; // Input değerini sıfırla ki aynı dosya tekrar seçilebilsin
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Arkaplan Karartma (Backdrop) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" 
            onClick={onClose}
          />

          {/* Sol Panel (Slide-over) */}
          <div className="fixed inset-y-0 left-0 flex max-w-full pr-10">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="w-screen max-w-md bg-white shadow-2xl flex h-full flex-col border-r border-stone-100"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">
                <h2 className="text-xl font-bold text-stone-900 font-display">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-all active:scale-90"
                >
                  <XIcon />
                </button>
              </div>

              {/* Form Alanı (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <form id="product-form" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
                  
                  {/* Görsel Önizleme & URL */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">Ürün Görseli</label>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        id="product-image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      
                      {/* Clickable Preview Box */}
                      <div 
                        onClick={() => document.getElementById("product-image-upload")?.click()}
                        className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-sm cursor-pointer hover:bg-stone-100 transition-all group"
                        title="Dosya seçmek için tıklayın"
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <svg className="h-6 w-6 animate-spin text-stone-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-[9px] text-stone-500 mt-1 font-medium">Yükleniyor</span>
                          </div>
                        ) : formData.imageUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={formData.imageUrl} 
                              alt="Önizleme" 
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }} 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                              Değiştir
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <ImageIcon />
                            <span className="text-[10px] text-stone-400 mt-1 font-medium group-hover:text-stone-600 transition-colors">Yüklemek İçin Basın</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <label className="block text-xs font-medium text-stone-500">Görsel Bağlantısı (URL)</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          className="block w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm placeholder-stone-400 focus:border-stone-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-950 transition-all"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        />
                        <p className="text-[10px] text-stone-400">Örn: /products/resim.png veya harici link</p>
                      </div>
                    </div>
                  </div>

                  {/* Başlık */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Ürün Adı</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Sürmene Şef Bıçağı"
                      className="block w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm placeholder-stone-400 focus:border-stone-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-950 transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  {/* Kategori */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Kategori</label>
                    <select
                      className="block w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm focus:border-stone-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-950 transition-all cursor-pointer"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="" disabled>Kategori Seçiniz</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fiyat ve Stok (Grid) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Fiyat (₺)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className="block w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm placeholder-stone-400 focus:border-stone-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-950 transition-all"
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Stok Adedi</label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="0"
                        className="block w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm placeholder-stone-400 focus:border-stone-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-950 transition-all"
                        value={formData.stock || ""}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  {/* Aktiflik Toggle */}
                  <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-stone-800">Satış Durumu</span>
                      <span className="text-xs text-stone-500">Bu ürün müşterilere gösterilsin mi?</span>
                    </div>
                    <ActiveToggle
                      active={formData.active}
                      onChange={(val) => setFormData({ ...formData, active: val })}
                    />
                  </div>

                </form>
              </div>

              {/* Footer / Butonlar */}
              <div className="border-t border-stone-100 bg-stone-50 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-stone-100"
                >
                  İptal
                </button>
                <button
                  form="product-form"
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}