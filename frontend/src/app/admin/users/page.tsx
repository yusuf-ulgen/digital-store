"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/admin/DataTable";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// Veri Tipi
type AppUser = {
  id: string;
  email: string;
  displayName?: string;
  role?: "Admin" | "Staff" | "Customer";
  createdAt?: any;
  lastLoginAt?: any;
};

type RoleOpt = "All" | "Admin" | "Staff" | "Customer";

export default function UsersPage() {
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [rows, setRows] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtreler
  const [q, setQ] = useState("");
  const [role, setRole] = useState<RoleOpt>("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Şu anki kullanıcı admin mi? (Basit kontrol)
  const [isAdmin, setIsAdmin] = useState(true); // Şimdilik true, auth logic'e göre değişebilir

  // 1. Verileri Firestore'dan Çek
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        // 'users' koleksiyonunu çekiyoruz.
        // NOT: Eğer bu koleksiyon yoksa boş dizi döner.
        const usersRef = collection(db, "users");
        // Hata almamak için orderBy'ı opsiyonel yapabiliriz veya index oluşturmak gerekebilir.
        const qSnap = await getDocs(query(usersRef)); 
        
        const items = qSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AppUser[];

        setAllUsers(items);
      } catch (err) {
        console.error("Kullanıcılar çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // 2. Filtreleme ve Sayfalama
  useEffect(() => {
    let filtered = allUsers;

    // Email araması
    if (q.trim()) {
      filtered = filtered.filter(u => u.email?.toLowerCase().includes(q.toLowerCase()));
    }

    // Rol filtresi
    if (role !== "All") {
      filtered = filtered.filter(u => u.role === role);
    }

    // Sayfalama
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setRows(filtered.slice(start, end));

  }, [allUsers, q, role, page]);


  return (
    <div className="space-y-4">
      {/* Başlık + filtreler */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Kullanıcılar ({allUsers.length})</h2>
        <div className="flex items-end gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-stone-500 mb-1">Email ara</label>
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="ornek@site.com"
              className="w-60 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-stone-500 mb-1">Rol</label>
            <select
              value={role}
              onChange={(e) => {
                setPage(1);
                setRole(e.target.value as RoleOpt);
              }}
              className="w-40 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
            >
              <option value="All">Hepsi</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
          Yükleniyor…
        </div>
      ) : (
        <DataTable<AppUser>
          columns={[
            {
              key: "email",
              header: "Email",
              className: "font-medium",
              render: (r) => r.email,
            },
            {
              key: "displayName",
              header: "Ad Soyad",
              render: (r) => r.displayName ?? "-",
            },
            {
              key: "role",
              header: "Rol",
              className: "w-[120px]",
              render: (r) => {
                const userRole = r.role ?? "Customer";
                const cls =
                  userRole === "Admin"
                    ? "bg-purple-100 text-purple-800"
                    : userRole === "Staff"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-stone-200 text-stone-800";
                return (
                  <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>
                    {userRole}
                  </span>
                );
              },
            },
            {
              key: "lastLoginAt",
              header: "Son Giriş",
              className: "w-[180px]",
              render: (r) =>
                r.lastLoginAt
                  ? new Date(r.lastLoginAt?.seconds * 1000 || r.lastLoginAt).toLocaleDateString()
                  : "-",
            },
            {
              key: "createdAt",
              header: "Kayıt",
              className: "w-[180px]",
              render: (r) =>
                r.createdAt 
                  ? new Date(r.createdAt?.seconds * 1000 || r.createdAt).toLocaleDateString() 
                  : "-",
            },
            {
              key: "actions",
              header: "",
              className: "w-[160px] text-right",
              render: (r) =>
                isAdmin ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Rol değiştirme henüz aktif değil.\nKullanıcı: ${r.email}`);
                    }}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
                  >
                    Rolü Değiştir
                  </button>
                ) : (
                  <span className="text-xs text-stone-400">—</span>
                ),
            },
          ]}
          rows={rows}
          getRowKey={(r) => r.id}
          pagination={{
            page,
            pageSize,
            total: allUsers.length,
            onPageChange: setPage,
          }}
          emptyText="Kullanıcı bulunamadı (Firestore 'users' koleksiyonu boş olabilir)"
        />
      )}
    </div>
  );
}