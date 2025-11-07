"use client";

// 'page.tsx' dosyasında tanımladığımız Order tipini
// burada da kullanalım. Normalde bu tip
// ayrı bir 'types.ts' dosyasında olmalı.
type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  createdAt: Date;
};

type Props = {
  orders: Order[]; // 'page.tsx' dosyasından 'orders' prop'unu al
};

// Component'i 'export default' ile dışa aktarıyoruz
export default function OrderList({ orders }: Props) {

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-4 text-center text-stone-500">
        Sipariş bulunamadı
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-stone-700">
          <tr>
            <th className="px-4 py-3 font-medium">Order ID</th>
            <th className="px-4 py-3 font-medium">Müşteri</th>
            <th className="px-4 py-3 font-medium">Toplam</th>
            <th className="px-4 py-3 font-medium">Durum</th>
            <th className="px-4 py-3 font-medium">Tarih</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-stone-200 last:border-b-0">
              <td className="p-4 align-top font-mono text-xs text-stone-600">
                {order.id}
              </td>
              <td className="p-4 align-top">
                <div className="font-medium text-stone-900">{order.customerName}</div>
                <div className="text-stone-500">{order.customerEmail}</div>
              </td>
              <td className="p-4 align-top">
                {order.total.toFixed(2)} TL
              </td>
              <td className="p-4 align-top">
                {/* Durum için bir badge component'i güzel olurdu */}
                <span>{order.status}</span>
              </td>
              <td className="p-4 align-top">
                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* TODO: Sayfalama (Pagination) buraya eklenebilir */}
      <div className="p-4 text-right text-xs text-stone-500">
        {orders.length} / {orders.length}
      </div>
    </div>
  );
}