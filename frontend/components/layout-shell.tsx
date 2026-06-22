"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

const AUTH_PATHS = ["/login", "/signup"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="app-content">{children}</div>
    </>
  );
}
