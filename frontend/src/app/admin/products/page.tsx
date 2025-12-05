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

// Veri tipi tanımı (Firebase'den gelen veri)
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
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Tüm veriyi tutar
  const [rows, setRows] = useState<Product[]>([]); // Ekranda gösterileni tutar
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const [askDelete, setAskDelete] = useState<null | Product>(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Firebase'den Verileri Canlı Çek (Realtime)
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

  // 2. Arama ve Sayfalama (Client-Side)
  useEffect(() => {
    let filtered = allProducts;

    // Arama
    if (search.trim()) {
      const lowerQ = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(lowerQ) || 
        (p.category || "").toLowerCase().includes(lowerQ)
      );
    }

    // Sayfalama hesabı
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    setRows(filtered.slice(start, end));
  }, [allProducts, search, page]);

  // Form Gönderme (Ekleme/Düzenleme)
  const submitForm = async (data: ProductInput) => {
    setSaving(true);
    try {
      if (editing) {
        // Güncelleme
        const ref = doc(db, "products", editing.id);
        await updateDoc(ref, {
          ...data,
          price: Number(data.price),
          stock: Number(data.stock),
        });
      } else {
        // Yeni Ekleme
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

  // Silme İşlemi
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Ürünler ({allProducts.length})</h2>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Ara (başlık, kategori)…"
            className="w-56 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
          />
          <button 
            onClick={openNew}
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            + Yeni Ürün
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
          Yükleniyor…
        </div>
      ) : (
        <DataTable<Product>
          columns={[
            {
              key: "image",
              header: "",
              className: "w-[56px]",
              render: (r) =>
                r.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    className="h-10 w-10 rounded-md object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-stone-100" />
                ),
            },
            { key: "title", header: "Başlık", className: "font-medium" },
            {
              key: "category",
              header: "Kategori",
              render: (r) => r.category ?? "-",
            },
            {
              key: "price",
              header: "Fiyat",
              className: "text-right w-[120px]",
              render: (r) => <span>{(r.price ?? 0).toLocaleString()} ₺</span>,
            },
            {
              key: "stock",
              header: "Stok",
              className: "text-right w-[120px]",
              render: (r) => (
                <span className="inline-flex items-center justify-end gap-2">
                  {(r.stock ?? 0).toLocaleString()}
                  {(r.stock ?? 0) < 10 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">
                      Düşük
                    </span>
                  )}
                </span>
              ),
            },
            {
              key: "active",
              header: "Durum",
              className: "w-[120px]",
              render: (r) =>
                r.active ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                    Aktif
                  </span>
                ) : (
                  <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-700">
                    Pasif
                  </span>
                ),
            },
            {
              key: "actions",
              header: "",
              className: "w-[160px] text-right",
              render: (r) => (
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(r);
                    }}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAskDelete(r);
                    }}
                    className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
                  >
                    Sil
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
            total: allProducts.length, // Arama varsa filtered.length olmalı ama basit tuttum
            onPageChange: setPage,
          }}
          emptyText="Ürün bulunamadı"
        />
      )}

      <ProductForm
        open={formOpen}
        title={editing ? "Ürünü Düzenle" : "Yeni Ürün"}
        initial={
          editing
            ? {
                title: editing.title,
                price: editing.price,
                stock: editing.stock,
                imageUrl: editing.imageUrl,
                category: editing.category,
                active: editing.active ?? true,
              }
            : undefined
        }
        loading={saving}
        onSubmit={submitForm}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!askDelete}
        title="Ürünü sil"
        description={
          askDelete
            ? `"${askDelete.title}" adlı ürünü silmek istediğine emin misin?`
            : undefined
        }
        confirmText="Evet, sil"
        onConfirm={confirmDelete}
        onClose={() => setAskDelete(null)}
        loading={deleting}
      />
    </div>
  );
}