"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;            // toplam adet
  total: number;            // TL toplam
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
          const copy = [...prev]; copy[i] = { ...copy[i], qty: copy[i].qty + qty }; return copy;
        }
        return [...prev, { ...p, qty }];
      });
    },
    setQty: (id, qty) => setItems(prev => prev.map(x => x.id === id ? { ...x, qty } : x).filter(x => x.qty > 0)),
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
