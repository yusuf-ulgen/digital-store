import { tryEndpoints, qstr } from "./util";

/* ---------- Tipler ---------- */
export type OrderStatus =
  | "Created" | "Paid" | "Packed" | "Shipped" | "Delivered" | "Refunded" | "Canceled";

export type OrderSummary = {
  id: string;
  customerName?: string;
  customerEmail?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export type Paginated<T> = { items: T[]; page: number; pageSize: number; total: number; };

export type OrderListParams = {
  q?: string;
  status?: OrderStatus | "All";
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};

/* ---------- ENV kökü ---------- */
// Örn: /api/orders  veya /api/v1/orders
const ORDERS_ROOT = (process.env.NEXT_PUBLIC_ORDERS_ROOT || "/api/orders").replace(/\/+$/, "");

/* ---------- Query helper ---------- */
function toQuery(p?: OrderListParams) {
  const q: Record<string, any> = {};
  if (!p) return "";
  if (p.q) q.q = p.q;
  if (p.status && p.status !== "All") q.status = p.status;
  if (p.from) q.from = p.from;
  if (p.to) q.to = p.to;
  if (p.page) q.page = p.page;
  if (p.pageSize) q.pageSize = p.pageSize;
  if (p.sort) q.sort = p.sort;
  return qstr(q);
}

/* ---------- Mock (backend yoksa UI boş kalmasın) ---------- */
function generateMockOrders(params?: OrderListParams): Paginated<OrderSummary> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const statuses: OrderStatus[] = ["Created","Paid","Packed","Shipped","Delivered","Refunded","Canceled"];
  const names = ["Ahmet Yılmaz","Ayşe Demir","Mehmet Kaya","Fatma Şahin","Mustafa Çelik","Zeynep Aydın","Ali Öztürk","Elif Yıldız"];

  const all: OrderSummary[] = Array.from({ length: 37 }, (_, i) => ({
    id: `ORD-${String(1000 + i)}`,
    customerName: names[Math.floor(Math.random() * names.length)],
    customerEmail: `user${i+1}@example.com`,
    total: Math.round((50 + Math.random()*950) * 100) / 100,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.random()*14*24*60*60*1000).toISOString(),
  }));

  let filtered = all;
  if (params?.status && params.status !== "All") {
    filtered = filtered.filter(o => o.status === params.status);
  }
  if (params?.q) {
    const s = params.q.toLowerCase();
    filtered = filtered.filter(o =>
      o.id.toLowerCase().includes(s) ||
      (o.customerName ?? "").toLowerCase().includes(s) ||
      (o.customerEmail ?? "").toLowerCase().includes(s)
    );
  }

  const start = ((page - 1) * pageSize);
  const items = filtered.slice(start, start + pageSize);
  return { items, page, pageSize, total: filtered.length };
}

/* ---------- Ana API ---------- */
export async function listOrders(p?: OrderListParams): Promise<Paginated<OrderSummary>> {
  const query = toQuery(p);
  const body = {
    q: p?.q ?? null,
    status: p?.status && p.status !== "All" ? p.status : null,
    from: p?.from ?? null,
    to: p?.to ?? null,
    page: p?.page ?? 1,
    pageSize: p?.pageSize ?? 10,
    sort: p?.sort ?? "-createdAt",
  };

  try {
    // Önce GET rotaları (sende mevcut olan en muhtemel)
    return await tryEndpoints<Paginated<OrderSummary>>([
      { url: `${ORDERS_ROOT}${query}` },          // ✅ /api/orders?...
      { url: `/api/orders${query}` },             // fallback
      { url: `/api/v1/orders${query}` },          // varsa
      { url: `/api/admin/orders${query}` },       // admin prefix varsa

      // Sonra POST /search (bazı projelerde var; sende 405 verdiği için sona aldık)
      { url: `${ORDERS_ROOT}/search`, method: "POST", body },
      { url: `/api/orders/search`, method: "POST", body },
      { url: `/api/v1/orders/search`, method: "POST", body },
      { url: `/api/admin/orders/search`, method: "POST", body },

      // Ek alternatifler (NGINX vb. düz kök)
      { url: `/orders${query}` },
      { url: `/v1/orders${query}` },
      { url: `/admin/orders${query}` },
    ]);
  } catch (err: any) {
    console.warn("[orders] Backend bulunamadı, mock data kullanılıyor:", err?.message);
    return generateMockOrders(p);
  }
}
