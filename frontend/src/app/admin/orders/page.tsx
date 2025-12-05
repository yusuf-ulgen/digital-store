"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import OrderFilters, { OrderFilter } from "@/components/admin/OrderFilters";
import StatusBadge from "@/components/admin/StatusBadge";
// Firebase importları
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

// Veri tipi (Order)
type Order = {
  id: string;
  userId?: string;
  customerEmail?: string;
  total?: number;
  status?: string;
  items?: any[];
  createdAt?: any;
};

export default function OrdersPage() {
  const router = useRouter();

  // State
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtreler
  const [filters, setFilters] = useState<OrderFilter>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 1. Firebase'den Verileri Canlı Çek
  useEffect(() => {
    setLoading(true);
    // 'orders' koleksiyonunu tarihe göre sıralı çek
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      
      setAllOrders(items);
      setLoading(false);
    }, (error) => {
      console.error("Siparişleri çekerken hata:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Filtreleme ve Sayfalama
  useEffect(() => {
    let filtered = allOrders;

    // Arama (Sipariş ID veya Email)
    if (filters.q?.trim()) {
      const qLower = filters.q.toLowerCase();
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(qLower) || 
        (o.customerEmail || "").toLowerCase().includes(qLower)
      );
    }

    // Durum Filtresi
    if (filters.status && filters.status !== "All") { // "All" veya boşsa filtreleme yapma
       filtered = filtered.filter(o => o.status === filters.status);
    }

    // Tarih Filtresi (Basit Mantık)
    if (filters.from) {
        const fromDate = new Date(filters.from).getTime();
        filtered = filtered.filter(o => {
            const oDate = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : new Date(o.createdAt).getTime();
            return oDate >= fromDate;
        });
    }
    if (filters.to) {
        const toDate = new Date(filters.to).getTime();
        filtered = filtered.filter(o => {
            const oDate = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : new Date(o.createdAt).getTime();
            return oDate <= toDate;
        });
    }

    // Sayfalama
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setRows(filtered.slice(start, end));

  }, [allOrders, filters, page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Siparişler ({allOrders.length})</h2>
      </div>

      <OrderFilters value={filters} onChange={(f) => { setPage(1); setFilters(f); }} />

      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
          Yükleniyor…
        </div>
      ) : (
        <DataTable<Order>
          columns={[
            { key: "id", header: "Sipariş ID", className: "w-[140px] font-medium" },
            {
              key: "customerEmail",
              header: "Müşteri",
              render: (r) => r.customerEmail ?? r.userId ?? "Misafir",
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
              render: (r) => <StatusBadge status={r.status || "Pending"} />,
            },
            {
              key: "createdAt",
              header: "Tarih",
              className: "w-[180px]",
              render: (r) => {
                if (!r.createdAt) return "-";
                // Firestore timestamp kontrolü
                const date = r.createdAt.seconds 
                    ? new Date(r.createdAt.seconds * 1000) 
                    : new Date(r.createdAt);
                return date.toLocaleString();
              },
            },
          ]}
          rows={rows}
          getRowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/admin/orders/${r.id}`)}
          pagination={{
            page,
            pageSize,
            total: allOrders.length, // Basitlik için toplam sayıyı filtrelemeden veriyorum
            onPageChange: setPage,
          }}
          emptyText="Sipariş bulunamadı"
        />
      )}
    </div>
  );
}