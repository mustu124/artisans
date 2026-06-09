"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type AdminContextValue = {
  isAdmin: boolean;
  isLoading: boolean;
  adminEmail?: string | null;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!pathname.startsWith("/admin")) {
      setAdminEmail(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    fetch("/api/admin/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = (await response.json()) as { data?: { user?: { email?: string } } };
        return payload.data?.user?.email ?? null;
      })
      .catch(() => null)
      .then((email) => {
        if (!mounted) return;
        setAdminEmail(email);
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  const value = useMemo(
    () => ({
      isAdmin: Boolean(adminEmail),
      isLoading,
      adminEmail
    }),
    [adminEmail, isLoading]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider.");
  }

  return context;
}
