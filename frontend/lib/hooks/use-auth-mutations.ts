import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginInput, SignupInput } from "@/lib/validations/auth";

export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  return useMutation<void, Error, LoginInput>({
    mutationFn: async ({ email, password }) => {
      login(email, password);
    },
    onSuccess: () => {
      router.push("/");
    },
  });
}

export function useSignupMutation() {
  const signup = useAuthStore((s) => s.signup);
  const router = useRouter();

  return useMutation<void, Error, Omit<SignupInput, "confirmPassword">>({
    mutationFn: async ({ name, email, password }) => {
      signup(name, email, password);
    },
    onSuccess: () => {
      router.push("/");
    },
  });
}
