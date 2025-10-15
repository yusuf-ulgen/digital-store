// src/app/admin/layout.tsx
import Guard from "@/components/admin/Guard";
import Sidebar from "@/components/admin/Sidebar";
// global css'ler zaten root layout'ta import ediliyor; tekrar etmene gerek yok.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard>
      <div className="flex min-h-screen bg-stone-50 text-stone-800">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </Guard>
  );
}
