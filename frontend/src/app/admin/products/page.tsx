"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ProductForm, { type ProductInput } from "@/components/admin/products/ProductForm";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type ProductListParams,
} from "@/lib/api/products-admin";

export default function ProductsPage() {
  // liste durumu
  const [rows, setRows] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filtre / sayfalama
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sort] = useState<string>("-createdAt");

  // form + delete
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const [askDelete, setAskDelete] = useState<null | Product>(null);
  const [deleting, setDeleting] = useState(false);

  const params: ProductListParams = useMemo(
    () => ({
      search: search || undefined,
      page,
      pageSize,
      sort,
    }),
    [search, page, pageSize, sort]
  );

  const reload = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await listProducts(params);
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

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const submitForm = async (data: ProductInput) => {
    setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing.id, data);
      } else {
        await createProduct(data);
      }
      setFormOpen(false);
      await reload();
    } catch (e: any) {
      alert(String(e?.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!askDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(askDelete.id);
      setAskDelete(null);
      await reload();
    } catch (e: any) {
      alert(String(e?.message ?? e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Başlık + arama + yeni */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Products</h2>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Ara (başlık, kategori)…"
            className="w-56 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
          />
          <button
            onClick={openCreate}
            className="rounded-lg bg-stone-800 px-3 py-2 text-sm text-white"
          >
            Yeni Ürün
          </button>
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
        <DataTable<Product>
          columns={[
            {
              key: "image",
              header: "",
              className: "w-[56px]",
              render: (r) =>
                r.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-stone-100" />
                ),
            },
            { key: "title", header: "Başlık", className: "font-medium" },
            {
              key: "category",
              header: "Kategori",
              render: (r) => r.category ?? "-",
            },
            {
              key: "price",
              header: "Fiyat",
              className: "text-right w-[120px]",
              render: (r) => <span>{(r.price ?? 0).toLocaleString()} ₺</span>,
            },
            {
              key: "stock",
              header: "Stok",
              className: "text-right w-[120px]",
              render: (r) => (
                <span className="inline-flex items-center justify-end gap-2">
                  {(r.stock ?? 0).toLocaleString()}
                  {(r.stock ?? 0) < 10 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">
                      Düşük
                    </span>
                  )}
                </span>
              ),
            },
            {
              key: "active",
              header: "Durum",
              className: "w-[120px]",
              render: (r) =>
                r.active ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                    Aktif
                  </span>
                ) : (
                  <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-700">
                    Pasif
                  </span>
                ),
            },
            {
              key: "actions",
              header: "",
              className: "w-[160px] text-right",
              render: (r) => (
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(r);
                    }}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAskDelete(r);
                    }}
                    className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
                  >
                    Sil
                  </button>
                </div>
              ),
            },
          ]}
          rows={rows}
          getRowKey={(r) => r.id}
          onRowClick={(r) => openEdit(r)}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
          emptyText="Ürün bulunamadı"
        />
      )}

      {/* Create/Edit Modal */}
      <ProductForm
        open={formOpen}
        title={editing ? "Ürünü Düzenle" : "Yeni Ürün"}
        initial={
          editing
            ? {
                title: editing.title,
                price: editing.price,
                stock: editing.stock,
                imageUrl: editing.imageUrl,
                category: editing.category,
                active: editing.active ?? true,
              }
            : undefined
        }
        loading={saving}
        onSubmit={submitForm}
        onClose={() => setFormOpen(false)}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!askDelete}
        title="Ürünü sil"
        description={
          askDelete
            ? `"${askDelete.title}" adlı ürünü silmek istediğine emin misin?`
            : undefined
        }
        confirmText="Evet, sil"
        onConfirm={confirmDelete}
        onClose={() => setAskDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
