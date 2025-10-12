"use client";
import { useState } from "react";
import { loginAndGetToken, getFreshToken, logout } from "@/lib/auth";
import { api } from "@/lib/api/client";
import { cartHeaders } from "@/lib/cart";

export default function DevAuthPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const doLogin = async () => {
    try {
      const t = await loginAndGetToken(email, pass);
      setToken(t);
      setErr(null);
    } catch (e: any) { setErr(String(e.message ?? e)); }
  };

  const getProducts = async () => {
    try {
      const data = await api<any[]>("/api/products");
      setOut(data);
    } catch (e: any) { setErr(String(e.message ?? e)); }
  };

  const createProduct = async () => {
    try {
      const t = token ?? (await getFreshToken());
      const data = await api<{id:string}>("/api/products", {
        method: "POST",
        idToken: t,
        body: { title: "Test Ürün", price: 99.9, stock: 5, imageUrl: "" },
      });
      setOut(data);
    } catch (e: any) { setErr(String(e.message ?? e)); }
  };

  const addToCart = async () => {
    try {
      const data = await api("/api/cart/items", {
        method: "POST",
        body: { productId: "TEST_ID", qty: 1 },
        extraHeaders: cartHeaders(),
      });
      setOut(data);
    } catch (e: any) { setErr(String(e.message ?? e)); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Dev / Auth & API Test</h1>

      <div className="space-y-2">
        <input className="border p-2 w-full" placeholder="email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="password" type="password"
               value={pass} onChange={e=>setPass(e.target.value)} />
        <div className="flex gap-2">
          <button className="border px-3 py-2" onClick={doLogin}>Login & Get Token</button>
          <button className="border px-3 py-2" onClick={async()=>setToken(await getFreshToken())}>
            Refresh Token
          </button>
          <button className="border px-3 py-2" onClick={logout}>Logout</button>
        </div>
        {token && <textarea className="w-full h-24 border p-2" readOnly value={token} />}
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="border px-3 py-2" onClick={getProducts}>GET /api/products</button>
        <button className="border px-3 py-2" onClick={createProduct}>
          POST /api/products (Bearer)
        </button>
        <button className="border px-3 py-2" onClick={addToCart}>
          POST /api/cart/items (+ X-Cart-Id)
        </button>
      </div>

      {err && <pre className="text-red-600">{err}</pre>}
      {out && <pre className="text-sm bg-stone-100 p-3 rounded">{JSON.stringify(out, null, 2)}</pre>}
    </div>
  );
}
