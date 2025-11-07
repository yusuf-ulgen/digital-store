// src/app/admin/orders/create/page.tsx

import OrderForm from '../components/OrderForm'; // ../components/OrderForm.tsx dosyasını import et

export default function CreateOrderPage() {
  return (
    <section>
      <h2>Yeni Manuel Sipariş Oluştur</h2>
      <p>Müşteri ve ürün bilgilerini girerek siparişi manuel olarak oluşturun.</p>
      
      <hr style={{ margin: '20px 0' }} />

      {/* Asıl formu burada render ediyoruz */}
      <OrderForm />
    </section>
  );
}