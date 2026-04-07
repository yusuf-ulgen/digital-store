// src/lib/constants.ts

export const CATEGORIES = [
  { label: "Şef Bıçağı", value: "sef-bicagi" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Bıçaklar", value: "bicaklar" },
  { label: "Bıçak Seti", value: "bicak-seti" },
  { label: "Kasap", value: "kasap" },
  { label: "Satırlar", value: "satirlar" },
  { label: "Bileyici & Masatlar", value: "bileyici-masatlar" },
];

export const ORDER_STATUS_OPTIONS = [
  "Created", 
  "Paid", 
  "Packed", 
  "Shipped", 
  "Delivered", 
  "Cancelled", 
  "Refunded"
];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  Created: "Oluşturuldu",
  Paid: "Ödendi",
  Packed: "Hazırlanıyor",
  Shipped: "Kargoya Verildi",
  Delivered: "Teslim Edildi",
  Cancelled: "İptal Edildi",
  Refunded: "İade Edildi",
};
