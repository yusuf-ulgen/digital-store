"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  qty: number;
  stock?: number; // YENİ: Stok bilgisini ekledik
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  // add fonksiyonuna stock parametresini de ekliyoruz
  add: (p: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartCtx = createContext<CartContextType | null>(null);
const LS_KEY = "ulgen.cart.v1";

function load(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function save(items: CartItem[]) { localStorage.setItem(LS_KEY, JSON.stringify(items)); }

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => { setItems(load()); }, []);
  useEffect(() => { save(items); }, [items]);

  const api = useMemo<CartContextType>(() => ({
    items,
    count: items.reduce((s, x) => s + x.qty, 0),
    total: items.reduce((s, x) => s + x.qty * x.price, 0),
    add: (p, qty = 1) => {
      setItems((prev) => {
        const i = prev.findIndex(x => x.id === p.id);
        if (i >= 0) {
          // Eğer ürün zaten varsa, stoğu güncelle (belki değişmiştir) ve adedi artır
          const copy = [...prev];
          // Yeni stok bilgisi varsa güncelle, yoksa eskisi kalsın
          const currentStock = p.stock !== undefined ? p.stock : copy[i].stock;
          
          // GÜVENLİK: Eğer (mevcut + eklenecek) > stok ise ekleme!
          if (currentStock !== undefined && (copy[i].qty + qty) > currentStock) {
             alert(`Stok yetersiz! En fazla ${currentStock} adet alabilirsiniz.`);
             return prev; // Değişiklik yapmadan dön
          }

          copy[i] = { ...copy[i], qty: copy[i].qty + qty, stock: currentStock }; 
          return copy;
        }
        // Yeni ürün eklerken de stok kontrolü (genelde 1 tane eklenir ama yine de)
        if (p.stock !== undefined && qty > p.stock) {
            alert(`Stok yetersiz!`);
            return prev;
        }
        return [...prev, { ...p, qty }];
      });
    },
    setQty: (id, qty) => setItems(prev => prev.map(x => {
        if (x.id === id) {
            // GÜVENLİK: Elle sayı girilirse veya + butonuna basılırsa kontrol et
            if (x.stock !== undefined && qty > x.stock) {
                alert(`Stok yetersiz! Maksimum ${x.stock} adet.`);
                return x; // Değişiklik yapma
            }
            return { ...x, qty };
        }
        return x;
    }).filter(x => x.qty > 0)),
    remove: (id) => setItems(prev => prev.filter(x => x.id !== id)),
    clear: () => setItems([]),
  }), [items]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(n);

const KEY = "cartId";
export function ensureCartId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) { id = crypto.randomUUID().replaceAll("-", ""); localStorage.setItem(KEY, id); }
  return id;
}
export function cartHeaders() { return { "X-Cart-Id": ensureCartId() }; }