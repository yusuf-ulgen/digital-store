// src/components/SortDropdown.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSirala = searchParams.get("sirala") ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("sirala", value);
    } else {
      params.delete("sirala");
    }

    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 hidden sm:inline">Sırala:</span>
      <select
        value={currentSirala}
        onChange={handleChange}
        className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <option value="">Önerilen</option>
        <option value="fiyat-artan">En Düşük Fiyat</option>
        <option value="fiyat-azalan">En Yüksek Fiyat</option>
        <option value="yeni">En Yeniler</option>
        <option value="cok-satan">En Çok Satan</option>
      </select>
    </div>
  );
}
