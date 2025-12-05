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
  id, title, price, imageUrl, stock = 0, label = "Sepete Ekle",
}: Props) {
  // items'ı da çekiyoruz ki sepette kaç tane var bakabilelim
  const { add, items } = useCart();

  // 1. Ürün hiç stokta var mı?
  const isStockAvailable = stock > 0;

  // 2. Sepette şu an kaç tane var?
  const cartItem = items.find((item) => item.id === id);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  // 3. Daha fazla eklenebilir mi? (Stok - Sepetteki > 0)
  const canAddMore = isStockAvailable && (stock - qtyInCart > 0);

  const handleClick = () => {
    if (canAddMore) {
      // DÜZELTME: stock bilgisini de gönderiyoruz!
      add({ id, title, price, imageUrl, stock }, 1);
    } else {
      alert("Stoktaki son ürünü zaten sepetinize eklediniz.");
    }
  };

  // Buton Metni Durumu
  let buttonText = label;
  if (!isStockAvailable) buttonText = "Stokta Yok";
  else if (!canAddMore) buttonText = "Stok Sınırı"; // Sepette max adede ulaşıldı

  return (
    <button
      type="button"
      disabled={!canAddMore} // Stok bittiyse veya sepette limit dolduysa tıklanamaz
      onClick={handleClick}
      style={{
        marginTop: 8,
        height: 44,
        borderRadius: 12,
        border: "1px solid #d6d3d1",
        // Renk mantığı: Tıklanabilirse Siyah, değilse Gri
        background: canAddMore ? "#111827" : "#9ca3af",
        color: "#ffffff",
        cursor: canAddMore ? "pointer" : "not-allowed",
        fontWeight: 600,
        width: "100%",
        transition: "background 0.2s",
      }}
    >
      {buttonText}
    </button>
  );
}