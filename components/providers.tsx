"use client";

import { AdminProvider } from "@/context/AdminContext";
import { CartProvider } from "@/context/CartContext";
import { CartSidebar } from "@/components/CartSidebar";
import { Toaster } from "react-hot-toast";
import { PageChrome } from "@/components/PageChrome";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <CartProvider>
        <PageChrome>{children}</PageChrome>
        <CartSidebar />
        <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
      </CartProvider>
    </AdminProvider>
  );
}
