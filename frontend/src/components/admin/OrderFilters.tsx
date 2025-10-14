"use client";

import { useState, useEffect } from "react";

export type OrderFilter = {
  q?: string;
  status?: string;
  from?: string; // ISO (yyyy-mm-dd)
  to?: string;   // ISO
};

const STATUSES = ["Created","Paid","Packed","Shipped","Delivered","Refunded","Canceled"];

type Props = {
  value: OrderFilter;
  onChange: (next: OrderFilter) => void;
};

export default function OrderFilters({ value, onChange }: Props) {
  const [local, setLocal] = useState<OrderFilter>(value);

  useEffect(() => setLocal(value), [value]);

  const commit = (patch: Partial<OrderFilter>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end mb-4">
      <div className="md:col-span-2">
        <label className="block text-sm text-stone-600 mb-1">Ara</label>
        <input
          value={local.q ?? ""}
          onChange={(e) => commit({ q: e.target.value })}
          placeholder="OrderId, email…"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
        />
      </div>

      <div>
        <label className="block text-sm text-stone-600 mb-1">Durum</label>
        <select
          value={local.status ?? ""}
          onChange={(e) => commit({ status: e.target.value || undefined })}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
        >
          <option value="">Hepsi</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-stone-600 mb-1">Başlangıç</label>
        <input
          type="date"
          value={local.from ?? ""}
          onChange={(e) => commit({ from: e.target.value || undefined })}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
        />
      </div>

      <div>
        <label className="block text-sm text-stone-600 mb-1">Bitiş</label>
        <input
          type="date"
          value={local.to ?? ""}
          onChange={(e) => commit({ to: e.target.value || undefined })}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
        />
      </div>
    </div>
  );
}
