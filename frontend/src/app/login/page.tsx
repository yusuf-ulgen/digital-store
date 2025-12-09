// src/app/login/page.tsx  (tam dosyayı değiştir)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { setToken, loginAndGetToken } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { show } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      show({ title: "Eksik bilgi", message: "E-posta ve şifre zorunlu.", variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE!;
      let ok = false;

      // 1) Backend login dene (varsa)
      try {
        const res = await fetch(`${base}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json(); // { token: "..." }
          if (data?.token) {
            setToken(data.token);
            ok = true;
          }
        }
      } catch {
        /* bağlantı hatası -> firebase'e düşeceğiz */
      }

      // 2) Backend başarısızsa Firebase e-posta/şifre
      if (!ok) {
        const idToken = await loginAndGetToken(email, password); // setToken içinde event de atılıyor
        if (idToken) ok = true;
      }

      if (!ok) {
        show({ title: "Giriş başarısız", message: "Kimlik doğrulama yapılamadı.", variant: "error" });
        return;
      }

      show({ title: "Hoş geldin!", message: "Giriş başarılı.", variant: "success" });
      router.push("/admin");
    } catch (err: any) {
      show({ title: "Bağlantı hatası", message: String(err?.message || err), variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="mb-4 text-xl font-semibold">Giriş Yap</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email" placeholder="E-posta"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2" required
        />
        <input
          type="password" placeholder="Şifre"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2" required
        />
        <button
          type="submit" disabled={loading}
          className="w-full rounded bg-stone-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş"}
        </button>
      </form>
    </div>
  );
}
