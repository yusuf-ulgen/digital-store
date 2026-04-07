"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot,
  orderBy, query, serverTimestamp, updateDoc, writeBatch, setDoc
} from "firebase/firestore";
// Mock veriyi import ediyoruz
import { ALL_PRODUCTS } from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/constants";


type Item = { id: string; title: string; price: number; stock: number; imageUrl: string; category?: string };

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false); // Yükleme durumu
  const [form, setForm] = useState({ title: "", price: "", stock: "", imageUrl: "", category: "" });
  
  const disabled = useMemo(() =>
    !form.title || !form.price || !form.stock || !form.imageUrl, [form]);

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

  // --- MOCK VERİLERİ YÜKLEME FONKSİYONU ---
  async function seedDatabase() {
    if (!confirm("Dikkat! Bu işlem mock-data.ts içindeki tüm ürünleri veritabanına ekleyecek. Mevcut ürünler ID bazlı güncellenebilir. Devam edilsin mi?")) return;
    setLoading(true);
    try {
      const batch = writeBatch(db); // Toplu işlem başlatıyoruz
      
      ALL_PRODUCTS.forEach((product) => {
        // ID'yi korumak için 'doc' referansı oluşturuyoruz (product.id kullanarak)
        const ref = doc(db, "products", product.id);
        batch.set(ref, {
          title: product.title,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl || "",
          category: product.category || "diger",
          description: product.shortDescription || "Otomatik aktarılan ürün açıklaması.", 
          createdAt: serverTimestamp(),
          active: true
        }, { merge: true }); // 'merge: true' sayesinde varsa üzerine yazar, yoksa oluşturur.
      });

      await batch.commit(); // Hepsini tek seferde yaz
      alert("Başarılı! Tüm ürünler veritabanına yüklendi ve güncellendi.");
    } catch (error) {
      console.error("Yükleme hatası:", error);
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }


  async function addProduct() {
    await addDoc(collection(db, "products"), {
      title: form.title,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl,
      category: form.category || "genel",
      createdAt: serverTimestamp(),
      active: true
    });
    setForm({ title: "", price: "", stock: "", imageUrl: "", category: "" });
  }

  async function updateProduct(id: string, patch: Partial<Item>) {
    await updateDoc(doc(db, "products", id), patch as any);
  }

  async function removeProduct(id: string) {
    if (!confirm("Silinsin mi")) return;
    await deleteDoc(doc(db, "products", id));
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Yönetim Paneli</h1>
        <div className="flex gap-3 items-center">
          <button 
            onClick={seedDatabase} 
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium disabled:opacity-50"
          >
            {loading ? "Yükleniyor..." : "💾 Sahte Verileri Yükle"}
          </button>
          
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => signOut(auth)}
          >
            Çıkış Yap ({user?.email})
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
          <input className="border rounded px-2 py-2" placeholder="Görsel URL"
                 value={form.imageUrl} onChange={e=>setForm(s=>({...s,imageUrl:e.target.value}))}/>
          <input className="border rounded px-2 py-2" placeholder="Fiyat" type="number"
                 value={form.price} onChange={e=>setForm(s=>({...s,price:e.target.value}))}/>
          <input className="border rounded px-2 py-2"placeholder="Stok"type="number"min="0"
                 value={form.stock} onChange={(e) => { const val = e.target.value;if (Number(val) < 0) return; setForm((s) => ({ ...s, stock: val }));}}/>
        </div>
        <button
          onClick={addProduct}
          disabled={disabled}
          className={`mt-3 px-6 py-2 rounded text-white font-medium ${disabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          Ekle
        </button>
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
                  className="px-3 py-1.5 text-sm rounded bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium"
                  onClick={() => {
                    const title = prompt("Yeni başlık", p.title) ?? p.title;
                    updateProduct(p.id, { title });
                  }}
                >
                  Düzenle
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium"
                  onClick={() => removeProduct(p.id)}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-center py-10 text-gray-500">Henüz ürün eklenmemiş.</div>}
        </div>
      </section>
    </div>
  );
}