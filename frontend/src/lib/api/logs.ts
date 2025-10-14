import { apiFetch } from "./client";

export type HttpLog = {
  id: string;
  cid: string; // CorrelationId
  path: string;
  method: string;
  status: number;
  durationMs: number;
  createdAt: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type LogListParams = {
  cid?: string;
  path?: string;
  code?: number;
  from?: string; // ISO
  to?: string;   // ISO
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

/** GET /api/logs */
export async function listLogs(params?: LogListParams) {
  return apiFetch<Paginated<HttpLog>>(`/api/logs${toQuery(params)}`);
}
