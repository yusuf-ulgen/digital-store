// src/components/ui/ToastProvider.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";

type ToastVariant = "default" | "success" | "warning" | "error";

export type Toast = {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number; // default 3000
};

type Ctx = {
  show: (t: Omit<Toast, "id">) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const show = useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    const toast: Toast = {
      id,
      variant: "default",
      durationMs: 3000,
      ...t,
}
    setToasts((arr) => [...arr, toast]);
    const dur = toast.durationMs!;
    window.setTimeout(() => {
      setToasts((arr) => arr.filter((x) => x.id !== id));
    }, dur);
  }, []);

  const ctx = useMemo<Ctx>(() => ({ show }), [show]);

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      {mounted &&
        createPortal(
          <div className="fixed right-4 top-4 z-[9999] flex w-[360px] max-w-[90vw] flex-col gap-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`rounded-xl border px-3 py-2 shadow-sm backdrop-blur
                ${t.variant === "success" ? "border-green-200 bg-green-50 text-green-900"
                  : t.variant === "warning" ? "border-amber-200 bg-amber-50 text-amber-900"
                  : t.variant === "error" ? "border-rose-200 bg-rose-50 text-rose-900"
                  : "border-stone-200 bg-white text-stone-900"}`}
              >
                {t.title && <div className="text-sm font-medium">{t.title}</div>}
                <div className="text-sm">{t.message}</div>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastCtx.Provider>
  );
}
