"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiCompass, FiBookmark, FiCpu, FiUser, FiSettings, FiHelpCircle, FiPlus } from "react-icons/fi";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

const mainNav: NavItem[] = [
  { href: "/",        label: "Discover",     icon: FiCompass  },
  { href: "/search",  label: "Saved",        icon: FiBookmark },
  { href: "/profile", label: "Profile",      icon: FiUser     },
];

const subNav: NavItem[] = [
  { href: "#", label: "Settings", icon: FiSettings   },
  { href: "#", label: "Help",     icon: FiHelpCircle },
];

function NavLink({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link className={`sidebar-link${active ? " active" : ""}`} href={href}>
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link href={href} className={`mobile-bottom-nav-item${active ? " active" : ""}`}>
      <Icon size={22} />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <>
      {/* ── Desktop Sidebar ─────────────────── */}
      <aside className="app-sidebar">
        <div className="brand-block">
          <div className="brand-icon">GA</div>
          <div>
            <h1>Gastro-AI</h1>
            <p>Precision Appetite</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {mainNav.map((item) => (
            <NavLink key={item.label} {...item} />
          ))}
        </nav>

        <Link href="/search" style={{ textDecoration: "none" }}>
          <button className="new-search-btn" type="button">
            <FiPlus size={18} />
            <span>New Search</span>
          </button>
        </Link>

        <div className="sidebar-footer">
          {subNav.map((item) => (
            <NavLink key={item.label} {...item} />
          ))}
        </div>
      </aside>

      {/* ── Mobile Top Bar ──────────────────── */}
      <header className="mobile-topbar">
        <Link href="/" style={{ fontFamily: "var(--font-montserrat)", color: "var(--primary)", fontWeight: 800, fontSize: 18 }}>
          Gastro-AI
        </Link>
        <Link href="/search" style={{ color: "var(--text-soft)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </Link>
      </header>

      {/* ── Mobile Bottom Nav ───────────────── */}
      <nav className="mobile-bottom-nav">
        {mainNav.slice(0, 2).map((item) => (
          <MobileNavItem key={item.label} {...item} />
        ))}

        {/* Center FAB */}
        <Link href="/search" className="mobile-bottom-nav-fab">
          <FiCpu size={24} />
        </Link>

        <MobileNavItem href="/profile" label="Profile" icon={FiUser} />
        <MobileNavItem href="#" label="More" icon={FiSettings} />
      </nav>
    </>
  );
}
