"use client";

type Props = { status: string };

const map: Record<string, string> = {
  Created: "bg-stone-200 text-stone-800",
  Paid: "bg-blue-100 text-blue-800",
  Packed: "bg-amber-100 text-amber-800",
  Shipped: "bg-cyan-100 text-cyan-800",
  Delivered: "bg-green-100 text-green-800",
  Refunded: "bg-purple-100 text-purple-800",
  Canceled: "bg-rose-100 text-rose-800",
};

export default function StatusBadge({ status }: Props) {
  const cls = map[status] ?? "bg-stone-100 text-stone-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
