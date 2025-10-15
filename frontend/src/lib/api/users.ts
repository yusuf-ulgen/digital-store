import { tryEndpoints, qstr } from "./util";

export type UserRole = "Admin" | "Staff" | "Customer";
export type UserRow = {
  id: string;
  email: string;
  fullName?: string;
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

// ENV ile kök override
const USERS_ROOT = (process.env.NEXT_PUBLIC_USERS_ROOT || "/api/users").replace(/\/+$/, "");

// Mock data üretici (backend hazır değilse)
function generateMockUsers(params?: { 
  role?: UserRole | "All"; 
  q?: string; 
  page?: number; 
  pageSize?: number;
}): Paginated<UserRow> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  
  const roles: UserRole[] = ["Admin", "Staff", "Customer"];
  const names = [
    "Ahmet Yılmaz", "Ayşe Demir", "Mehmet Kaya", "Fatma Şahin",
    "Mustafa Çelik", "Zeynep Aydın", "Ali Öztürk", "Elif Yıldız"
  ];
  
  // Toplam 50 mock user
  const mockUsers: UserRow[] = Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    email: `user${i + 1}@example.com`,
    fullName: names[Math.floor(Math.random() * names.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    ordersCount: Math.floor(Math.random() * 20),
    lastLoginAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  // Filtreleme
  let filtered = mockUsers;
  if (params?.role && params.role !== "All") {
    filtered = filtered.filter(u => u.role === params.role);
  }
  if (params?.q) {
    const search = params.q.toLowerCase();
    filtered = filtered.filter(u => 
      u.email.toLowerCase().includes(search) ||
      u.fullName?.toLowerCase().includes(search)
    );
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

  // Backend'i dene
  try {
    return await tryEndpoints<Paginated<UserRow>>([
      // logs'dan öğrendik: /api/users muhtemelen çalışıyor
      { url: `/api/users${query}` },
      
      // Alternatif yapılar
      { url: `/api/user${query}` },              // Tekil form
      { url: `/api/Users${query}` },             // PascalCase
      { url: `/api/User${query}` },              // PascalCase tekil
      
      // Identity/Auth prefix
      { url: `/api/identity/users${query}` },
      { url: `/api/auth/users${query}` },
      
      // Admin prefix
      { url: `/api/admin/users${query}` },
      { url: `/api/admin/user${query}` },
      
      // v1 versiyonlu
      { url: `/api/v1/users${query}` },
      { url: `/api/v1/user${query}` },
      
      // ENV'den gelen root
      { url: `${USERS_ROOT}${query}` },
    ]);
  } catch (err: any) {
    console.warn("[users] Backend bulunamadı, mock data kullanılıyor:", err.message);
    
    // Backend yoksa mock data dön
    return generateMockUsers(p);
  }
}