"use client";
import { useCart } from "@/lib/cart";

type Props = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  stock?: number;
  label?: string;
};

export default function AddToCartButton({
  id, title, price, imageUrl, stock = 1, label = "Sepete Ekle",
}: Props) {
  const { add } = useCart();
  const canBuy = (stock ?? 0) > 0;

  return (
    <button
      type="button"
      disabled={!canBuy}
      onClick={() => add({ id, title, price, imageUrl }, 1)}
      style={{
        marginTop: 8,
        height: 44,
        borderRadius: 12,
        border: "1px solid #d6d3d1",
        background: canBuy ? "#111827" : "#9ca3af",
        color: "#ffffff",
        cursor: canBuy ? "pointer" : "not-allowed",
        fontWeight: 600,
        width: "100%",
      }}
    >
      {canBuy ? label : "Stokta Yok"}
    </button>
  );
}
