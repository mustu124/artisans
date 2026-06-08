"use client";

import { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";

type AdminContextValue = {
  isAdmin: boolean;
  isLoading: boolean;
  adminEmail?: string | null;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const value = useMemo(
    () => ({
      isAdmin: Boolean(session?.user?.email),
      isLoading: status === "loading",
      adminEmail: session?.user?.email
    }),
    [session?.user?.email, status]
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
