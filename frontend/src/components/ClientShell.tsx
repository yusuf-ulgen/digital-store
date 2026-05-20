"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useCart } from "@/lib/cart";
import { CATEGORIES } from "@/lib/constants";
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

  // Sayfa değişince mobil menüyü kapat
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">

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
      <header className="sticky top-0 z-50 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between gap-3 h-16 md:h-18">

            {/* — Sol: Hamburger (sadece mobile) + Logo — */}
            <div className="flex items-center gap-3">
              {/* Hamburger Butonu */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-1 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
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

            {/* — Orta: Arama (tablet & desktop) — */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-xl items-center relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün, kategori veya marka ara..."
                className="w-full h-10 pl-4 pr-11 rounded-full border border-stone-200 bg-stone-50 focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 outline-none text-sm transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-stone-950 text-white hover:bg-stone-800 transition-colors"
              >
                <Search size={14} />
              </button>
            </form>

            {/* — Sağ: Kullanıcı + Sepet — */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Arama ikonu (sadece mobile) */}
              <button
                onClick={() => {
                  setMobileMenuOpen(true);
                }}
                className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Ara"
              >
                <Search size={20} />
              </button>

              {/* Panel linki */}
              {user && (
                <Link
                  href="/admin"
                  className="hidden lg:block text-[10px] font-bold text-stone-400 hover:text-stone-950 tracking-widest uppercase transition-colors px-2"
                >
                  PANEL
                </Link>
              )}

              {/* Kullanıcı */}
              {!loading && (
                <div className="hidden sm:block">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-colors group"
                    >
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Hesap</div>
                        <div className="text-xs font-bold text-stone-900">Çıkış</div>
                      </div>
                      <LogOut size={16} className="text-stone-400 group-hover:text-stone-900" />
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-colors group"
                    >
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Merhaba</div>
                        <div className="text-xs font-bold text-stone-900">Giriş Yap</div>
                      </div>
                      <UserIcon size={18} className="text-stone-400 group-hover:text-stone-900" />
                    </Link>
                  )}
                </div>
              )}

              {/* Sepet Butonu */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-stone-950 text-white hover:bg-stone-800 transition-all hover:scale-105 active:scale-95"
                aria-label="Sepet"
              >
                <ShoppingCart size={18} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-0.5 flex items-center justify-center bg-white text-stone-950 text-[9px] font-bold rounded-full border-[1.5px] border-stone-950">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* — Desktop Kategori Navigasyonu — */}
          <nav className="hidden lg:block border-t border-stone-100">
            <ul className="flex items-center gap-1 py-2 overflow-x-auto no-scrollbar">
              <li>
                <Link
                  href="/"
                  className="px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-stone-500 hover:text-stone-950 rounded-lg hover:bg-stone-50 transition-all whitespace-nowrap"
                >
                  Ana Sayfa
                </Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.value}>
                  <Link
                    href={`/products?cat=${cat.value}`}
                    className="px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-stone-500 hover:text-stone-950 rounded-lg hover:bg-stone-50 transition-all whitespace-nowrap flex items-center gap-0.5 group"
                  >
                    {cat.label}
                    <ChevronRight size={9} className="opacity-0 group-hover:opacity-40 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* — Tablet Kategori Navigasyonu (md-lg arası) — */}
          <nav className="hidden md:flex lg:hidden border-t border-stone-100 overflow-x-auto no-scrollbar">
            <ul className="flex items-center gap-1 py-1.5 whitespace-nowrap">
              <li>
                <Link href="/" className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-stone-500 hover:text-stone-950 rounded-lg hover:bg-stone-50 transition-all">
                  Ana Sayfa
                </Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.value}>
                  <Link
                    href={`/products?cat=${cat.value}`}
                    className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-stone-500 hover:text-stone-950 rounded-lg hover:bg-stone-50 transition-all"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
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
      <main className="flex-1 bg-white">
        {children}
      </main>

      {/* ══════════════════════════════════════════════════
          FOOTER — ClientShell'deki basit footer
          (Gerçek Footer bileşeni varsa onu kullan)
      ══════════════════════════════════════════════════ */}
    </div>
  );
}