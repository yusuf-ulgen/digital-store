"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

/* Kısa stil yardımcıları (Tailwind yok) */
const container: React.CSSProperties = {
  maxWidth: "1280px", /* ~ 2xl */
  margin: "0 auto",
  padding: "0 16px",
};
const rowBetween: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};
const rowCenter: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

function AnnouncementBar() {
  return (
    <div style={{ width: "100%", background: "#000000", color: "#ffffff" }}>
      <div style={{ ...container, padding: "0.1px 16px" }}>
        <p style={{ textAlign: "center", fontSize: "10px", letterSpacing: "0.02em" }}>
          TÜM ÜRÜNLERDE ÜCRETSİZ &amp; HIZLI KARGO
        </p>
      </div>
    </div>
  );
}

function TopInfoRow() {
  return (
    <div style={{ width: "100%", background: "#f7f8fa", color: "#6b7280" }}>
      <div style={{ ...container, ...rowBetween, padding: "8px 16px" }}>
        <div style={{ ...rowCenter, gap: 24 }}>
          <a href="tel:05555555555" style={{ color: "#6b7280", textDecoration: "none" }}>
            0 555 555 55 55
          </a>
          <a href="mailto:ulgenpaslanmaz@gmail.com" style={{ color: "#6b7280", textDecoration: "none" }}>
            ulgenpaslanmaz@gmail.com
          </a>
        </div>
        <div style={{ color: "#1f2937", fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>
          İNCE İŞÇİLİK & MÜKEMMEL KESKİNLİK
        </div>
      </div>
    </div>
  );
}

function MainHeader() {
  const router = useRouter();
  const [showLogo, setShowLogo] = useState(false);

  // Esc ile kapatma
  useEffect(() => {
    if (!showLogo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLogo(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLogo]);

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") || "").trim();
    if (q) router.push(`/products?query=${encodeURIComponent(q)}`);
  };

  return (
    <div style={{ width: "100%", background: "#ffffff" }}>
      <div
        style={{
          ...container,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          padding: "20px 16px",
        }}
      >
        {/* Sol: Marka (LOGO) */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link
            href="/"
            aria-label="ÜLGEN Paslanmaz anasayfa"
            onClick={(e) => {
              e.preventDefault(); // anasayfaya gitme, modal aç
              setShowLogo(true);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
              cursor: "zoom-in",
            }}
          >
            <Image
              src="/LOGO.png"          // public/LOGO.png
              alt="ÜLGEN Paslanmaz"
              width={185}
              height={120}
              priority
              style={{
                height: 90,
                width: "auto",
                objectFit: "contain",
              }}
            />
          </Link>
        </div>

        {/* Orta: Arama */}
        <div style={{ flex: "1 1 540px" }}>
          <form onSubmit={onSearch} style={{ display: "flex" }}>
            <label htmlFor="q" style={{ position: "absolute", left: -9999 }}>Ürün Ara</label>
            <input
              id="q"
              name="q"
              placeholder="Ürün Ara..."
              style={{
                flex: 1,
                height: 56,
                border: "1px solid #d1d5db",
                borderRight: "none",
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
                background: "#f6f7f9",
                padding: "0 14px",
                fontSize: 15,
                outline: "none",
              }}
            />
            <button
              type="submit"
              aria-label="Ara"
              style={{
                height: 56,
                padding: "0 20px",
                border: "1px solid #d1d5db",
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                background: "#2b2b2b",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              🔍
            </button>
          </form>
        </div>

        {/* Sağ: Giriş / Sepet */}
        <div style={{ ...rowCenter, gap: 24 }}>
          <Link href="/login" style={{ color: "#111827", textDecoration: "none", fontSize: 15 }}>
            <span style={{ color: "#6b7280" }}>Merhaba</span> <span style={{ fontWeight: 600 }}>Giriş Yap</span>
          </Link>

          <Link href="/cart" style={{ position: "relative", color: "#111827", textDecoration: "none", fontSize: 15 }}>
            Sepet
            <span
              style={{
                position: "absolute",
                top: -10,
                right: -14,
                background: "#ef4444",
                color: "#ffffff",
                borderRadius: 999,
                fontSize: 11,
                lineHeight: 1,
                padding: "4px 6px",
              }}
            >
              0
            </span>
          </Link>
        </div>
      </div>

      {/* LOGO MODALI */}
      {showLogo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Logo önizleme"
          onClick={() => setShowLogo(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          {/* KAPAT (X) */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowLogo(false); }}
            aria-label="Kapat"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.35)",
              background: "rgba(0,0,0,0.25)",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: 24,
              lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* İç kutu: tıklanınca kapanmasın */}
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "92vw", maxHeight: "86vh" }}>
            <Image
              src="/LOGO.png"
              alt="ÜLGEN Paslanmaz logo büyük"
              width={1400}
              height={800}
              priority
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
                boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
                borderRadius: 12,
                background: "#111111",
                padding: 16,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MainNav() {
  const items = [
    { href: "/", label: "ANA SAYFA" },
    { href: "/products?cat=bicaklar", label: "BIÇAKLAR ›" },
    { href: "/products?cat=bicak-seti", label: "BIÇAK SETİ" },
    { href: "/products?cat=sef-bicagi", label: "ŞEF BIÇAĞI" },
    { href: "/products?cat=outdoor", label: "OUTDOOR" },
    { href: "/products?cat=kasap", label: "KASAP ›" },
    { href: "/products?cat=satirlar", label: "SATIRLAR" },
    { href: "/products?cat=bileyici-masat", label: "BİLEYİCİ & MASATLAR" },
  ];

  return (
    <nav style={{ width: "100%", background: "#000000", color: "#ffffff" }}>
      <div style={{ ...container }}>
        <ul
          style={{
            ...rowCenter,
            gap: 32,
            padding: "12px 0",
            listStyle: "none",
            margin: 0,
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                style={{ color: "#ffffff", textDecoration: "none", fontWeight: 600, fontSize: 15 }}
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        boxShadow: "0 1px 2px rgba(0,0,0,.06)",
        background: "#ffffff",
      }}
    >
      <AnnouncementBar />
      <TopInfoRow />
      <MainHeader />
      <MainNav />
    </header>
  );
}
