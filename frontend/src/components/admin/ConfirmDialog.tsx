"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode; // ekstra içerik (örn. reason input)
};

export default function ConfirmDialog({
  open,
  title = "Onayla",
  description,
  confirmText = "Onayla",
  cancelText = "İptal",
  loading,
  onConfirm,
  onClose,
  children,
}: Props) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-stone-600">{description}</p>}
        {children && <div className="mt-3">{children}</div>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "İşleniyor…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
