import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AuthUser = { id: string; email: string; name: string };

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),
      setAuth(token, user) {
        set({ token, user });
      },
      logout() {
        set({ token: null, user: null });
      },
    }),
    {
      name: "gastro-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    },
  ),
);
