// src/lib/api/util.ts
import { apiFetch } from "./client";

export type HttpMethod = "GET" | "POST";

export async function tryEndpoints<T>(
  attempts: Array<{ url: string; method?: HttpMethod; body?: any }>
): Promise<T> {
  let lastErr: any;
  for (const a of attempts) {
    try {
      const init =
        a.method === "POST"
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(a.body ?? {}),
            }
          : undefined;

      return await apiFetch<T>(a.url, init);
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      // 404/405’te sıradaki denemeye geç; diğer hatalarda kes
      if (msg.includes("404") || msg.includes("405") || msg.includes("Method Not Allowed") || msg.includes("Not Found")) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }
  throw lastErr ?? new Error("Tüm endpoint denemeleri başarısız.");
}

export function qstr(params?: Record<string, any>) {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.append(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}
