"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Coffee, Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { useSignupMutation } from "@/lib/hooks/use-auth-mutations";

type FieldErrors = Partial<Record<keyof SignupInput, string>>;

export default function SignupPage() {
  const { mutate: signup, isPending, error: mutationError } = useSignupMutation();

  const [fields, setFields] = useState<SignupInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  function setField<K extends keyof SignupInput>(key: K, value: SignupInput[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = signupSchema.safeParse(fields);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof SignupInput;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    const { confirmPassword: _, ...payload } = result.data;
    signup(payload);
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

        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="auth-subtitle">Tham gia Gastro-AI để lưu địa điểm yêu thích và nhận gợi ý thông minh hơn.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mutationError && <p className="auth-error">{mutationError.message}</p>}

          <div className="auth-field">
            <label className="auth-label" htmlFor="name">Họ tên</label>
            <input
              id="name"
              type="text"
              className={`auth-input${fieldErrors.name ? " error" : ""}`}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              value={fields.name}
              onChange={(e) => setField("name", e.target.value)}
            />
            {fieldErrors.name && (
              <p className="auth-field-error">
                <WarningCircle size={13} weight="fill" />
                {fieldErrors.name}
              </p>
            )}
          </div>

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
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
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

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm-password">Xác nhận mật khẩu</label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              className={`auth-input${fieldErrors.confirmPassword ? " error" : ""}`}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              value={fields.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
            />
            {fieldErrors.confirmPassword && (
              <p className="auth-field-error">
                <WarningCircle size={13} weight="fill" />
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button type="submit" className="auth-submit" disabled={isPending}>
            {isPending ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản?{" "}
          <Link href="/login" className="auth-link">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
