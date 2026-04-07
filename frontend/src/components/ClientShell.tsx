"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { ShoppingCartIcon, MagnifyingGlassIcon, UserIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/lib/cart"; 
import { CATEGORIES } from "@/lib/constants";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
    router.refresh(); 
  };

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* --- EN ÜST BİLGİ ÇUBUĞU (GÜNCELLENDİ) --- */}
      {/* Arka plan açık (stone-50), yazılar koyu (stone-900) ve kalın */}
      <div className="bg-stone-50 border-b border-stone-200 py-2 text-xs font-bold text-stone-900 tracking-wide">
        <div className="mx-auto max-w-7xl px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <span>0 555 555 55 55</span>
            <span>ulgenpaslanmaz@gmail.com</span>
          </div>
          <div className="hidden sm:block">İNCE İŞÇİLİK & MÜKEMMEL KESKİNLİK</div>
        </div>
      </div>

      {/* --- HEADER --- */}
      <header className="bg-white py-6 border-b border-stone-100 relative z-20">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center gap-6 justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
             <div className="relative h-16 w-48"> 
               <Image 
                 src="/LOGO.png" 
                 alt="Ülgen Paslanmaz Logo" 
                 fill 
                 className="object-contain object-left" 
                 priority 
               />
             </div>
          </Link>

          {/* Arama Çubuğu */}
          <div className="flex-1 w-full max-w-xl relative">
            <input 
              type="text" 
              placeholder="Ürün Ara..." 
              className="w-full bg-stone-50 border border-stone-200 rounded-md py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-stone-400 transition-colors placeholder:text-stone-400"
            />
            <button className="absolute right-0 top-0 h-full w-12 bg-stone-900 rounded-r-md flex items-center justify-center text-white hover:bg-stone-700 transition-colors">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Sağ Menü */}
          <div className="flex items-center gap-8 text-sm font-medium text-stone-700">
            
            {user && (
              <Link href="/admin" className="hover:text-orange-600 transition-colors">
                Admin
              </Link>
            )}

            {/* Giriş / Çıkış Durumu */}
            <div className="flex flex-col items-end leading-tight">
              {loading ? (
                <span className="text-stone-400">...</span>
              ) : user ? (
                <>
                  <span className="text-xs text-stone-500">Merhaba</span>
                  <button 
                    onClick={handleLogout} 
                    className="text-stone-900 hover:text-orange-600 font-bold transition-colors"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <Link href="/login" className="flex items-center gap-2 hover:text-orange-600 group transition-colors">
                  <div className="text-right">
                    <span className="block text-xs text-stone-500 font-normal">Hesabım</span>
                    <span className="font-bold text-stone-900 group-hover:text-orange-600">Giriş Yap</span>
                  </div>
                  <UserIcon className="h-7 w-7 text-stone-400 group-hover:text-orange-600 transition-colors" />
                </Link>
              )}
            </div>

            {/* Sepet */}
            <Link href="/cart" className="relative group">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline font-bold text-stone-900 group-hover:text-orange-600 transition-colors">Sepet</span>
                <div className="relative">
                  <ShoppingCartIcon className="h-7 w-7 text-stone-700 group-hover:text-orange-600 transition-colors" />
                  {count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                      {count}
                    </span>
                  )}
                </div>
              </div>
            </Link>

          </div>
        </div>
      </header>

      {/* --- MENÜ ÇUBUĞU --- */}
      <nav className="bg-stone-900 text-white text-xs font-bold uppercase tracking-widest overflow-x-auto shadow-md">
        <div className="mx-auto max-w-7xl px-4">
          <ul className="flex items-center gap-8 py-3.5 whitespace-nowrap">
            <li><Link href="/" className="hover:text-orange-500 transition-colors">ANA SAYFA</Link></li>
            {CATEGORIES.map((cat) => (
              <li key={cat.value}>
                <Link href={`/products?cat=${cat.value}`} className="hover:text-orange-500 transition-colors">
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>


      {/* --- SAYFA İÇERİĞİ --- */}
      <main className="flex-1 bg-stone-50">
        {children}
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-stone-900 text-stone-400 py-8 mt-auto border-t border-stone-800">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Ülgen Paslanmaz. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}