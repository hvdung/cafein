import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { apiLogin, apiRegister, apiLogout } from "@/lib/api/auth";
import type { LoginInput, SignupInput } from "@/lib/validations/auth";

export function useLoginMutation() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation<void, Error, LoginInput>({
    mutationFn: async ({ email, password }) => {
      const { access_token, user } = await apiLogin(email, password);
      setAuth(access_token, { id: user.id, email: user.email, name: user.name ?? "" });
    },
    onSuccess: () => router.push("/"),
  });
}

export function useSignupMutation() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation<void, Error, Omit<SignupInput, "confirmPassword">>({
    mutationFn: async ({ name, email, password }) => {
      const { access_token, user } = await apiRegister(name, email, password);
      setAuth(access_token, { id: user.id, email: user.email, name: user.name ?? name });
    },
    onSuccess: () => router.push("/"),
  });
}

export function useLogoutMutation() {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (token) await apiLogout(token).catch(() => {});
    },
    onSettled: () => {
      logout();
      router.push("/login");
    },
  });
}
