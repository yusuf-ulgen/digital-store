"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import { listLogs, type HttpLog, type LogListParams } from "@/lib/api/logs";

export default function LogsPage() {
  // filtreler
  const [cid, setCid] = useState("");
  const [path, setPath] = useState("");
  const [code, setCode] = useState<number | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // listeleme
  const [rows, setRows] = useState<HttpLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // durum
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const params: LogListParams = useMemo(
    () => ({
      cid: cid || undefined,
      path: path || undefined,
      code: code === "" ? undefined : Number(code),
      from: from || undefined,
      to: to || undefined,
      page,
      pageSize,
    }),
    [cid, path, code, from, to, page, pageSize]
  );

  const reload = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await listLogs(params);
      setRows(res.items);
      setTotal(res.total);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const copyCid = async (val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      alert("CID kopyalandı.");
    } catch {
      alert("CID kopyalanamadı.");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Logs</h2>

      {/* Filtreler */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
        <div className="md:col-span-2">
          <label className="block text-sm text-stone-600 mb-1">Correlation ID</label>
          <input
            value={cid}
            onChange={(e) => { setPage(1); setCid(e.target.value); }}
            placeholder="cid-123..."
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-stone-600 mb-1">Path</label>
          <input
            value={path}
            onChange={(e) => { setPage(1); setPath(e.target.value); }}
            placeholder="/api/orders"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
          />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Status Code</label>
          <input
            type="number"
            value={code}
            onChange={(e) => { setPage(1); setCode(e.target.value === "" ? "" : Number(e.target.value)); }}
            placeholder="200 / 401 / 409"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
            min={100}
            max={599}
          />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Başlangıç</label>
          <input
            type="date"
            value={from}
            onChange={(e) => { setPage(1); setFrom(e.target.value); }}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
          />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Bitiş</label>
          <input
            type="date"
            value={to}
            onChange={(e) => { setPage(1); setTo(e.target.value); }}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
          />
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {err.includes("401") || err.toLowerCase().includes("unauthorized")
            ? "Yetkisiz: Lütfen tekrar giriş yap."
            : err.includes("403")
            ? "Erişim reddedildi."
            : `Hata: ${err}`}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
          Yükleniyor…
        </div>
      ) : (
        <DataTable<HttpLog>
          columns={[
            {
              key: "cid",
              header: "CID",
              className: "w-[220px]",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <code className="rounded bg-stone-100 px-2 py-0.5 text-xs">{r.cid}</code>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyCid(r.cid); }}
                    className="rounded border border-stone-300 bg-white px-2 py-0.5 text-xs hover:bg-stone-50"
                  >
                    Kopyala
                  </button>
                </div>
              ),
            },
            { key: "method", header: "Method", className: "w-[90px]" },
            {
              key: "path",
              header: "Path",
              render: (r) => <span className="font-mono text-xs">{r.path}</span>,
            },
            {
              key: "status",
              header: "Status",
              className: "w-[90px]",
              render: (r) => (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    r.status >= 500
                      ? "bg-rose-100 text-rose-800"
                      : r.status >= 400
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {r.status}
                </span>
              ),
            },
            {
              key: "durationMs",
              header: "Süre",
              className: "text-right w-[100px]",
              render: (r) => `${r.durationMs?.toLocaleString?.() ?? r.durationMs} ms`,
            },
            {
              key: "createdAt",
              header: "Zaman",
              className: "w-[180px]",
              render: (r) =>
                new Date(r.createdAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
            },
          ]}
          rows={rows}
          getRowKey={(r) => r.id}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
          emptyText="Log kaydı bulunamadı"
        />
      )}
    </div>
  );
}
