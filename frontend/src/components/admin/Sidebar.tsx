"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Package, ShoppingCart, Users, FileText } from "lucide-react";

const navItems = [
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/logs", label: "Logs", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-stone-100 h-screen border-r border-stone-200 p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-semibold mb-6 text-stone-800">Admin Panel</h1>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                ${active ? "bg-stone-200 text-stone-900" : "text-stone-600 hover:bg-stone-100"}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mt-8"
      >
        <LogOut size={16} /> Çıkış Yap
      </button>
    </aside>
  );
}
