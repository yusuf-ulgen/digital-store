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
} from "react";
import { useCart } from "@/lib/cart";
import { getToken, logout as doLogout } from "@/lib/auth";
import { 
  Search, 
  ShoppingCart, 
  User, 
  LogOut, 
  Phone, 
  Mail, 
  ChevronRight,
  Menu,
  X
} from "lucide-react";

/* ---- Logo Bileşeni ---- */
function UlgenLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/LOGO.png"
      alt="Ülgen Paslanmaz"
      width={120}
      height={120}
      priority
      className={className}
    />
  );
}

const SEARCH_LS = "ulgen.searchHistory.v1";

/* ---- Üst bilgilendirme şeritleri ---- */
function AnnouncementBar() {
  return (
    <div className="w-full bg-black text-white py-1.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-[10px] uppercase tracking-[0.2em] font-medium whitespace-nowrap animate-pulse">
          TÜM ÜRÜNLERDE ÜCRETSİZ &amp; HIZLI KARGO — SINIRLI SÜRE!
        </p>
      </div>
    </div>
  );
}

function TopInfoRow() {
  return (
    <div className="w-full bg-gray-50 text-gray-500 border-b border-gray-200 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-2 text-xs">
        <div className="flex items-center gap-6">
          {/* Telefon Linki */}
          <a
            href="tel:05555555555"
            className="flex items-center gap-1.5 hover:text-black transition-colors"
          >
            <Phone size={12} />
            <span>0 555 555 55 55</span>
          </a>

          {/* Mail Linki */}
          <a
            href="mailto:ulgenpaslanmaz@gmail.com"
            className="flex items-center gap-1.5 hover:text-black transition-colors"
          >
            <Mail size={12} />
            <span>ulgenpaslanmaz@gmail.com</span>
          </a>
        </div>
        
        {/* Slogan */}
        <div className="text-gray-900 font-bold tracking-widest uppercase">
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
    await doLogout();
    setHasToken(!!getToken());
    router.push("/login");
  };

  /* Token durumu */
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

  /* Arama kutusu */
  const [q, setQ] = useState("");
  const [openSug, setOpenSug] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const history = useMemo<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SEARCH_LS) || "[]");
    } catch {
      return [];
    }
  }, [openSug]);

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
    <div className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Sol: Logo */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="block hover:opacity-80 transition-opacity"
          >
            <UlgenLogo className="h-12 md:h-14 w-auto object-contain" />
          </Link>
        </div>

        {/* Orta: Arama */}
        <div className="flex-1 max-w-2xl hidden md:block" ref={boxRef}>
          <form onSubmit={onSearch} className="relative group">
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpenSug(true);
              }}
              onFocus={() => setOpenSug(true)}
              placeholder="Kusursuz keskinliği arayın..."
              className="w-full h-11 pl-5 pr-12 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all outline-none text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1 h-9 w-9 flex items-center justify-center rounded-full bg-gray-950 text-white hover:bg-black transition-colors"
            >
              <Search size={18} />
            </button>

            {/* Öneriler */}
            {openSug && history.length > 0 && (
              <div className="absolute top-14 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Son Aramalar</div>
                {history
                  .filter((h) => !q || h.toLowerCase().includes(q.toLowerCase()))
                  .map((h, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => { setQ(h); onSearch(); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-3 transition-colors text-sm"
                    >
                      <Search size={14} className="text-gray-300" />
                      {h}
                    </button>
                  ))}
                <div className="h-px bg-gray-100 my-2 mx-1" />
                <button
                  type="button"
                  onClick={() => { localStorage.removeItem(SEARCH_LS); setOpenSug(false); }}
                  className="w-full py-2 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium "
                >
                  Geçmişi temizle
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Sağ: İkonlar */}
        <div className="flex items-center gap-2 md:gap-5">
          <Link href="/admin" className="hidden lg:block text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
            PANEL
          </Link>

          <div className="h-8 w-px bg-gray-100 hidden lg:block" />

          {hasToken ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 group px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Hesap</div>
                <div className="text-xs font-bold">Çıkış Yap</div>
              </div>
              <LogOut size={20} className="text-gray-400 group-hover:text-black" />
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 group px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Merhaba</div>
                <div className="text-xs font-bold">Giriş Yap</div>
              </div>
              <User size={20} className="text-gray-400 group-hover:text-black" />
            </Link>
          )}

          <Link href="/cart" className="relative p-2.5 rounded-xl bg-gray-950 text-white hover:bg-black transition-all hover:scale-105 active:scale-95">
            <ShoppingCart size={20} />
            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center bg-white text-gray-950 text-[10px] font-bold rounded-full border-2 border-gray-950">
              {typeof count === "number" ? count : 0}
            </span>
          </Link>
          
          <button className="md:hidden p-2 text-gray-900">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* LOGO MODAL Kaldırıldı — artık SVG inline */}
    </div>
  );
}

/* ---- Ana Navigasyon ---- */
function MainNav() {
  const items = [
    { href: "/", label: "ANA SAYFA" },
    { href: "/products?cat=bicaklar", label: "BIÇAKLAR" },
    { href: "/products?cat=bicak-seti", label: "BIÇAK SETİ" },
    { href: "/products?cat=sef-bicagi", label: "ŞEF BIÇAĞI" },
    { href: "/products?cat=outdoor", label: "OUTDOOR" },
    { href: "/products?cat=kasap", label: "KASAP" },
    { href: "/products?cat=satirlar", label: "SATIRLAR" },
    { href: "/products?cat=bileyici-masat", label: "BİLEYİCİ & MASAT" },
  ];

  return (
    <nav className="w-full bg-white border-b border-gray-100 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-6 py-2.5 whitespace-nowrap">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="text-[11px] font-bold text-stone-500 hover:text-stone-950 tracking-[0.14em] transition-colors flex items-center gap-0.5 group relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-stone-950 after:transition-all hover:after:w-full"
              >
                {it.label}
                {it.href.includes("cat") ? <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform opacity-30" /> : null}
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
    <header className="sticky top-0 z-50 w-full shadow-sm">
      <AnnouncementBar />
      <TopInfoRow />
      <MainHeader />
      <MainNav />
    </header>
  );
}
