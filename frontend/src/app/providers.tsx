// src/app/providers.tsx
"use client";

import React from "react";
import { CartProvider } from "@/lib/cart";
import ToastProvider from "@/components/ui/ToastProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>{children}</CartProvider>
    </ToastProvider>
  );
}
