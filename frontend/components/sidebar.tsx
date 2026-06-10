"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  Compass,
  MagnifyingGlass,
  BookmarkSimple,
  User,
  Gear,
  Question,
  Plus,
  Coffee,
} from "@phosphor-icons/react";
import { ThemeToggleSidebar, ThemeToggleMobile } from "@/components/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: PhosphorIcon;
};

const mainNav: NavItem[] = [
  { href: "/",        label: "Khám phá",  icon: Compass       },
  { href: "/search",  label: "Tìm kiếm",  icon: MagnifyingGlass },
  { href: "/profile", label: "Hồ sơ",     icon: User          },
];

const subNav: NavItem[] = [
  { href: "#", label: "Cài đặt", icon: Gear     },
  { href: "#", label: "Hỗ trợ",  icon: Question },
];

function NavLink({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link className={`sidebar-link${active ? " active" : ""}`} href={href}>
      <span className="sidebar-link-icon">
        <Icon size={18} weight={active ? "fill" : "regular"} />
      </span>
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link href={href} className={`mobile-nav-item${active ? " active" : ""}`}>
      <Icon size={22} weight={active ? "fill" : "regular"} />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <Coffee size={18} weight="fill" />
          </div>
          <div>
            <div className="sidebar-brand-name">Gastro-AI</div>
            <div className="sidebar-brand-tagline">Tìm theo gu của bạn</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {mainNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <Link href="/search" style={{ textDecoration: "none" }}>
          <button className="sidebar-search-btn" type="button">
            <Plus size={16} weight="bold" />
            Tìm kiếm mới
          </button>
        </Link>

        <div className="sidebar-footer">
          {subNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <ThemeToggleSidebar />
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="mobile-topbar">
        <Link href="/" className="mobile-topbar-brand">Gastro-AI</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ThemeToggleMobile />
          <Link href="/search" className="mobile-topbar-icon">
            <MagnifyingGlass size={20} weight="regular" />
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav">
        <MobileNavItem href="/" label="Khám phá" icon={Compass} />
        <MobileNavItem href="/search" label="Tìm kiếm" icon={MagnifyingGlass} />

        <Link href="/search" className="mobile-nav-fab">
          <Coffee size={22} weight="fill" />
        </Link>

        <MobileNavItem href="/profile" label="Hồ sơ" icon={User} />
        <MobileNavItem href="#" label="Đã lưu" icon={BookmarkSimple} />
      </nav>
    </>
  );
}
