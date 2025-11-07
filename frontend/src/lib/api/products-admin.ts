import { getAuthHeader } from "@/lib/auth";
import { qstr } from "./util";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/api/fs/products`;

// --- Tipler (Aynı kalabilir) ---
export type ProductInput = { title: string; price: number; stock: number; imageUrl?: string; category?: string; active?: boolean; };
export type Product = { id: string; title: string; price: number; stock: number; imageUrl?: string; category?: string; active?: boolean; createdAt: string; };
export type Paginated<T> = { items: T[]; page: number; pageSize: number; total: number; };
export type ProductListParams = { search?: string; page?: number; pageSize?: number; sort?: string; };

/**
 * Ürünleri listeler
 */
export async function listProducts(params: ProductListParams): Promise<Paginated<Product>> {
  const query = qstr(params as any);
  const response = await fetch(`${PRODUCTS_ENDPOINT}${query}`, {
    method: "GET",
    headers: await getAuthHeader(),
  });
  if (!response.ok) throw new Error(await response.text());

  const items = await response.json();
  return {
    items: Array.isArray(items) ? items : [],
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    total: Array.isArray(items) ? items.length : 0,
  };
}

/**
 * Yeni ürün oluşturur (HATA 415 DÜZELTMESİ)
 */
export async function createProduct(data: ProductInput): Promise<{ id: string }> {
  const response = await fetch(PRODUCTS_ENDPOINT, {
    method: "POST",
    headers: {
      ...(await getAuthHeader()), // Yetki token'ını al
      'Content-Type': 'application/json', // SUNUCUYA JSON GÖNDERDİĞİMİZİ SÖYLE
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ürün oluşturulamadı: ${response.status} ${err}`);
  }
  return response.json();
}

/**
 * Ürünü günceller (HATA 415 DÜZELTMESİ)
 */
export async function updateProduct(id: string, data: ProductInput): Promise<void> {
  const response = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, {
    method: "PUT",
    headers: {
      ...(await getAuthHeader()), // Yetki token'ını al
      'Content-Type': 'application/json', // SUNUCUYA JSON GÖNDERDİĞİMİZİ SÖYLE
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ürün güncellenemedi: ${response.status} ${err}`);
  }
}

/**
 * Ürünü siler
 */
export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: await getAuthHeader(),
  });
  if (!response.ok) throw new Error(await response.text());
}