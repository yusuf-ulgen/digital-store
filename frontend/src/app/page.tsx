"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import AddToCartButton from "@/components/AddToCartButton";

type Product = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  oldPrice?: number;
  stock: number;
};

const featured: Product[] = [
  { id: "1", title: "Şef Bıçağı Santoku Paslanmaz Çelik", price: 599, stock: 8, imageUrl: "/bicak1.png" },
  { id: "2", title: "100. YILA ÖZEL ŞEF BIÇAĞI", price: 449.9, oldPrice: 499.9, stock: 5, imageUrl: "/bicak2.jpeg" },
  { id: "3", title: "Şef Bıçağı Santoku Paslanmaz Çelik", price: 599, stock: 0, imageUrl: "/bicak3.jpeg" },
];

const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);

export default function Home() {
  useEffect(() => {
    // Kullanıcı giriş yaptıysa otomatik token çek
    const checkUser = async () => {
      if (!auth.currentUser) {
        console.log("⚠️ Henüz login değil, token alınmadı.");
        return;
      }
      const token = await auth.currentUser.getIdToken(true);
      console.log("🔥 Token otomatik alındı:", token);
    };
    checkUser();
  }, []);

  return (
    <section className="container-tight space-y-12">
      <div className="section-head">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Şef Bıçakları
        </h2>
        <Link className="link-muted" href="/products">
          Tümünü Gör
        </Link>
      </div>

      <div className="home-grid">
        {featured.map((p) => (
          <article key={p.id} className="home-card">
            <Image
              src={p.imageUrl}
              alt={p.title}
              width={800}
              height={600}
              className="w-full aspect-[4/3] object-cover"
              priority
            />
            <div
              className="text-sm opacity-80 line-clamp-2"
              style={{ fontSize: 18, fontWeight: 500 }}
            >
              {p.title}
            </div>
            <div className="price-line">
              {p.oldPrice ? (
                <>
                  <span className="price-old">{tl(p.oldPrice)}</span>
                  <span className="price-now">{tl(p.price)}</span>
                </>
              ) : (
                <span className="price-now">{tl(p.price)}</span>
              )}
            </div>
            <AddToCartButton {...p} />
          </article>
        ))}
      </div>
    </section>
  );
}
