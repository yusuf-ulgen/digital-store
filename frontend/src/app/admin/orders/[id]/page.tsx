"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Timeline, { type TimelineItem } from "@/components/admin/Timeline";
import StatusBadge from "@/components/admin/StatusBadge";
import { getOrder, changeOrderStatus, type Order } from "@/lib/api/orders";

// UI tarafında öneri butonları için hafif yardımcı (asıl doğrulama backend'de)
const FORWARD_TRANSITIONS: Record<string, string[]> = {
  Created: ["Paid", "Canceled"],
  Paid: ["Packed", "Refunded"],
  Packed: ["Shipped"],
  Shipped: ["Delivered", "Refunded"],
  Delivered: ["Refunded"],
  Refunded: [],
  Canceled: [],
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [acting, setActing] = useState(false);
  const [actionErr, setActionErr] = useState<string | null>(null);

  const reload = async () => {
    if (!orderId) return;
    setLoading(true);
    setErr(null);
    try {
      const o = await getOrder(orderId);
      setOrder(o);

      // API detayında event'ler varsa timeline'a koy (ad: events, history, logs…)
      const timelineRaw: any[] =
        (o as any)?.events ||
        (o as any)?.history ||
        (o as any)?.logs ||
        [];

      const mapped: TimelineItem[] = timelineRaw.map((ev) => ({
        id: ev.id,
        type: ev.type ?? ev.eventType ?? "Event",
        message: ev.message,
        from: ev.from ?? ev.oldStatus ?? null,
        to: ev.to ?? ev.newStatus ?? null,
        createdAt: ev.createdAt ?? ev.timestamp ?? new Date().toISOString(),
        userId: ev.userId,
      }));
      setEvents(mapped);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
      setOrder(null);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const nextStatuses = useMemo(() => {
    if (!order?.status) return [];
    return FORWARD_TRANSITIONS[order.status] ?? [];
  }, [order?.status]);

  const openConfirm = (to: string) => {
    setTargetStatus(to);
    setActionErr(null);
    setReason("");
    setConfirmOpen(true);
  };

  const doChange = async () => {
    if (!orderId || !targetStatus) return;
    setActing(true);
    setActionErr(null);
    try {
      await changeOrderStatus(orderId, { to: targetStatus as any, reason: reason || undefined });
      setConfirmOpen(false);
      await reload(); // başarılı → yeniden yükle
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      // 409 özel mesaj
      if (msg.includes("409")) {
        setActionErr("Geçersiz durum geçişi (409). Lütfen akışı kontrol et.");
      } else if (msg.includes("401")) {
        setActionErr("Yetkisiz (401). Lütfen tekrar giriş yap.");
      } else if (msg.includes("403")) {
        setActionErr("Erişim reddedildi (403).");
      } else {
        setActionErr(`Hata: ${msg}`);
      }
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500">Yükleniyor…</div>;
  }

  if (err || !order) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm">
        <div className="text-rose-700">{err ?? "Sipariş bulunamadı."}</div>
        <button
          onClick={() => router.back()}
          className="mt-3 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
        >
          Geri
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Üst başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Order #{order.id}</h2>
          <div className="text-sm text-stone-600">
            {order.customerEmail ?? order.userId} ·{" "}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "-"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          {nextStatuses.length > 0 && (
            <div className="ms-2">
              <span className="mr-2 text-sm text-stone-600">Durumu değiştir:</span>
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => openConfirm(s)}
                  className="mr-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Sol: Genel Bilgiler */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-medium text-stone-700">Sipariş Özeti</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-stone-500">Müşteri</div>
              <div className="text-stone-800">{order.customerEmail ?? order.userId}</div>
            </div>
            <div>
              <div className="text-stone-500">Toplam</div>
              <div className="text-stone-800">{(order.total ?? 0).toLocaleString()} ₺</div>
            </div>
            <div>
              <div className="text-stone-500">Ödeme</div>
              <div className="text-stone-800">{order.paymentMethod ?? "-"}</div>
            </div>
            <div>
              <div className="text-stone-500">Takip Kodu</div>
              <div className="text-stone-800">{order.trackingCode ?? "-"}</div>
            </div>
          </div>

          {/* Items */}
          {!!order.items?.length && (
            <>
              <div className="mt-5 text-sm font-medium text-stone-700">Ürünler</div>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-stone-50 text-stone-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Ürün</th>
                      <th className="px-3 py-2 text-right">Adet</th>
                      <th className="px-3 py-2 text-right">Fiyat</th>
                      <th className="px-3 py-2 text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((it, i) => (
                      <tr key={i} className="border-t border-stone-100">
                        <td className="px-3 py-2">{it.title ?? it.productId}</td>
                        <td className="px-3 py-2 text-right">{it.qty}</td>
                        <td className="px-3 py-2 text-right">{(it.price ?? 0).toLocaleString()} ₺</td>
                        <td className="px-3 py-2 text-right">
                          {((it.price ?? 0) * (it.qty ?? 0)).toLocaleString()} ₺
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Sağ: Timeline */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-stone-700">Olay Geçmişi</h3>
          <Timeline items={events} />
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Durum değiştir"
        description={
          targetStatus
            ? `Siparişi "${targetStatus}" durumuna geçirmek istediğine emin misin?`
            : undefined
        }
        confirmText="Evet, değiştir"
        onConfirm={doChange}
        onClose={() => setConfirmOpen(false)}
        loading={acting}
      >
        <label className="block text-sm text-stone-600">Not (opsiyonel)</label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
          placeholder="Kısa bir açıklama gir…"
        />
        {actionErr && (
          <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {actionErr}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
