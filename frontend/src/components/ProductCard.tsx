"use client";
import Image from "next/image";
import { useCart } from "@/lib/cart";

export type Product = {
  id: string;
  title: string;
  price: number;
  stock: number;
  imageUrl: string;
  oldPrice?: number | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const canBuy = (product.stock ?? 0) > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Görsel */}
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e7e5e4" }}>
        <Image
          src={product.imageUrl}
          alt={product.title}
          width={640}
          height={480}
          style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Başlık */}
      <div style={{ fontSize: 18, fontWeight: 500, color: "#1f2937" }}>
        {product.title}
      </div>

      {/* Fiyat */}
      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
        {product.oldPrice ? (
          <div style={{ color: "#9ca3af", textDecoration: "line-through" }}>
            {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(product.oldPrice)}
          </div>
        ) : null}
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(product.price)}
        </div>
      </div>

      {/* Sepete ekle */}
      <button
        type="button"
        disabled={!canBuy}
        onClick={() =>
          add(
            { id: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl },
            1
          )
        }
        style={{
          marginTop: 6,
          height: 44,
          borderRadius: 12,
          border: "1px solid #d6d3d1",
          background: canBuy ? "#111827" : "#9ca3af",
          color: "#ffffff",
          cursor: canBuy ? "pointer" : "not-allowed",
          fontWeight: 600,
        }}
      >
        {canBuy ? "Sepete Ekle" : "Stokta Yok"}
      </button>
    </div>
  );
}
