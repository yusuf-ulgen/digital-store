'use client'; // State ve form işlemleri için gerekli

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Yönlendirme için

// C# API'deki DTO'lar ile aynı yapıda tipler oluşturalım
interface OrderItemDto {
  productId: string;
  title: string;
  imageUrl: string;
  qty: number;
  unitPrice: number;
}

interface CreateOrderDto {
  customerEmail: string;
  customerName: string | null;
  customerAddress: string | null;
  items: OrderItemDto[];
}

export default function OrderForm() {
  const router = useRouter();
  
  // Form state'leri
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<OrderItemDto[]>([]);
  
  // Yüklenme ve Hata durumları
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * BASİTLEŞTİRİLMİŞ ÜRÜN EKLEME
   * Normalde burada bir ürün arama/seçme modal'ı açılır.
   */
  const handleAddSampleItem = () => {
    const sampleItem: OrderItemDto = {
      productId: 'PROD-123', // Gerçek bir ürün ID'si ile değiştir
      title: 'Örnek Ürün Başlığı',
      imageUrl: '/placeholder.png', // Gerçek bir resim URL'si
      qty: 1,
      unitPrice: 99.99
    };
    
    setItems(prevItems => [...prevItems, sampleItem]);
  };
  
  // Bir ürünü listeden silme (basit)
  const handleRemoveItem = (index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  /**
   * Formu gönderme (API'ye POST isteği)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (items.length === 0) {
      setError('Sipariş için en az 1 ürün eklemelisiniz.');
      setLoading(false);
      return;
    }

    const orderData: CreateOrderDto = {
      customerEmail,
      customerName,
      customerAddress,
      items
    };
    
    try {
      // API adresini .env dosyasından alman en doğrusu
      // Örn: process.env.NEXT_PUBLIC_API_URL
      // Next.js, API isteğini otomatik olarak backend'e yönlendirmez,
      // tam adresi (http://localhost:5123) veya proxy ayarı kullanman gerekir.
      // Şimdilik /api/ ile deniyoruz (eğer proxy ayarın varsa)
      
      // NOT: Eğer API'n (C#) 5123 portunda, Next.js 3000 portunda çalışıyorsa
      // buraya 'http://localhost:5123/api/admin/orders' yazmalısın.
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Eğer C# API'niz token bekliyorsa (Authorize var), 
          // 'Authorization': 'Bearer ...' header'ını eklemelisiniz.
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Sipariş oluşturulamadı.');
      }

      // Başarılı
      alert('Sipariş başarıyla oluşturuldu!');
      router.push('/admin/orders'); // Listeleme sayfasına geri dön

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* Hata Mesajı */}
      {error && <div style={{ color: 'red', border: '1px solid red', padding: '10px' }}>{error}</div>}

      {/* Müşteri Bilgileri */}
      <fieldset style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <legend>Müşteri Bilgileri</legend>
        <div>
          <label>Email: </label> <br />
          <input 
            type="email" 
            value={customerEmail} 
            onChange={(e) => setCustomerEmail(e.target.value)} 
            required 
            style={{ width: '100%' }} 
          />
        </div>
        <div>
          <label>Ad Soyad: </label> <br />
          <input 
            type="text" 
            value={customerName} 
            onChange={(e) => setCustomerName(e.target.value)} 
            style={{ width: '100%' }} 
          />
        </div>
        <div>
          <label>Adres: </label> <br />
          <textarea 
            value={customerAddress} 
            onChange={(e) => setCustomerAddress(e.target.value)} 
            style={{ width: '100%' }} 
          />
        </div>
      </fieldset>

      {/* Ürünler */}
      <fieldset>
        <legend>Sipariş Ürünleri</legend>
        <button type="button" onClick={handleAddSampleItem}>
          Örnek Ürün Ekle
        </button>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
          {items.map((item, index) => (
            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', padding: '5px' }}>
              <span>{item.title} (Adet: {item.qty} - Fiyat: {item.unitPrice} TL)</span>
              <button type="button" onClick={() => handleRemoveItem(index)} style={{color: 'red'}}>X</button>
            </li>
          ))}
          {items.length === 0 && <li>Henüz ürün eklenmedi.</li>}
        </ul>
      </fieldset>
      
      {/* Gönder Butonu */}
      <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: 'green', color: 'white' }}>
        {loading ? 'Oluşturuluyor...' : 'Siparişi Oluştur'}
      </button>
    </form>
  );
}