import Image from "next/image";
import Link from "next/link";
import { FiCoffee } from "react-icons/fi";
import { MdOutlineOutdoorGrill } from "react-icons/md";
import { GiHotMeal, GiNoodles, GiRiceCooker } from "react-icons/gi";
import { RestaurantCard } from "@/components/restaurant-card";
import { quickCategories, restaurants } from "@/lib/mock-data";

const categoryVisuals: Record<
  string,
  { icon: React.ComponentType<{ size?: number }>; iconBg: string; iconColor: string }
> = {
  cafe:    { icon: FiCoffee,                iconBg: "#7cf6ec33", iconColor: "#003835" },
  nuong:   { icon: MdOutlineOutdoorGrill,   iconBg: "#ffdbd0",   iconColor: "#390c00" },
  lau:     { icon: GiHotMeal,               iconBg: "#dee1f8",   iconColor: "#171b2b" },
  "bun-pho": { icon: GiNoodles,             iconBg: "#e0e3e5",   iconColor: "#191c1e" },
  com:     { icon: GiRiceCooker,            iconBg: "#ffdad6",   iconColor: "#93000a" },
};

export default function HomePage() {
  const trending = restaurants.slice(0, 3);

  return (
    <main>
      {/* ── Hero ────────────────────────────────────── */}
      <div className="page-shell">
        <section className="hero">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80"
            alt="Food spread"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
          <div className="hero-content">
            <h1 className="hero-title">
              Discover your next meal<br />with AI precision.
            </h1>
            <p className="hero-subtitle">
              Tìm quán ăn, cafe theo đúng gu của bạn — semantic search mô phỏng hệ thống thật.
            </p>

            <form action="/search" className="glass-search">
              <span className="glass-search-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              </span>
              <input name="q" placeholder="Thử: quán nướng gần đây, cafe có wifi..." />
              <button type="submit" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </form>

            <div className="hero-trending">
              <span className="hero-trending-label">Trending:</span>
              <Link href="/search?q=bbq" className="hero-trending-link">BBQ đêm</Link>
              <Link href="/search?q=cafe" className="hero-trending-link">Cafe làm việc</Link>
              <Link href="/search?q=pho" className="hero-trending-link">Phở sáng</Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── Quick Categories ────────────────────────── */}
      <section style={{ padding: "48px 0 0", background: "var(--surface)" }}>
        <div className="page-shell">
          <div className="section-header">
            <h2 className="section-title">Quick Categories</h2>
            <Link href="/search" className="view-all-link">
              View all
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>
          <div className="card-grid quick-categories-grid" style={{ paddingBottom: 48 }}>
            {quickCategories.map((item) => {
              const visual = categoryVisuals[item.key];
              const Icon = visual?.icon;
              return (
                <Link key={item.key} href={`/search?category=${item.key}`} className="quick-category-card">
                  <div className="quick-category-icon" style={{ background: visual?.iconBg, color: visual?.iconColor }}>
                    {Icon && <Icon size={28} />}
                  </div>
                  <div className="quick-category-label">{item.label}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Trending Near You ───────────────────────── */}
      <section style={{ padding: "56px 0" }}>
        <div className="page-shell">
          <div className="section-header">
            <div className="section-header-left">
              <span className="section-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z"/>
                </svg>
              </span>
              <h2 className="section-title">Trending Near You</h2>
            </div>
            <Link href="/profile" className="view-all-link">View profile</Link>
          </div>
          <div className="card-grid">
            {trending.map((item) => (
              <RestaurantCard key={item.id} restaurant={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Kitchen Intelligence Bento ───────────── */}
      <section style={{ padding: "56px 0", background: "var(--surface-low)" }}>
        <div className="page-shell">
          <h2 className="section-title" style={{ marginBottom: 24 }}>AI Kitchen Intelligence</h2>
          <div className="bento-grid">
            {/* Main hero cell */}
            <div className="bento-cell bento-main">
              <span className="bento-main-bg-icon" aria-hidden>🤖</span>
              <h3>Vector-Search Your Cravings.</h3>
              <p>
                AI không chỉ tìm theo từ khóa — nó hiểu tâm trạng, chế độ ăn, và lịch sử của bạn
                để tìm đúng quán.
              </p>
              <Link href="/search">
                <button className="bento-main-btn">Khám phá ngay</button>
              </Link>
            </div>

            {/* Right column */}
            <div style={{ display: "grid", gap: 20 }}>
              <div className="bento-cell bento-card">
                <div className="bento-card-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="var(--secondary)">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <h4>Live Dining Map</h4>
                  <p>Xem quán đang mở theo thời gian thực, ước tính thời gian chờ trên toàn thành phố.</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="bento-cell bento-mini">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.9 }}>
                    <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                  </svg>
                  <div>
                    <h4>Recent Hits</h4>
                    <p>5 quán yêu thích gần đây.</p>
                  </div>
                </div>
                <div className="bento-cell bento-saved">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--primary)">
                    <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z"/>
                  </svg>
                  <div>
                    <h4>Saved Sets</h4>
                    <p>Danh sách yêu thích của bạn.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <h2>Gastro-AI</h2>
            <p>© 2026 Gastro-AI Precision Recommendation Engine</p>
          </div>
          <div className="site-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">API Status</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
