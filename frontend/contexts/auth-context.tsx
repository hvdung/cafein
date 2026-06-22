// Đã chuyển sang Zustand — xem stores/auth-store.ts
export { useAuthStore as useAuth, type AuthUser } from "@/stores/auth-store";
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
