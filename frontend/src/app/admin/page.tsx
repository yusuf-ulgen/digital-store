"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot,
  orderBy, query, serverTimestamp, updateDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { CATEGORIES } from "@/lib/constants";
import ProductForm, { type ProductInput } from "@/components/admin/products/ProductForm";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { ActiveToggle } from "@/components/admin/ActiveToggle";

type Item = { 
  id: string; 
  title: string; 
  price: number; 
  stock: number; 
  imageUrl: string; 
  category?: string; 
  active?: boolean; 
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ title: "", price: "", stock: "", imageUrl: "", category: "", active: true });
  
  // Dashboard görsel yükleme durumu
  const [uploadingImage, setUploadingImage] = useState(false);

  // Düzenleme paneli durumları
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);

  // Silme onay modalı durumları
  const [askDelete, setAskDelete] = useState<null | Item>(null);
  const [deleting, setDeleting] = useState(false);

  const disabled = useMemo(() =>
    !form.title || !form.price || !form.stock || !form.imageUrl || uploadingImage, [form, uploadingImage]);

  // Auth guard
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) router.replace("/login");
    });
  }, [router]);

  // Listeyi canlı çek
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Item[];
      setItems(arr);
    });
    return () => unsub();
  }, []);

  const handleDashboardFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const storageRef = ref(storage, fileName);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Dashboard görsel yükleme oranı: %${progress.toFixed(1)}`);
        },
        (error) => {
          console.error("Dashboard görsel yükleme hatası:", error);
          alert("Görsel yüklenirken bir hata oluştu: " + error.message);
          setUploadingImage(false);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            setForm((s) => ({ ...s, imageUrl: url }));
          } catch (err: any) {
            console.error("Görsel URL alınamadı:", err);
            alert("Görsel başarıyla yüklendi fakat bağlantısı alınamadı.");
          } finally {
            setUploadingImage(false);
          }
        }
      );
    } catch (error: any) {
      console.error("Yükleme başlatılamadı:", error);
      alert("Yükleme başlatılamadı: " + error.message);
      setUploadingImage(false);
    } finally {
      e.target.value = "";
    }
  };

  async function addProduct() {
    await addDoc(collection(db, "products"), {
      title: form.title,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl,
      category: form.category || "genel",
      createdAt: serverTimestamp(),
      active: form.active
    });
    setForm({ title: "", price: "", stock: "", imageUrl: "", category: "", active: true });
  }

  async function updateProduct(id: string, patch: Partial<Item>) {
    await updateDoc(doc(db, "products", id), patch as any);
  }

  const confirmDelete = async () => {
    if (!askDelete) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "products", askDelete.id));
      setAskDelete(null);
    } catch (e) {
      console.error("Silme hatası:", e);
      alert("Silme işlemi sırasında bir hata oluştu.");
    } finally {
      setDeleting(false);
    }
  };

  const submitForm = async (data: ProductInput) => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateProduct(editing.id, {
        title: data.title,
        price: Number(data.price),
        stock: Number(data.stock),
        imageUrl: data.imageUrl,
        category: data.category,
        active: data.active,
      });
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      console.error("Güncelleme hatası:", e);
      alert("Değişiklikler kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Yönetim Paneli</h1>
        <div className="flex gap-3 items-center">
          <button
            className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium transition-all active:scale-95"
            onClick={() => signOut(auth)}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      <section className="mb-8 p-4 bg-gray-50 rounded-lg border">
        <h2 className="font-medium mb-3">Yeni Ürün Ekle</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
          <input className="border rounded px-2 py-2" placeholder="Başlık"
                 value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))}/>
          <select
              className="border rounded px-2 py-2 bg-white"
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
            >
              <option value="" disabled>Kategori Seçiniz</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          <div className="relative flex items-center">
            <input 
              className="border rounded px-2 py-2 pr-14 w-full min-w-0" 
              placeholder="Görsel URL"
              value={form.imageUrl} 
              onChange={e => setForm(s => ({ ...s, imageUrl: e.target.value }))}
            />
            <input
              type="file"
              id="dashboard-image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleDashboardFileUpload}
            />
            <button
              type="button"
              onClick={() => document.getElementById("dashboard-image-upload")?.click()}
              className="absolute right-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-xs font-medium transition-all active:scale-95 disabled:opacity-50 border border-stone-200/60"
              disabled={uploadingImage}
            >
              {uploadingImage ? "..." : "Yükle"}
            </button>
          </div>
          <input className="border rounded px-2 py-2" placeholder="Fiyat" type="number"
                 value={form.price} onChange={e=>setForm(s=>({...s,price:e.target.value}))}/>
          <input className="border rounded px-2 py-2"placeholder="Stok"type="number"min="0"
                 value={form.stock} onChange={(e) => { const val = e.target.value;if (Number(val) < 0) return; setForm((s) => ({ ...s, stock: val }));}}/>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-stone-600">Ürün Durumu:</span>
            <ActiveToggle active={form.active} onChange={(val) => setForm(s => ({ ...s, active: val }))} />
          </div>
          <button
            onClick={addProduct}
            disabled={disabled}
            className={`px-6 py-2 rounded text-white font-medium transition-all active:scale-95 ${disabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            Ekle
          </button>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium text-lg">Ürün Listesi ({items.length})</h2>
        </div>
        
        <div className="grid gap-3">
          {items.map(p => (
            <div key={p.id} className="border rounded p-3 flex flex-col sm:flex-row gap-4 items-center bg-white shadow-sm">
              <div className="w-16 h-16 relative overflow-hidden rounded bg-gray-100 shrink-0">
                 <img src={p.imageUrl || "https://placehold.co/100"} alt={p.title} className="object-cover w-full h-full"/>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="font-medium text-gray-900">{p.title}</div>
                <div className="text-sm text-gray-500">
                  {p.category} • ₺{p.price} • Stok: {p.stock}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 text-sm rounded bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium transition-all active:scale-95"
                  onClick={() => {
                    setEditing(p);
                    setFormOpen(true);
                  }}
                >
                  Düzenle
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium transition-all active:scale-95"
                  onClick={() => setAskDelete(p)}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-center py-10 text-gray-500">Henüz ürün eklenmemiş.</div>}
        </div>
      </section>

      {/* Ürün Düzenleme Paneli */}
      <ProductForm
        open={formOpen}
        title="Ürünü Düzenle"
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
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />

      {/* Silme Onay Modalı */}
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