"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useCart } from "@/lib/cart";
import { CATEGORIES } from "@/lib/constants";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import {
  ShoppingCart,
  Search,
  User as UserIcon,
  Menu,
  X,
  Phone,
  Mail,
  ChevronRight,
  LogOut,
} from "lucide-react";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith("/admin");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sayfa değişince mobil menüyü ve aramayı kapat
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Klavye Escape tuşu ile aramayı kapatma ve arka plan kilitleme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  // Mobil menü açıkken scroll kilitle
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?query=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const headerTabs = [
    {
      title: "Ara",
      icon: Search,
      onClick: () => setIsSearchOpen(true),
    },
    {
      title: user ? "Çıkış" : "Giriş",
      icon: user ? LogOut : UserIcon,
      onClick: () => {
        if (user) {
          handleLogout();
        } else {
          router.push("/login");
        }
      },
    },
    {
      title: "Sepet",
      icon: ShoppingCart,
      badge: count > 0 ? (
        <span className="min-w-[15px] h-[15px] px-0.5 flex items-center justify-center bg-stone-950 text-white text-[8px] font-black rounded-full border border-white leading-none">
          {count}
        </span>
      ) : null,
      onClick: () => router.push("/cart"),
    },
  ];

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">

      {/* ══════════════════════════════════════════════════
          DUYURU ÇUBUĞU — Tüm ekranlarda görünür
      ══════════════════════════════════════════════════ */}
      <div className="w-full bg-stone-950 text-white py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[10px] font-medium tracking-[0.15em] uppercase">
          <div className="hidden sm:flex items-center gap-4">
            <a href="tel:05555555555" className="flex items-center gap-1.5 hover:text-stone-300 transition-colors">
              <Phone size={10} />
              0 555 555 55 55
            </a>
            <a href="mailto:ulgenpaslanmaz@gmail.com" className="flex items-center gap-1.5 hover:text-stone-300 transition-colors">
              <Mail size={10} />
              ulgenpaslanmaz@gmail.com
            </a>
          </div>
          <div className="w-full text-center sm:w-auto sm:text-right animate-pulse">
            ÜCRETSİZ KARGO — TÜM ÜRÜNLERDE
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ANA HEADER
      ══════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-stone-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between gap-4 h-16 md:h-18">

            {/* — Sol: Hamburger + Logo — */}
            <div className="flex items-center gap-3">
              {/* Hamburger Butonu */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-1 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors"
                aria-label="Menüyü Aç"
              >
                <Menu size={22} />
              </button>

              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                <Image
                  src="/LOGO.png"
                  alt="Ülgen Paslanmaz"
                  width={80}
                  height={80}
                  priority
                  className="h-11 w-auto object-contain"
                />
              </Link>
            </div>

            {/* — Orta: Kategori Linkleri (Sadece Desktop/lg ve üzeri) — */}
            <nav className="hidden lg:flex items-center justify-center flex-1">
              <ul className="flex items-center gap-1.5">
                <li>
                  <Link
                    href="/"
                    className="px-3.5 py-2 text-[11px] font-bold tracking-widest uppercase text-stone-500 hover:text-stone-950 rounded-xl hover:bg-stone-50 transition-all whitespace-nowrap"
                  >
                    Ana Sayfa
                  </Link>
                </li>
                {CATEGORIES.map((cat) => (
                  <li key={cat.value}>
                    <Link
                      href={`/products?cat=${cat.value}`}
                      className="px-3.5 py-2 text-[11px] font-bold tracking-widest uppercase text-stone-500 hover:text-stone-950 rounded-xl hover:bg-stone-50 transition-all whitespace-nowrap"
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* — Sağ: Kontrol İkonları (Arama, Giriş Yap, Sepet) — */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Panel Linki (Admin kullanıcılar için) */}
              {user && (
                <Link
                  href="/admin"
                  className="hidden lg:block text-[10px] font-bold text-stone-400 hover:text-stone-950 tracking-widest uppercase transition-colors px-2"
                >
                  PANEL
                </Link>
              )}

              {/* Expandable Tabs Arayüzü */}
              <ExpandableTabs tabs={headerTabs} />
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          MOBİL MENÜ DRAWER
      ══════════════════════════════════════════════════ */}
      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 left-0 z-[70] h-full w-[min(320px,85vw)] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <Image src="/LOGO.png" alt="Ülgen Paslanmaz" width={60} height={60} className="h-10 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Arama */}
        <div className="px-4 py-3 border-b border-stone-100">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full h-10 pl-4 pr-10 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-stone-900 outline-none text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 w-6 h-6 flex items-center justify-center rounded-full bg-stone-950 text-white"
            >
              <Search size={12} />
            </button>
          </form>
        </div>

        {/* Drawer Nav Links */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest px-3 mb-2">Kategoriler</div>
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition-colors"
              >
                Ana Sayfa
                <ChevronRight size={14} className="text-stone-300" />
              </Link>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.value}>
                <Link
                  href={`/products?cat=${cat.value}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition-colors"
                >
                  {cat.label}
                  <ChevronRight size={14} className="text-stone-300" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Drawer Alt Kısım: Kullanıcı & Sepet */}
        <div className="border-t border-stone-100 px-4 py-4 space-y-2">
          <Link
            href="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-stone-950 text-white font-semibold text-sm hover:bg-stone-800 transition-colors"
          >
            <ShoppingCart size={18} />
            Sepet
            {count > 0 && (
              <span className="ml-auto bg-white text-stone-950 text-xs font-bold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </Link>

          {!loading && (
            user ? (
              <div className="space-y-2">
                {user && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-stone-100 text-stone-800 font-semibold text-sm hover:bg-stone-200 transition-colors"
                  >
                    Admin Panel
                    <ChevronRight size={14} className="ml-auto" />
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 font-semibold text-sm hover:bg-stone-100 transition-colors"
                >
                  <LogOut size={16} />
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-stone-100 text-stone-800 font-semibold text-sm hover:bg-stone-200 transition-colors"
              >
                <UserIcon size={16} />
                Giriş Yap
              </Link>
            )
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SAYFA İÇERİĞİ
      ══════════════════════════════════════════════════ */}
      <main className="flex-1 bg-stone-50">
        {children}
      </main>

      {/* ══════════════════════════════════════════════════
          ARAMA OVERLAY MODAL
      ══════════════════════════════════════════════════ */}
      {isSearchOpen && (
        <div 
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 z-[100] bg-stone-950/45 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-in fade-in-0 duration-300"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 border border-stone-100 transform transition-all duration-300 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Hızlı Arama</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(e);
                setIsSearchOpen(false);
              }} 
              className="relative flex items-center"
            >
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün, kategori veya marka ara..."
                className="w-full h-12 pl-4 pr-12 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-stone-900 outline-none text-base transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center rounded-xl bg-stone-950 text-white hover:bg-stone-800 transition-colors"
              >
                <Search size={16} />
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mr-1">Popüler:</span>
              <button onClick={() => { setSearchQuery("Şef"); router.push("/products?query=%C5%9Eef"); setIsSearchOpen(false); }} className="text-xs px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 transition-all font-semibold border border-stone-100">Şef Bıçağı</button>
              <button onClick={() => { setSearchQuery("Kasap"); router.push("/products?query=Kasap"); setIsSearchOpen(false); }} className="text-xs px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 transition-all font-semibold border border-stone-100">Kasap</button>
              <button onClick={() => { setSearchQuery("Outdoor"); router.push("/products?query=Outdoor"); setIsSearchOpen(false); }} className="text-xs px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 transition-all font-semibold border border-stone-100">Outdoor</button>
              <button onClick={() => { setSearchQuery("Bileyici"); router.push("/products?query=Bileyici"); setIsSearchOpen(false); }} className="text-xs px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 transition-all font-semibold border border-stone-100">Masat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}