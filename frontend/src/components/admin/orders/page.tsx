// src/app/admin/orders/page.tsx

import Link from 'next/link';
// Dizin yapına göre component'leri import ediyoruz
import OrderList from './components/OrderList'; 
// HATA BURADAYDI, YOL DÜZELTİLDİ:
import OrderFilters from './components/OrderForm'; // './' olarak değiştirildi

// Sipariş verilerini (Order) ve arama parametrelerini (searchParams)
// almak için tip
type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  createdAt: Date;
  // ... (modelindeki diğer alanlar)
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

// Bu fonksiyon sunucuda çalışacak ve veriyi çekecek (Server Component)
async function getOrders(searchParams: Props['searchParams']): Promise<Order[]> {
  // TODO: API'den siparişleri 'searchParams' kullanarak çek
  // Örnek:
  // const query = new URLSearchParams(searchParams as any).toString();
  // const res = await fetch(`http://localhost:5123/api/admin/orders?${query}`);
  // if (!res.ok) return [];
  // const orders = await res.json();
  // return orders;

  // Şimdilik, API'nin boş döndüğünü varsayarak boş array döndürüyoruz
  // (Senin API kodun çalıştığında burası dolacak)
  return []; 
}


export default async function AdminOrdersPage({ searchParams }: Props) {
  // Sunucuda siparişleri al
  const orders = await getOrders(searchParams);

  return (
    <section>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 className="text-xl font-semibold">Orders</h2> {/* Tailwind class'ı ekledim (opsiyonel) */}
        
        {/* YENİ SİPARİŞ EKLE LİNKİ */}
        <Link href="/admin/orders/create" style={{
          padding: '8px 16px',
          backgroundColor: '#007bff', // Mavi
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          + Yeni Sipariş Ekle
        </Link>
      </div>

      {/* Mevcut Filtre Component'in (Ekran görüntündeki) */}
      <OrderFilters />

      {/* Mevcut Liste Component'in (Ekran görüntündeki)
        OrderList component'inin 'orders' adında bir prop aldığını varsayıyorum.
      */}
      <OrderList orders={orders} /> 
    </section>
  );
}