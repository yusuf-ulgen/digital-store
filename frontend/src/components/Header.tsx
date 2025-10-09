"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const path = usePathname();
  const Nav = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-xl hover:bg-stone-100 ${
        path === href ? "font-semibold underline" : ""
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-stone-200 bg-[var(--card)]">
      <div className="container-tight flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold">Focus</Link>
        <nav className="flex items-center gap-1">
          <Nav href="/" label="Ana Sayfa" />
          <Nav href="/products" label="Şef Bıçağı" />
          <Nav href="/login" label="Giriş" />
        </nav>
      </div>
    </header>
  );
}
