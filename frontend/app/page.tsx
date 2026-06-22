import Image from "next/image";
import Link from "next/link";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  MagnifyingGlass,
  Fire,
  MapPin,
  Clock,
  ArrowRight,
  Coffee,
  ForkKnife,
  Flame,
  Drop,
  BowlFood,
} from "@phosphor-icons/react/dist/ssr";
import { RestaurantCard } from "@/components/restaurant-card";
import { quickCategories, restaurants } from "@/lib/mock-data";

const categoryVisuals: Record<
  string,
  { icon: PhosphorIcon; bg: string; color: string }
> = {
  cafe:      { icon: Coffee,     bg: "#f2ece4", color: "#5c3a26" },
  nuong:     { icon: Flame,      bg: "#faebd6", color: "#b8742e" },
  lau:       { icon: Drop,       bg: "#e8edf3", color: "#5a6a7a" },
  "bun-pho": { icon: BowlFood,   bg: "#ede8df", color: "#4a3728" },
  com:       { icon: ForkKnife,  bg: "#ddf0e8", color: "#2c7d52" },
};

export default function HomePage() {
  const trending = restaurants.slice(0, 3);

  return (
  <main>
    {/* Hero */}
    <div className="page-shell">
    <section className="hero">
      <Image
      src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80"
      alt="Vietnamese food spread"
      fill
      priority
      style={{ objectFit: "cover" }}
      />
      <div className="hero-content">
      <p className="hero-label">
        <Fire size={12} weight="fill" />
        AI-powered discovery
      </p>
      <h1 className="hero-title">
        Tìm quán ngon<br />theo đúng gu của bạn.
      </h1>
      <p className="hero-sub">
        Gõ bất cứ điều gì: tâm trạng, chế độ ăn, hay địa điểm. AI sẽ tìm ra nơi hoàn hảo cho bạn.
      </p>

      <form action="/search" className="hero-search">
        <span className="hero-search-icon">
        <MagnifyingGlass size={20} weight="regular" />
        </span>
        <input
        name="q"
        placeholder="Thử: quán cafe yên tĩnh có wifi, lẩu ngon dưới 300k..."
        autoComplete="off"
        />
        <button type="submit" className="hero-search-btn" aria-label="Tìm kiếm">
        <MagnifyingGlass size={18} weight="bold" />
        </button>
      </form>

      <div className="hero-suggestions">
        <span className="hero-suggestion-label">Phổ biến:</span>
        <Link href="/search?q=bbq+dem" className="hero-suggestion-pill">BBQ đêm</Link>
        <Link href="/search?q=cafe+lam+viec" className="hero-suggestion-pill">Cafe làm việc</Link>
        <Link href="/search?q=pho+sang" className="hero-suggestion-pill">Phở sáng sớm</Link>
        <Link href="/search?q=lau+ca" className="hero-suggestion-pill">Lẩu cá</Link>
      </div>
      </div>
    </section>
    </div>

    {/* Quick Categories */}
    <section className="section section-surface">
    <div className="page-shell">
      <div className="section-header">
      <h2 className="section-title">Khám phá theo loại</h2>
      <Link href="/search" className="view-all">
        Xem tất cả
        <ArrowRight size={14} weight="bold" />
      </Link>
      </div>
      <div className="category-strip">
      {quickCategories.map((item) => {
        const vis = categoryVisuals[item.key];
        const Icon = vis?.icon;
        return (
        <Link
          key={item.key}
          href={`/search?category=${item.key}`}
          className="category-pill"
        >
          <div
          className="category-pill-icon"
          style={{ background: vis?.bg, color: vis?.color }}
          >
          {Icon && <Icon size={24} weight="fill" />}
          </div>
          <span className="category-pill-label">{item.label}</span>
        </Link>
        );
      })}
      </div>
    </div>
    </section>

    {/* Trending Near You */}
    <section className="section">
    <div className="page-shell">
      <div className="section-header">
      <div className="section-header-left">
        <Fire size={22} weight="fill" color="var(--amber)" />
        <h2 className="section-title">Đang thịnh hành</h2>
      </div>
      <Link href="/profile" className="view-all">
        Xem hồ sơ
        <ArrowRight size={14} weight="bold" />
      </Link>
      </div>
      <div className="card-grid">
      {trending.map((item) => (
        <RestaurantCard key={item.id} restaurant={item} />
      ))}
      </div>
    </div>
    </section>

    {/* AI Feature Section */}
    <section className="section section-subtle">
    <div className="page-shell">
      <h2 className="section-title" style={{ marginBottom: 24 }}>Thông minh hơn với AI</h2>
      <div className="feature-grid">
      {/* Main feature cell */}
      <div className="feature-main">
        <Image
        src="https://picsum.photos/seed/vietnamese-restaurant-interior/800/600"
        alt="Restaurant discovery"
        fill
        style={{ objectFit: "cover" }}
        />
        <p className="feature-main-eyebrow">Semantic Search</p>
        <h3 className="feature-main-title">Tìm theo cảm xúc, không chỉ từ khóa.</h3>
        <p className="feature-main-sub">
        AI hiểu tâm trạng và lịch sử của bạn để gợi ý đúng quán, đúng lúc.
        </p>
        <Link href="/search">
        <button className="feature-main-btn">
          Khám phá ngay
          <ArrowRight size={14} weight="bold" />
        </button>
        </Link>
      </div>

      {/* Right column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Link href="/search" className="feature-card" style={{ textDecoration: "none", color: "inherit" }}>
        <div
          className="feature-card-icon"
          style={{ background: "var(--slate-tint)", color: "var(--slate)" }}
        >
          <MapPin size={22} weight="fill" />
        </div>
        <div>
          <h4 className="feature-card-title">Bản đồ trực tiếp</h4>
          <p className="feature-card-sub">
          Xem quán đang mở, ước tính thời gian đến ngay trên bản đồ thành phố.
          </p>
        </div>
        </Link>

        <Link href="/profile" className="feature-card" style={{ textDecoration: "none", color: "inherit" }}>
        <div
          className="feature-card-icon"
          style={{ background: "var(--amber-tint)", color: "var(--amber)" }}
        >
          <Clock size={22} weight="fill" />
        </div>
        <div>
          <h4 className="feature-card-title">Lịch sử thông minh</h4>
          <p className="feature-card-sub">
          AI học từ mỗi lượt tìm kiếm, đề xuất ngày càng chính xác hơn.
          </p>
        </div>
        </Link>
      </div>
      </div>
    </div>
    </section>

    {/* Footer */}
    <footer className="site-footer">
    <div className="site-footer-inner">
      <div>
      <p className="site-footer-brand-name">Gastro-AI</p>
      <p className="site-footer-copy">2026 Gastro-AI. AI-powered restaurant discovery for Vietnam.</p>
      </div>
      <div className="site-footer-links">
      <a href="#">Chính sách bảo mật</a>
      <a href="#">Điều khoản sử dụng</a>
      <a href="#">Trạng thái API</a>
      <a href="#">Liên hệ</a>
      </div>
    </div>
    </footer>
  </main>
  );
}
