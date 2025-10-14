// src/lib/api/client.ts
// Tekleştirilmiş API istemcisi (sync/async auth, JSON gövde, 204 ve non-JSON destekli)

import { getToken, getAuthHeader } from "@/lib/auth";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL || // backward-compat
  "";

/* ---------------------------
 * Authorization helpers
 * --------------------------- */

/** Sync: localStorage'taki token'ı ekler (token tazelemez) */
function withAuthSync(init?: RequestInit): RequestInit {
  const token = getToken();
  const headers = new Headers(init?.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}

/** Async: gerektiğinde taze token üretip ekler */
async function withAuth(init?: RequestInit): Promise<RequestInit> {
  const authHeader = await getAuthHeader();
  const headers = new Headers(init?.headers || {});
  for (const [k, v] of Object.entries(authHeader)) headers.set(k, v);
  return { ...init, headers };
}

/* ---------------------------
 * Düşük seviyeli fetch sarmalayıcı
 * --------------------------- */

/** API_BASE öne ekleyip fetch yapan yardımcı (async auth) */
export async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, await withAuth(init));

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data: any = await res.json();
        if (data?.message) msg = data.message;
        else if (data?.detail) msg = data.detail;
      } else {
        const text = await res.text();
        if (text) msg = text;
      }
    } catch {
      /* yoksay */
    }
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

// Esneklik için default export (opsiyonel)
export default apiFetch;

/* ---------------------------
 * Yüksek seviyeli API (opts ile)
 * --------------------------- */

export type ApiOpts = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  /** override için: dışarıdan idToken verirsen Authorization buna göre set edilir */
  idToken?: string | null;
  extraHeaders?: Record<string, string>;
  /** Next fetch cache davranışı (varsayılan: no-store) */
  cache?: RequestCache;
};

/**
 * Yüksek seviyeli çağrı: JSON body + header birleştirme + 204/JSON handling.
 * `idToken` verilirse onu kullanır; verilmezse getAuthHeader() ile taze token dener.
 */
export async function api<T = any>(path: string, opts: ApiOpts = {}) {
  const url = `${API_BASE}${path}`;

  // Header’lar
  const headers = new Headers({
    "Content-Type": "application/json",
    ...(opts.extraHeaders || {}),
  });

  if (opts.idToken) {
    headers.set("Authorization", `Bearer ${opts.idToken}`);
  } else {
    const authHeader = await getAuthHeader();
    for (const [k, v] of Object.entries(authHeader)) headers.set(k, v);
  }

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: opts.cache ?? "no-store",
  });

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data: any = await res.json();
        if (data?.message) msg = data.message;
        else if (data?.detail) msg = data.detail;
      } else {
        const text = await res.text();
        if (text) msg = text;
      }
    } catch { /* yoksay */ }
    throw new Error(msg);
  }

  if (res.status === 204) return null as T;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;

  return (await res.text()) as unknown as T;
}

/* ---------------------------
 * İsteğe bağlı: sync varyant (mevcut kod uyumu için)
 * --------------------------- */

/** (Opsiyonel) Sync token ekleyen varyant — eski kullanım için */
export async function apiFetchSyncAuth<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, withAuthSync(init));
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}
