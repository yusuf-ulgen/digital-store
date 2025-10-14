import { apiFetch } from "./client";

export type Product = {
  id: string;
  title: string;
  price: number;
  stock: number;
  imageUrl?: string;
  active?: boolean;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ProductListParams = {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string; // örn: -createdAt, price
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

/** GET /api/products (admin listesi için de kullanılabilir) */
export async function listProducts(params?: ProductListParams) {
  return apiFetch<Paginated<Product>>(`/api/products${toQuery(params)}`);
}

/** POST /api/products (ProductsWrite policy) */
export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">) {
  return apiFetch<Product>(`/api/products`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

/** PUT /api/products/{id} */
export async function updateProduct(id: string, data: Partial<Product>) {
  return apiFetch<Product>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

/** DELETE /api/products/{id} */
export async function deleteProduct(id: string) {
  return apiFetch<void>(`/api/products/${id}`, { method: "DELETE" });
}
