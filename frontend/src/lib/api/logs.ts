import { tryEndpoints, qstr } from "./util";

export type HttpLog = {
  id: string;
  cid: string;
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
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

// ENV ile kök override
const LOGS_ROOT = (process.env.NEXT_PUBLIC_LOGS_ROOT || "/api/logs").replace(/\/+$/, "");

function toQuery(p?: LogListParams) {
  const q: Record<string, any> = {};
  if (!p) return "";
  if (p.cid) q.cid = p.cid;
  if (p.path) q.path = p.path;
  if (p.code !== undefined && p.code !== null && (p as any).code !== "") {
    q.status = p.code;
  }
  if (p.from) q.from = p.from;
  if (p.to) q.to = p.to;
  if (p.page) q.page = p.page;
  if (p.pageSize) q.pageSize = p.pageSize;
  return qstr(q);
}

// Mock data üretici (geliştirme için)
function generateMockLogs(params?: LogListParams): Paginated<HttpLog> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  
  const paths = [
    "/api/orders", "/api/users", "/api/products", "/api/cart",
    "/api/auth/login", "/api/auth/register", "/api/payments"
  ];
  const methods = ["GET", "POST", "PUT", "DELETE"];
  const statuses = [200, 201, 204, 400, 401, 404, 500];
  
  // Toplam 100 mock log
  const mockLogs: HttpLog[] = Array.from({ length: 100 }, (_, i) => ({
    id: `log-${i + 1}`,
    cid: `cid-${Math.random().toString(36).substr(2, 9)}`,
    path: paths[Math.floor(Math.random() * paths.length)],
    method: methods[Math.floor(Math.random() * methods.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    durationMs: Math.floor(Math.random() * 500) + 10,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  // Filtreleme
  let filtered = mockLogs;
  if (params?.cid) {
    filtered = filtered.filter(log => log.cid.includes(params.cid!));
  }
  if (params?.path) {
    filtered = filtered.filter(log => log.path.includes(params.path!));
  }
  if (params?.code) {
    filtered = filtered.filter(log => log.status === params.code);
  }
  
  // Sayfalama
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filtered.slice(start, end);
  
  return {
    items,
    page,
    pageSize,
    total: filtered.length,
  };
}

export async function listLogs(p?: LogListParams): Promise<Paginated<HttpLog>> {
  const query = toQuery(p);
  
  // Backend'i dene
  try {
    return await tryEndpoints<Paginated<HttpLog>>([
      // ASP.NET Core standart yapıları
      { url: `/api/Logs${query}` },              // PascalCase (C# controller konvansiyonu)
      { url: `/api/HttpLogs${query}` },
      { url: `/api/Observability/Logs${query}` }, // Area/Controller yapısı
      { url: `/api/Diagnostics/Logs${query}` },
      { url: `/api/Audit/Logs${query}` },
      
      // camelCase alternatifler
      { url: `/api/logs${query}` },
      { url: `/api/httpLogs${query}` },
      
      // v1 versiyonlu
      { url: `/api/v1/Logs${query}` },
      { url: `/api/v1/logs${query}` },
      
      // Admin prefix
      { url: `/api/admin/Logs${query}` },
      { url: `/api/admin/logs${query}` },
      
      // ENV'den gelen root
      { url: `${LOGS_ROOT}${query}` },
    ]);
  } catch (err: any) {
    console.warn("[logs] Backend bulunamadı, mock data kullanılıyor:", err.message);
    
    // Backend yoksa mock data dön
    return generateMockLogs(p);
  }
}