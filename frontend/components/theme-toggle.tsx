"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";

function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
  setMounted(true);
  setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  const toggle = () => {
  const next = !isDark;
  setIsDark(next);
  const theme = next ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("theme", theme); } catch (_) {}
  };

  return { isDark, toggle, mounted };
}

export function ThemeToggleSidebar() {
  const { isDark, toggle, mounted } = useTheme();

  return (
  <button
    className="theme-toggle-row"
    onClick={toggle}
    type="button"
    aria-label={isDark ? "Chuyển sang sáng" : "Chuyển sang tối"}
  >
    <span className="sidebar-link-icon">
    {mounted
      ? (isDark ? <Sun size={18} weight="regular" /> : <Moon size={18} weight="regular" />)
      : <Moon size={18} weight="regular" />}
    </span>
    <span className="theme-toggle-label">
    {mounted ? (isDark ? "Giao diện sáng" : "Giao diện tối") : "Giao diện tối"}
    </span>
    <span className={`theme-toggle-pill${mounted && isDark ? " on" : ""}`} />
  </button>
  );
}

export function ThemeToggleMobile() {
  const { isDark, toggle, mounted } = useTheme();

  return (
  <button
    className="mobile-theme-btn"
    onClick={toggle}
    type="button"
    aria-label={isDark ? "Chuyển sang sáng" : "Chuyển sang tối"}
  >
    {mounted
    ? (isDark ? <Sun size={20} weight="regular" /> : <Moon size={20} weight="regular" />)
    : <Moon size={20} weight="regular" />}
  </button>
  );
}
