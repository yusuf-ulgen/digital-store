"use client";
import Image from "next/image";
import Link from "next/link";
import { tl, useCart } from "@/lib/cart";

export default function CartPage() {
  const { items, total, count, setQty, remove, clear } = useCart();

  if (count === 0) {
    return (
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "2rem 1rem", minHeight: "50vh" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Sepet</h1>
        <div style={{ padding: "2rem", border: "1px dashed #d6d3d1", borderRadius: 16, textAlign: "center", background: "#fafaf9" }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Sepetiniz şu an boş.</div>
          <Link href="/products" style={{ textDecoration: "none", color: "#ffffff", background: "#111827", padding: "10px 16px", borderRadius: 12, display: "inline-block", marginTop: 6 }}>
            Ürünlere Göz At
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Sepet</h1>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Liste */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((it) => {
            // --- STOK KONTROL MANTIĞI ---
            // Stok bilgisi gelmezse varsayılan olarak yüksek bir limit (999) koyuyoruz ki hata vermesin.
            const stock = it.stock ?? 999; 
            const isMaxed = it.qty >= stock;

            return (
              <div key={it.id} style={{ display: "grid", gridTemplateColumns: "96px 1fr 140px 120px", gap: 12, alignItems: "center", border: "1px solid #e7e5e4", borderRadius: 14, padding: 12 }}>
                <Image src={it.imageUrl} alt={it.title} width={96} height={96} style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 10 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{it.title}</div>
                  {/* Stok uyarısı (Opsiyonel: Sadece limit dolduğunda görünür) */}
                  {isMaxed && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>Maksimum stok limiti</div>}
                  <button onClick={() => remove(it.id)} style={{ marginTop: 6, border: "none", background: "transparent", color: "#ef4444", cursor: "pointer" }}>Kaldır</button>
                </div>
                <div style={{ fontWeight: 600 }}>{tl(it.price)}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setQty(it.id, Math.max(0, it.qty - 1))} style={btnQty}>−</button>
                  
                  <input 
                    value={it.qty} 
                    // Input ile elle giriş yapılırsa da stok kontrolü yapalım
                    onChange={(e) => {
                        const val = parseInt(e.target.value || "0") || 0;
                        setQty(it.id, Math.max(0, Math.min(val, stock))); 
                    }} 
                    style={qtyInput} 
                  />
                  
                  {/* PLUS BUTONU GÜNCELLEMESİ */}
                  <button 
                    onClick={() => setQty(it.id, it.qty + 1)} 
                    disabled={isMaxed} // Limit dolduysa tıklanamaz
                    style={{
                        ...btnQty,
                        // Pasifse şeffaflaştır ve cursor'ı değiştir
                        opacity: isMaxed ? 0.4 : 1,
                        cursor: isMaxed ? "not-allowed" : "pointer",
                        background: isMaxed ? "#f3f4f6" : "#fff" 
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Özet */}
        <div style={{ border: "1px solid #e7e5e4", borderRadius: 14, padding: 16, height: "fit-content" }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Sipariş Özeti</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span>Ara Toplam</span><span>{tl(total)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span>Kargo</span><span>Ücretsiz</span>
          </div>
          <div style={{ height: 1, background: "#eee", margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
            <span>Toplam</span><span>{tl(total)}</span>
          </div>

          <Link href="/thank-you" style={{ display: "block", textAlign: "center", marginTop: 14, background: "#111827", color: "#fff", textDecoration: "none", padding: "12px 16px", borderRadius: 12, fontWeight: 700 }}>
            Ödeme Simülasyonu
          </Link>

          <button onClick={() => clear()} style={{ display: "block", width: "100%", marginTop: 10, background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 12px", cursor: "pointer" }}>
            Sepeti Temizle
          </button>
        </div>
      </div>
    </div>
  );
}

const btnQty: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, border: "1px solid #d6d3d1", background: "#fff", cursor: "pointer", fontWeight: 700
};
const qtyInput: React.CSSProperties = {
  width: 48, height: 32, textAlign: "center", border: "1px solid #d6d3d1", borderRadius: 8
};