"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CaretLeft, Star, ArrowRight, SignOut } from "@phosphor-icons/react";
import { profileStats, restaurants } from "@/lib/mock-data";
import { useAuthStore } from "@/stores/auth-store";
import { useLogoutMutation } from "@/lib/hooks/use-auth-mutations";

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
  const user = useAuthStore((s) => s.user)!;
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="page-shell" style={{ paddingTop: 28, paddingBottom: 64 }}>
      {/* Back + Logout */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <Link href="/" className="detail-back" style={{ display: "inline-flex" }}>
          <CaretLeft size={14} weight="bold" />
          Trang chủ
        </Link>
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "1.5px solid var(--line)",
            borderRadius: "var(--r-pill)",
            padding: "7px 14px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-3)",
            cursor: "pointer",
            transition: "all 0.18s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#c0392b";
            (e.currentTarget as HTMLButtonElement).style.color = "#c0392b";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
          }}
        >
          <SignOut size={15} />
          Đăng xuất
        </button>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div>
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-role">{user.email}</p>
          <div className="profile-badge">
            <Star size={12} weight="fill" />
            Level 4 Foodie
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card-grid" style={{ marginBottom: 32 }}>
        <StatCard label="Địa điểm đã thăm"  value={profileStats.placesVisited} sub="nơi"     />
        <StatCard label="Đánh giá đã viết"  value={profileStats.reviewsWritten} sub="reviews" />
        <StatCard label="Nơi đã lưu"        value={profileStats.savedSpots}     sub="spots"   />
        <StatCard label="Độ chính xác AI"   value={`${profileStats.aiAccuracy}%`} sub="rất cao" />
      </div>

      {/* Content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Search history */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-lg)",
            padding: 24,
            overflow: "hidden",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 16px", color: "var(--text)" }}>
            Lịch sử tìm kiếm
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {searchHistory.map((item) => (
              <Link key={item.text} href={`/search?q=${encodeURIComponent(item.text)}`} className="query-card">
                <div>
                  <div className="query-text">{item.text}</div>
                  <div className="query-meta">{item.createdAt}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="query-count">{item.matches} kết quả</span>
                  <ArrowRight size={13} weight="bold" color="var(--text-4)" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Saved spots */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-lg)",
            padding: 24,
            overflow: "hidden",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 16px", color: "var(--text)" }}>
            Đã lưu
          </h2>
          <div>
            {savedSpots.map((item) => (
              <Link key={item.id} href={`/${item.slug}`} className="saved-item">
                <div className="saved-item-img">
                  <Image src={item.images[0]} alt={item.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div>
                  <div className="saved-item-name">{item.name}</div>
                  <div className="saved-item-meta">{item.district} &middot; {item.categoryLabel}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* AI banner */}
      <div className="ai-banner">
        <div>
          <h3 className="ai-banner-title">AI đang học từ bạn</h3>
          <p className="ai-banner-sub">
            Mỗi đánh giá và tìm kiếm giúp AI hiểu thêm khẩu vị của bạn, đề xuất chính xác hơn mỗi ngày.
          </p>
        </div>
        <div className="ai-banner-stat">
          <div className="ai-banner-number">{profileStats.aiAccuracy}%</div>
          <div className="ai-banner-stat-label">Độ chính xác</div>
        </div>
      </div>
    </main>
  );
}
