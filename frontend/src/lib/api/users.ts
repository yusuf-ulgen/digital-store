import { apiFetch } from "./client";

export type AppUser = {
  id: string;
  email: string;
  displayName?: string;
  role?: "Admin" | "Staff" | "Customer";
  lastLoginAt?: string;
  createdAt?: string;
  ordersCount?: number;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type UserListParams = {
  q?: string;        // email arama
  role?: string;     // Admin/Staff/Customer
  page?: number;
  pageSize?: number;
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

/** GET /api/users (Admin-only olabilir) */
export async function listUsers(params?: UserListParams) {
  return apiFetch<Paginated<AppUser>>(`/api/users${toQuery(params)}`);
}

/** (opsiyonel) rol değiştirme endpoint'in varsa */
export async function changeUserRole(userId: string, role: "Admin" | "Staff" | "Customer") {
  return apiFetch<AppUser>(`/api/users/${userId}/role`, {
    method: "POST",
    body: JSON.stringify({ role }),
    headers: { "Content-Type": "application/json" },
  });
}
