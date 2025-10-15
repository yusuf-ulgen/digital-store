"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type CSSProperties,
} from "react";
import { useCart } from "@/lib/cart";

// 🔧 Tek yerden import et; tekrarını SİL
import { getToken, clearToken, logout as doLogout } from "@/lib/auth";

/* ---- Kısa stil yardımcıları ---- */
const container: CSSProperties = { maxWidth: "1280px", margin: "0 auto", padding: "0 16px" };
const rowBetween: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between" };
const rowCenter: CSSProperties = { display: "flex", alignItems: "center" };

const SEARCH_LS = "ulgen.searchHistory.v1";

/* ---- Üst bilgilendirme şeritleri ---- */
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

/* ---- Ana Header: Logo + Arama + Giriş/Sepet ---- */
function MainHeader() {
  const router = useRouter();
  const { count } = useCart();

  const handleLogout = async () => {
  await doLogout();             // Firebase signOut + localStorage temizliği + "auth:changed" event
  setHasToken(!!getToken());    // state'i yenile
  router.push("/login");
};

  /* Token durumu (Giriş Yap / Çıkış Yap) */
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
  const refresh = () => setHasToken(!!getToken());
  refresh();
  window.addEventListener("storage", refresh);
  window.addEventListener("auth:changed", refresh);
  return () => {
    window.removeEventListener("storage", refresh);
    window.removeEventListener("auth:changed", refresh);
  };
}, []);

  /* Logo modal */
  const [showLogo, setShowLogo] = useState(false);
  useEffect(() => {
    if (!showLogo) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowLogo(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLogo]);

  /* Arama kutusu (site-içi geçmiş) */
  const [q, setQ] = useState("");
  const [openSug, setOpenSug] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const history = useMemo<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SEARCH_LS) || "[]");
    } catch {
      return [];
    }
  }, [openSug]); // açılınca yeniden oku

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpenSug(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const saveSearch = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const prev = (() => {
      try {
        return JSON.parse(localStorage.getItem(SEARCH_LS) || "[]");
      } catch {
        return [];
      }
    })() as string[];
    const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8);
    localStorage.setItem(SEARCH_LS, JSON.stringify(next));
  };

  const onSearch = (e?: FormEvent) => {
    e?.preventDefault();
    const term = q.trim();
    if (!term) return;
    saveSearch(term);
    setOpenSug(false);
    router.push(`/products?query=${encodeURIComponent(term)}`);
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
        {/* Sol: Logo (modal + anasayfa davranışı) */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link
            href="/"
            aria-label="ÜLGEN Paslanmaz anasayfa"
            onClick={(e) => {
              // Ctrl/⌘ tık ile anasayfa, normal tık ile modal
              if (e.metaKey || e.ctrlKey) return;
              e.preventDefault();
              setShowLogo(true);
            }}
            title="Logo büyüt (Anasayfa için Ctrl/⌘ ile tıkla)"
            style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", cursor: "zoom-in" }}
          >
            <Image
              src="/LOGO.png"
              alt="ÜLGEN Paslanmaz"
              width={185}
              height={120}
              priority
              style={{ height: 90, width: "auto", objectFit: "contain" }}
            />
          </Link>
        </div>

        {/* Orta: Arama (yalnızca site-içi geçmiş) */}
        <div style={{ flex: "1 1 540px" }} ref={boxRef}>
          <form onSubmit={onSearch} style={{ display: "flex", position: "relative" }} autoComplete="off">
            <label htmlFor="q" style={{ position: "absolute", left: -9999 }}>
              Ürün Ara
            </label>
            <input
              id="q"
              name="ulgen-search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpenSug(true);
              }}
              onFocus={() => setOpenSug(true)}
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

            {/* Öneriler */}
            {openSug && history.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 58,
                  left: 0,
                  right: 0,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "6px",
                  boxShadow: "0 8px 30px rgba(0,0,0,.08)",
                  zIndex: 10,
                }}
              >
                {history
                  .filter((h) => !q || h.toLowerCase().includes(q.toLowerCase()))
                  .map((h, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => {
                        setQ(h);
                        onSearch();
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {h}
                    </button>
                  ))}
                <div style={{ height: 1, background: "#eee", margin: "4px 6px" }} />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(SEARCH_LS);
                    setOpenSug(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "center",
                    padding: "8px 12px",
                    fontSize: 12,
                    color: "#6b7280",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  Geçmişi temizle
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Sağ: Giriş/Çıkış + Admin + Sepet */}
        <div style={{ ...rowCenter, gap: 24 }}>
          <Link
            href="/admin"
            style={{ color: "#111827", textDecoration: "none", fontSize: 15, fontWeight: 600 }}
          >
            Admin
          </Link>

          {hasToken ? (
            <button
              onClick={handleLogout}
              style={{
                color: "#111827",
                textDecoration: "none",
                fontSize: 15,
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.1,
                alignItems: "flex-start",
                background: "transparent",
                border: "1px solid #e5e7eb",
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
              }}
              title="Oturumu kapat"
            >
              <span style={{ color: "#6b7280", fontSize: 13, marginBottom: 2 }}>Merhaba</span>
              <span style={{ fontWeight: 600 }}>Çıkış Yap</span>
            </button>
          ) : (
            <Link
              href="/login"
              style={{
                color: "#111827",
                textDecoration: "none",
                fontSize: 15,
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.1,
                alignItems: "flex-start",
              }}
            >
              <span style={{ color: "#6b7280", fontSize: 13, marginBottom: 2 }}>Merhaba</span>
              <span style={{ fontWeight: 600 }}>Giriş Yap</span>
            </Link>
          )}

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
              {typeof count === "number" ? count : 0}
            </span>
          </Link>
        </div>
      </div>

      {/* LOGO MODAL */}
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLogo(false);
            }}
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

/* ---- Ana Navigasyon ---- */
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
              <Link href={it.href} style={{ color: "#ffffff", textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/* ---- Dışa Açık Header ---- */
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
