import Image from "next/image";
import Link from "next/link";
import { profileStats, restaurants } from "@/lib/mock-data";

const searchHistory = [
  { text: "quán nướng giá rẻ gần trung tâm", createdAt: "Hôm qua 19:45", matches: 12 },
  { text: "cafe có wifi và bàn làm việc",     createdAt: "3 ngày trước",   matches: 9  },
  { text: "phở bò mở cửa sớm",               createdAt: "5 ngày trước",   matches: 6  },
];

const savedSpots = restaurants.slice(0, 4);

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <main className="page-shell" style={{ paddingTop: 32, paddingBottom: 56 }}>
      {/* ── Back ────────────────────────────────── */}
      <Link href="/" className="detail-back" style={{ marginBottom: 24, display: "inline-flex" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Trang chủ
      </Link>

      {/* ── Profile Header ──────────────────────── */}
      <div className="profile-header">
        <div className="profile-avatar">JA</div>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--font-montserrat)", fontSize: 36, fontWeight: 700 }}>
            Julian Aris
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-soft)", fontSize: 15 }}>
            Gastronomic Explorer
          </p>
          <div className="profile-level-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            Level 4 Foodie
          </div>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────── */}
      <div className="card-grid" style={{ marginBottom: 32 }}>
        <StatCard label="Địa điểm đã thăm" value={profileStats.placesVisited} sub="nơi" />
        <StatCard label="Đánh giá đã viết" value={profileStats.reviewsWritten} sub="reviews" />
        <StatCard label="Nơi đã lưu"        value={profileStats.savedSpots}    sub="spots" />
        <StatCard
          label="Độ chính xác AI"
          value={`${profileStats.aiAccuracy}%`}
          sub="rất cao"
        />
      </div>

      {/* ── Content ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Recent queries */}
        <div className="card" style={{ padding: 24, overflow: "hidden" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-montserrat)", fontSize: 20, marginBottom: 18 }}>
            Lịch sử tìm kiếm
          </h2>
          <div style={{ display: "grid", gap: 10 }}>
            {searchHistory.map((item) => (
              <Link key={item.text} href={`/search?q=${encodeURIComponent(item.text)}`} className="query-card">
                <div>
                  <div className="query-text">{item.text}</div>
                  <div className="query-meta">{item.createdAt}</div>
                </div>
                <span className="query-matches">{item.matches} kết quả</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Saved spots */}
        <div className="card" style={{ padding: 24, overflow: "hidden" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-montserrat)", fontSize: 20, marginBottom: 18 }}>
            Đã lưu
          </h2>
          <div>
            {savedSpots.map((item) => (
              <Link key={item.id} href={`/${item.slug}`} className="saved-spot-card">
                <div className="saved-spot-thumb">
                  <Image src={item.images[0]} alt={item.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div>
                  <div className="saved-spot-name">{item.name}</div>
                  <div className="saved-spot-meta">{item.district} · {item.categoryLabel}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Accuracy card ──────────────────────── */}
      <div
        style={{
          marginTop: 24,
          background: "linear-gradient(135deg, var(--primary), #c84800)",
          borderRadius: "var(--radius-xl)",
          padding: "32px 36px",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3 style={{ fontFamily: "var(--font-montserrat)", fontSize: 22, margin: "0 0 8px", fontWeight: 700 }}>
            AI đang học từ bạn
          </h3>
          <p style={{ margin: 0, opacity: 0.88, fontSize: 15, lineHeight: 1.5, maxWidth: 480 }}>
            Mỗi đánh giá và tìm kiếm của bạn giúp AI hiểu thêm khẩu vị, đề xuất chính xác hơn mỗi ngày.
          </p>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 56, fontFamily: "var(--font-montserrat)", fontWeight: 800, lineHeight: 1 }}>
            {profileStats.aiAccuracy}%
          </div>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>Độ chính xác</div>
        </div>
      </div>
    </main>
  );
}
