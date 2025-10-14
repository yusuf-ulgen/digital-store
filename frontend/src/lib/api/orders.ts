import { apiFetch } from "./client";

export type OrderStatus =
  | "Created"
  | "Paid"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Refunded"
  | "Canceled";

export type OrderItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  imageUrl?: string;
};

export type Order = {
  id: string;
  userId: string;
  customerEmail?: string;
  total: number;
  status: OrderStatus;
  paymentMethod?: string;
  trackingCode?: string;
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
  address?: any;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type OrderListParams = {
  q?: string;
  status?: OrderStatus;
  sort?: string; // örn: -createdAt, total
  page?: number;
  pageSize?: number;
  from?: string; // ISO
  to?: string;   // ISO
};

function toQuery(params?: Record<string, any>) {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.append(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** GET /api/orders */
export async function listOrders(params?: OrderListParams) {
  return apiFetch<Paginated<Order>>(`/api/orders${toQuery(params)}`);
}

/** GET /api/orders/{id} */
export async function getOrder(id: string) {
  return apiFetch<Order>(`/api/orders/${id}`);
}

/** POST /api/orders/{id}/status  body: { to, reason? } */
export async function changeOrderStatus(
  id: string,
  body: { to: OrderStatus; reason?: string }
) {
  return apiFetch<Order>(`/api/orders/${id}/status`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}
