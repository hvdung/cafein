import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AuthUser = { id: string; email: string; name: string };
type StoredUser = AuthUser & { passwordHash: string };

interface AuthStore {
  user: AuthUser | null;
  _users: StoredUser[];
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      _users: [],
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      login(email, password) {
        const found = get()._users.find(
          (u) =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.passwordHash === simpleHash(password)
        );
        if (!found) throw new Error("Email hoặc mật khẩu không đúng.");
        set({ user: { id: found.id, email: found.email, name: found.name } });
      },

      signup(name, email, password) {
        const users = get()._users;
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Email này đã được sử dụng.");
        }
        const newUser: StoredUser = {
          id: crypto.randomUUID(),
          email,
          name,
          passwordHash: simpleHash(password),
        };
        set({
          _users: [...users, newUser],
          user: { id: newUser.id, email: newUser.email, name: newUser.name },
        });
      },

      logout() {
        set({ user: null });
      },
    }),
    {
      name: "gastro-auth",
      storage: createJSONStorage(() => localStorage),
      // chỉ persist user session và danh sách users, không persist _hasHydrated
      partialize: (state) => ({ user: state.user, _users: state._users }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);
