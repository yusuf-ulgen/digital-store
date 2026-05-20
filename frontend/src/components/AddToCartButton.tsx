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
      disabled={!canAddMore}
      onClick={handleClick}
      className={`w-full h-10 mt-2 rounded-xl text-xs font-bold transition-all border ${
        canAddMore
          ? "bg-stone-950 text-white border-transparent hover:bg-stone-800 hover:shadow-lg active:scale-[0.98]"
          : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
      }`}
    >
      {buttonText}
    </button>
  );
}