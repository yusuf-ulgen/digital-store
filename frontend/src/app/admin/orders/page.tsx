"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import OrderFilters, { OrderFilter } from "@/components/admin/OrderFilters";
import StatusBadge from "@/components/admin/StatusBadge";
import { listOrders, type Order, type OrderListParams } from "@/lib/api/orders";

export default function OrdersPage() {
  const router = useRouter();

  // UI state
  const [filters, setFilters] = useState<OrderFilter>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sort] = useState<string>("-createdAt");

  // Data state
  const [rows, setRows] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // backend paramlarını hazırla
  const params: OrderListParams = useMemo(
    () => ({
      q: filters.q || undefined,
      status: (filters.status as any) || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      page,
      pageSize,
      sort,
    }),
    [filters, page, pageSize, sort]
  );

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await listOrders(params);
        if (!alive) return;
        setRows(res.items);
        setTotal(res.total);
      } catch (e: any) {
        if (!alive) return;
        const msg = String(e?.message ?? e);
        setErr(msg);
        setRows([]);
        setTotal(0);
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [params]);

  // filtre değişince sayfayı 1'e çek
  const onFiltersChange = (f: OrderFilter) => {
    setPage(1);
    setFilters(f);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Orders</h2>
      </div>

      <OrderFilters value={filters} onChange={onFiltersChange} />

      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {err.includes("401") || err.toLowerCase().includes("unauthorized")
            ? "Yetkisiz: Lütfen tekrar giriş yap."
            : err.includes("403")
            ? "Erişim reddedildi: Bu işlemi yapmaya yetkin yok."
            : `Hata: ${err}`}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
          Yükleniyor…
        </div>
      ) : (
        <DataTable<Order>
          columns={[
            { key: "id", header: "Order ID", className: "w-[140px] font-medium" },
            {
              key: "customerEmail",
              header: "Müşteri",
              render: (r) => r.customerEmail ?? r.userId,
            },
            {
              key: "total",
              header: "Toplam",
              className: "text-right w-[120px]",
              render: (r) => <span>{(r.total ?? 0).toLocaleString()} ₺</span>,
            },
            {
              key: "status",
              header: "Durum",
              className: "w-[140px]",
              render: (r) => <StatusBadge status={r.status} />,
            },
            {
              key: "createdAt",
              header: "Tarih",
              className: "w-[180px]",
              render: (r) =>
                r.createdAt
                  ? new Date(r.createdAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-",
            },
          ]}
          rows={rows}
          getRowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/admin/orders/${r.id}`)}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
          emptyText="Sipariş bulunamadı"
        />
      )}
    </div>
  );
}
