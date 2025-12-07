"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// İkonlar (Lucide benzeri SVG'ler)
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const OrdersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ProductsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const LogsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();

  // Hangi linkin aktif olduğunu anlamak için yardımcı fonksiyon
  const isActive = (path: string) => {
    // Tam eşleşme veya alt sayfa kontrolü (örn: /admin/products ve /admin/products/edit)
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: <HomeIcon /> },
    { name: "Orders", href: "/admin/orders", icon: <OrdersIcon /> },
    { name: "Products", href: "/admin/products", icon: <ProductsIcon /> },
    { name: "Users", href: "/admin/users", icon: <UsersIcon /> },
    { name: "Logs", href: "/admin/logs", icon: <LogsIcon /> },
  ];

  return (
    // DÜZELTME 1: 'min-h-screen' ekledik. Bu sayede sidebar en az ekran boyu kadar olur ve kesilmez.
    <aside className="w-64 bg-white border-r border-stone-200 min-h-screen flex flex-col flex-shrink-0">
      
      {/* DÜZELTME 2: Başlığı Link içine aldık */}
      <div className="p-6 border-b border-stone-100">
        <Link href="/admin" className="block">
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight cursor-pointer hover:text-orange-600 transition-colors">
            Admin Panel
          </h2>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          
          // Dashboard ('/admin') sadece tam eşleşmede aktif olsun, diğerleri alt yollarda da aktif olsun
          const isSelected = item.href === "/admin" 
            ? pathname === "/admin" 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-stone-900 text-white shadow-md"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Alt Kısım (Opsiyonel: Çıkış yap veya versiyon bilgisi) */}
      <div className="p-4 border-t border-stone-100 text-xs text-stone-400 text-center">
        v1.0.0
      </div>
    </aside>
  );
}