import "@/app/globals.css";
import Guard from "@/components/admin/Guard";
import Sidebar from "@/components/admin/Sidebar";

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
