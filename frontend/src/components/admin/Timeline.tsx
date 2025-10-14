"use client";

export type TimelineItem = {
  id?: string;
  type?: string;               // örn: OrderStatusChanged
  message?: string;            // opsiyonel
  from?: string | null;
  to?: string | null;
  createdAt: string;           // ISO
  userId?: string;
};

type Props = {
  items: TimelineItem[];
};

export default function Timeline({ items }: Props) {
  if (!items?.length) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-500">
        Kayıt yok
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <ol className="relative ms-4">
        {items
          .slice()
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
          .map((e, idx) => (
            <li key={e.id ?? idx} className="mb-6 ms-2">
              <span className="absolute -start-3 mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 ring-8 ring-white">
                {/* nokta */}
              </span>
              <div className="text-sm">
                <div className="font-medium text-stone-800">
                  {e.type ?? "Event"}
                  {e.to && (
                    <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
                      {e.from ? `${e.from} → ${e.to}` : e.to}
                    </span>
                  )}
                </div>
                {e.message && <div className="text-stone-600">{e.message}</div>}
                <div className="mt-1 text-xs text-stone-500">
                  {new Date(e.createdAt).toLocaleString()}
                  {e.userId ? ` · ${e.userId}` : ""}
                </div>
              </div>
            </li>
          ))}
      </ol>
    </div>
  );
}
