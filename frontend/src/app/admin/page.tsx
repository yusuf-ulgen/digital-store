"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot,
  orderBy, query, serverTimestamp, updateDoc
} from "firebase/firestore";

type Item = { id: string; title: string; price: number; stock: number; imageUrl: string; };

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ title: "", price: "", stock: "", imageUrl: "" });
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

  async function addProduct() {
    await addDoc(collection(db, "products"), {
      title: form.title,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl,
      createdAt: serverTimestamp()
    });
    setForm({ title: "", price: "", stock: "", imageUrl: "" });
  }

  async function updateProduct(id: string, patch: Partial<Item>) {
    await updateDoc(doc(db, "products", id), patch as any);
  }

  async function removeProduct(id: string) {
    if (!confirm("Silinsin mi")) return;
    await deleteDoc(doc(db, "products", id));
  }

  if (!user) return null; // redirect olduysa boş dön

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="flex gap-3 items-center">
          <span className="text-sm opacity-80">{user?.email}</span>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => signOut(auth)}
          >
            Çıkış
          </button>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="font-medium mb-2">Yeni ürün</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2">
          <input className="border rounded px-2 py-2" placeholder="Başlık"
                 value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))}/>
          <input className="border rounded px-2 py-2" placeholder="Görsel URL"
                 value={form.imageUrl} onChange={e=>setForm(s=>({...s,imageUrl:e.target.value}))}/>
          <input className="border rounded px-2 py-2" placeholder="Fiyat" type="number"
                 value={form.price} onChange={e=>setForm(s=>({...s,price:e.target.value}))}/>
          <input className="border rounded px-2 py-2" placeholder="Stok" type="number"
                 value={form.stock} onChange={e=>setForm(s=>({...s,stock:e.target.value}))}/>
        </div>
        <button
          onClick={addProduct}
          disabled={disabled}
          className={`mt-3 px-4 py-2 rounded text-white ${disabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          Ekle
        </button>
      </section>

      <section>
        <h2 className="font-medium mb-2">Ürünler</h2>
        <div className="grid gap-3">
          {items.map(p => (
            <div key={p.id} className="border rounded p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <img src={p.imageUrl} alt={p.title} className="w-24 h-16 object-cover rounded"/>
              <div className="flex-1">
                <div className="font-medium">{p.title}</div>
                <div className="text-sm opacity-80">₺{p.price} • Stok: {p.stock}</div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-amber-500 text-white"
                  onClick={() => {
                    const title = prompt("Yeni başlık", p.title) ?? p.title;
                    updateProduct(p.id, { title });
                  }}
                >
                  Düzenle
                </button>
                <button
                  className="px-3 py-1 rounded bg-red-600 text-white"
                  onClick={() => removeProduct(p.id)}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p>Ürün yok</p>}
        </div>
      </section>
    </div>
  );
}
