"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ProductForm, { type ProductInput } from "@/components/admin/products/ProductForm";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

// İkonlar
const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

// Veri tipi
type Product = {
  id: string;
  title: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
  active?: boolean;
  createdAt?: any;
};

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const [askDelete, setAskDelete] = useState<null | Product>(null);
  const [deleting, setDeleting] = useState(false);

  // İstatistikler
  const stats = useMemo(() => {
    return {
      total: allProducts.length,
      active: allProducts.filter(p => p.active).length,
      lowStock: allProducts.filter(p => (p.stock || 0) < 5).length
    };
  }, [allProducts]);

  // 1. Firebase'den Verileri Çek
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      
      setAllProducts(items);
      setLoading(false);
    }, (error) => {
      console.error("Veri çekme hatası:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Arama ve Sayfalama (GÜNCELLENEN KISIM)
  useEffect(() => {
    let filtered = allProducts;

    if (search.trim()) {
      // Türkçe uyumlu küçük harfe çevirme
      const lowerQ = search.toLocaleLowerCase('tr');
      
      filtered = filtered.filter(p => 
        p.title.toLocaleLowerCase('tr').includes(lowerQ) || 
        (p.category || "").toLocaleLowerCase('tr').includes(lowerQ)
      );
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    setRows(filtered.slice(start, end));
  }, [allProducts, search, page]);

  // Form İşlemleri
  const submitForm = async (data: ProductInput) => {
    setSaving(true);
    try {
      if (editing) {
        const ref = doc(db, "products", editing.id);
        await updateDoc(ref, {
          ...data,
          price: Number(data.price),
          stock: Number(data.stock),
        });
      } else {
        await addDoc(collection(db, "products"), {
          ...data,
          price: Number(data.price),
          stock: Number(data.stock),
          createdAt: serverTimestamp(),
          active: true
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e: any) {
      console.error("Kaydetme hatası:", e);
      alert("İşlem başarısız oldu.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!askDelete) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "products", askDelete.id));
      setAskDelete(null);
    } catch (e: any) {
      console.error("Silme hatası:", e);
      alert("Silme başarısız.");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6 p-1">
      
      {/* İstatistikler */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Toplam Ürün</p>
          <p className="mt-2 text-3xl font-bold text-stone-800">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Aktif Satışta</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Kritik Stok (&lt;5)</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">{stats.lowStock}</p>
        </div>
      </div>

      {/* Arama ve Buton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Ürün ara..."
            className="block w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-10 pr-3 text-sm placeholder-stone-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
          />
        </div>
        <button 
          onClick={openNew}
          className="flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-stone-800 hover:shadow-lg transition-all active:scale-95"
        >
          <PlusIcon />
          Yeni Ürün Ekle
        </button>
      </div>

      {/* Tablo */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-400">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-orange-500"></div>
            <span>Yükleniyor...</span>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <DataTable<Product>
            columns={[
              {
                key: "image",
                header: "",
                className: "w-[64px] py-3 pl-4",
                render: (r) => (
                  <div className="h-12 w-12 overflow-hidden rounded-lg border border-stone-100 bg-stone-50">
                     {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="h-full w-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-stone-300">Resim Yok</div>
                    )}
                  </div>
                ),
              },
              { key: "title", header: "Ürün Adı", className: "font-semibold text-stone-700" },
              {
                key: "category",
                header: "Kategori",
                render: (r) => (
                    <span className="inline-block rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
                        {r.category || "Genel"}
                    </span>
                ),
              },
              {
                key: "price",
                header: "Fiyat",
                className: "text-right w-[140px]",
                render: (r) => <span className="font-mono font-medium text-stone-900">{(r.price ?? 0).toLocaleString('tr-TR')} ₺</span>,
              },
              {
                key: "stock",
                header: "Stok",
                className: "text-right w-[120px]",
                render: (r) => (
                  <div className="flex justify-end">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        (r.stock ?? 0) < 5 ? "bg-rose-100 text-rose-800" : "bg-blue-50 text-blue-700"
                    }`}>
                      {r.stock} adet
                    </span>
                  </div>
                ),
              },
              {
                key: "active",
                header: "Durum",
                className: "w-[100px] text-center",
                render: (r) => (
                   <div className="flex justify-center">
                       <span className={`h-2.5 w-2.5 rounded-full ${r.active ? 'bg-green-500' : 'bg-stone-300'}`}></span>
                   </div>
                ),
              },
              {
                key: "actions",
                header: "",
                className: "w-[180px] text-right pr-4",
                render: (r) => (
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(r); }}
                      className="rounded p-1.5 text-stone-500 hover:bg-stone-100 hover:text-orange-600 transition-colors"
                      title="Düzenle"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAskDelete(r); }}
                      className="rounded p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Sil"
                    >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ),
              },
            ]}
            rows={rows}
            getRowKey={(r) => r.id}
            onRowClick={(r) => openEdit(r)}
            pagination={{
              page,
              pageSize,
              total: allProducts.length,
              onPageChange: setPage,
            }}
            emptyText="Henüz ürün eklenmemiş."
          />
        </div>
      )}

      {/* Form Bileşeni */}
      <ProductForm
        open={formOpen}
        title={editing ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
        initial={editing ? {
            title: editing.title,
            price: editing.price,
            stock: editing.stock,
            imageUrl: editing.imageUrl,
            category: editing.category,
            active: editing.active ?? true,
          } : undefined}
        loading={saving}
        onSubmit={submitForm}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!askDelete}
        title="Ürünü Sil"
        description={askDelete ? `"${askDelete.title}" adlı ürünü kalıcı olarak silmek üzeresiniz.` : undefined}
        confirmText="Evet, Sil"
        onConfirm={confirmDelete}
        onClose={() => setAskDelete(null)}
        loading={deleting}
      />
    </div>
  );
}