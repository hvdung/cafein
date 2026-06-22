"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Coffee, Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useLoginMutation } from "@/lib/hooks/use-auth-mutations";

type FieldErrors = Partial<Record<keyof LoginInput, string>>;

export default function LoginPage() {
  const { mutate: login, isPending, error: mutationError } = useLoginMutation();

  const [fields, setFields] = useState<LoginInput>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  function setField<K extends keyof LoginInput>(key: K, value: LoginInput[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = loginSchema.safeParse(fields);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginInput;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    login(result.data);
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <Coffee size={20} weight="fill" />
          </div>
          <span className="auth-brand-name">Gastro-AI</span>
        </div>

        <h1 className="auth-title">Chào mừng trở lại</h1>
        <p className="auth-subtitle">Đăng nhập để khám phá quán ngon theo gu của bạn.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mutationError && <p className="auth-error">{mutationError.message}</p>}

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`auth-input${fieldErrors.email ? " error" : ""}`}
              placeholder="you@example.com"
              autoComplete="email"
              value={fields.email}
              onChange={(e) => setField("email", e.target.value)}
            />
            {fieldErrors.email && (
              <p className="auth-field-error">
                <WarningCircle size={13} weight="fill" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Mật khẩu</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`auth-input${fieldErrors.password ? " error" : ""}`}
                placeholder="••••••••"
                autoComplete="current-password"
                value={fields.password}
                onChange={(e) => setField("password", e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", color: "var(--text-4)",
                  display: "flex", alignItems: "center", padding: 0,
                }}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="auth-field-error">
                <WarningCircle size={13} weight="fill" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button type="submit" className="auth-submit" disabled={isPending}>
            {isPending ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="auth-link">Tạo tài khoản</Link>
        </div>
      </div>
    </div>
  );
}
