"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import { listUsers, type AppUser, type UserListParams } from "@/lib/api/users";
import { getDecodedToken, extractRole } from "@/lib/auth";

type RoleOpt = "All" | "Admin" | "Staff" | "Customer";

export default function UsersPage() {
  // filtre / sayfalama
  const [q, setQ] = useState("");
  const [role, setRole] = useState<RoleOpt>("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // liste state
  const [rows, setRows] = useState<AppUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // current user role (buton görünürlüğü için)
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const dt = await getDecodedToken();
      const r = extractRole(dt);
      setIsAdmin(r === "Admin");
    })();
  }, []);

  const params: UserListParams = useMemo(
    () => ({
      q: q || undefined,
      role: role === "All" ? undefined : role,
      page,
      pageSize,
    }),
    [q, role, page, pageSize]
  );

  const reload = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await listUsers(params);
      setRows(res.items);
      setTotal(res.total);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="space-y-4">
      {/* Başlık + filtreler */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Users</h2>
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

      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {err.includes("401") || err.toLowerCase().includes("unauthorized")
            ? "Yetkisiz: Lütfen tekrar giriş yap."
            : err.includes("403")
            ? "Erişim reddedildi."
            : `Hata: ${err}`}
        </div>
      )}

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
                const role = r.role ?? "Customer";
                const cls =
                  role === "Admin"
                    ? "bg-purple-100 text-purple-800"
                    : role === "Staff"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-stone-200 text-stone-800";
                return (
                  <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>
                    {role}
                  </span>
                );
              },
            },
            {
              key: "ordersCount",
              header: "Sipariş",
              className: "text-right w-[90px]",
              render: (r) => (r.ordersCount ?? 0).toLocaleString(),
            },
            {
              key: "lastLoginAt",
              header: "Son Giriş",
              className: "w-[180px]",
              render: (r) =>
                r.lastLoginAt
                  ? new Date(r.lastLoginAt).toLocaleString()
                  : "-",
            },
            {
              key: "createdAt",
              header: "Kayıt",
              className: "w-[180px]",
              render: (r) =>
                r.createdAt ? new Date(r.createdAt).toLocaleString() : "-",
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
                      alert(
                        `Rol değiştirme endpoint'i şu an hazır değil.\n` +
                          `Kullanıcı: ${r.email}\nMevcut rol: ${r.role ?? "Customer"}`
                      );
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
            total,
            onPageChange: setPage,
          }}
          emptyText="Kullanıcı bulunamadı"
        />
      )}
    </div>
  );
}
