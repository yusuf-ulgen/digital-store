import { qstr } from "./util";
import { getAuthHeader } from "@/lib/auth";

export type UserRole = "Admin" | "Staff" | "Customer";

export type UserRow = {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  ordersCount?: number;
  lastLoginAt?: string;
  createdAt?: string;
};

export type Paginated<T> = { 
  items: T[]; 
  page: number; 
  pageSize: number; 
  total: number; 
};

// .env.local'den API adresini al
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
// C# Controller'ındaki yolu ekle
const API_ENDPOINT = `${API_BASE_URL}/api/admin/users`;

export async function listUsers(p?: { 
  role?: UserRole | "All"; 
  q?: string; 
  page?: number; 
  pageSize?: number;
}): Promise<Paginated<UserRow>> {
  
  const q: Record<string, any> = {};
  if (p?.role && p.role !== "All") q.role = p.role;
  if (p?.q) q.q = p.q;
  if (p?.page) q.page = p.page;
  if (p?.pageSize) q.pageSize = p.pageSize;
  const query = qstr(q);

  // Gerçek C# API'sini (tam adresle) çağır
  const response = await fetch(`${API_ENDPOINT}${query}`, {
    method: 'GET',
    headers: await getAuthHeader(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Kullanıcılar alınamadı: ${response.status} ${errText}`);
  }

  // Artık sahte veri yok, sadece gerçek veri
  return response.json();
}