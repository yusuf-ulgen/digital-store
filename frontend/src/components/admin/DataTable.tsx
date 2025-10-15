"use client";

import React from "react";

type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

type Props<T> = {
  columns: Column<T>[] | null | undefined;
  rows: T[] | null | undefined;
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pagination?: Pagination;
  emptyText?: string;
};

export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  pagination,
  emptyText = "Kayıt yok",
}: Props<T>) {
  // ---- Güvenli diziler ----
  const safeRows = (rows ?? []) as T[];
  const safeColumns = (columns ?? []) as Column<T>[];

  return (
    <div className="rounded-2xl border border-stone-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              {safeColumns.map((c) => (
                <th
                  key={String(c.key)}
                  className={`px-4 py-3 text-left font-medium ${c.className ?? ""}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {safeRows.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-stone-500"
                  colSpan={safeColumns.length}
                >
                  {emptyText ?? "Kayıt bulunamadı"}
                </td>
              </tr>
            )}

            {safeRows.map((r) => (
              <tr
                key={getRowKey(r)}
                className={`border-t border-stone-100 ${
                  onRowClick ? "cursor-pointer hover:bg-stone-50" : ""
                }`}
                onClick={() => onRowClick?.(r)}
              >
                {safeColumns.map((c) => (
                  <td
                    key={String(c.key)}
                    className={`px-4 py-3 ${c.className ?? ""}`}
                  >
                    {c.render ? c.render(r) : (r as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 text-sm text-stone-600">
          <span>
            {Math.min(
              (pagination.page - 1) * pagination.pageSize + 1,
              pagination.total
            )}
            –
            {Math.min(
              pagination.page * pagination.pageSize,
              pagination.total
            )}{" "}
            / {pagination.total}
          </span>
          <div className="space-x-2">
            <button
              className="rounded-lg border border-stone-300 px-3 py-1.5 bg-white disabled:opacity-50"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Önceki
            </button>
            <button
              className="rounded-lg border border-stone-300 px-3 py-1.5 bg-white disabled:opacity-50"
              disabled={
                pagination.page * pagination.pageSize >= pagination.total
              }
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
      