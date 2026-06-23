import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { apiMe } from "@/lib/api/auth";

export function useAuthInit() {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated || !token) return;
    apiMe(token)
      .then((user) => {
        setAuth(token, { id: user.id, email: user.email, name: user.name ?? "" });
      })
      .catch(() => {
        logout();
      });
  // chỉ chạy một lần sau khi Zustand hydrate xong
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);
}
