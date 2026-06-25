"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useAuthInit } from "@/lib/hooks/use-auth-init";
import { useAuthStore } from "@/stores/auth-store";

function AuthInit() {
  useAuthInit();
  return null;
}

const AUTH_PATHS = ["/login", "/signup"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthPage = AUTH_PATHS.includes(pathname);

  useEffect(() => {
    if (!hasHydrated || isAuthPage) return;
    if (!user) router.replace("/login");
  }, [hasHydrated, user, isAuthPage, router]);

  if (isAuthPage) {
    return (
      <>
        <AuthInit />
        {children}
      </>
    );
  }

  // chờ Zustand đọc xong localStorage trước khi render
  if (!hasHydrated || !user) {
    return (
      <>
        <AuthInit />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
          <p style={{ color: "var(--text-3)", fontSize: 14 }}>Đang tải…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthInit />
      <Sidebar />
      <div className="app-content">{children}</div>
    </>
  );
}
