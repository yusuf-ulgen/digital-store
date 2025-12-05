"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import StatusBadge from "@/components/admin/StatusBadge";
// Firebase
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Veri Tipi
type OrderDetail = {
  id: string;
  userId?: string;
  customerEmail?: string;
  total?: number;
  status?: string;
  items?: any[];
  createdAt?: any;
  paymentMethod?: string;
  history?: any[]; // Geçmiş olaylar
};

const STATUS_OPTIONS = ["Created", "Paid", "Packed", "Shipped", "Delivered", "Canceled", "Refunded"];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // 1. Veriyi Çek
  useEffect(() => {
    if (!orderId) return;
    
    async function fetchOrder() {
        setLoading(true);
        try {
            const docRef = doc(db, "orders", orderId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() } as OrderDetail);
            } else {
                setOrder(null);
            }
        } catch (e) {
            console.error("Hata:", e);
        } finally {
            setLoading(false);
        }
    }
    fetchOrder();
  }, [orderId]);

  // 2. Durum Güncelleme
  const handleStatusChange = async () => {
    if (!order || !targetStatus) return;
    setUpdating(true);
    
    try {
        const orderRef = doc(db, "orders", order.id);
        
        // Yeni durumu ve tarihçeyi kaydet
        await updateDoc(orderRef, {
            status: targetStatus,
            history: arrayUnion({
                status: targetStatus,
                changedAt: new Date().toISOString(),
                note: "Admin tarafından güncellendi"
            })
        });
        
        // UI güncelle
        setOrder(prev => prev ? ({ ...prev, status: targetStatus }) : null);
        setConfirmOpen(false);
    } catch (e) {
        alert("Güncelleme başarısız!");
        console.error(e);
    } finally {
        setUpdating(false);
    }
  };

  if (loading) return <div className="p-6">Yükleniyor...</div>;
  if (!order) return <div className="p-6">Sipariş bulunamadı.</div>;

  return (
    <div className="space-y-6">
      {/* Başlık ve Durum Butonları */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-xl font-bold">Sipariş #{order.id}</h2>
            <div className="text-sm text-gray-500">
                {order.createdAt?.seconds 
                    ? new Date(order.createdAt.seconds * 1000).toLocaleString() 
                    : "Tarih yok"}
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <StatusBadge status={order.status || "Unknown"} />
            
            <select 
                className="border rounded p-2 text-sm"
                value=""
                onChange={(e) => {
                    setTargetStatus(e.target.value);
                    setConfirmOpen(true);
                }}
            >
                <option value="" disabled>Durumu Değiştir...</option>
                {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Detay Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol: Müşteri ve Ödeme */}
        <div className="border rounded-xl p-4 bg-white shadow-sm">
            <h3 className="font-semibold mb-3 border-b pb-2">Müşteri Bilgileri</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Email:</span>
                <span>{order.customerEmail || order.userId || "-"}</span>
                
                <span className="text-gray-500">Ödeme Yöntemi:</span>
                <span>{order.paymentMethod || "Kredi Kartı"}</span>
                
                <span className="text-gray-500">Toplam Tutar:</span>
                <span className="font-bold">{(order.total ?? 0).toLocaleString()} ₺</span>
            </div>
        </div>

        {/* Sağ: Ürünler */}
        <div className="border rounded-xl p-4 bg-white shadow-sm">
            <h3 className="font-semibold mb-3 border-b pb-2">Sipariş İçeriği</h3>
            {order.items && order.items.length > 0 ? (
                <ul className="space-y-3">
                    {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                            <span>
                                <span className="font-medium">{item.qty}x</span> {item.title}
                            </span>
                            <span>{(item.price * item.qty).toLocaleString()} ₺</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-gray-400 text-sm">Ürün bilgisi yok.</div>
            )}
        </div>
      </div>

      <button 
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-800 underline"
      >
        &larr; Listeye Dön
      </button>

      {/* Onay Modalı */}
      <ConfirmDialog
        open={confirmOpen}
        title="Durum Güncelle"
        description={`Sipariş durumunu "${targetStatus}" olarak değiştirmek istiyor musunuz?`}
        confirmText="Evet, Güncelle"
        onConfirm={handleStatusChange}
        onClose={() => setConfirmOpen(false)}
        loading={updating}
      />
    </div>
  );
}