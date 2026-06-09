import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/search";
import { restaurants } from "@/lib/mock-data";
import { RestaurantCard } from "@/components/restaurant-card";

type PageProps = {
  params: { slug: string };
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="review-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i < full ? "currentColor" : i === full && half ? "url(#half)" : "none"}
          stroke="currentColor" strokeWidth="1.5">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor"/>
              <stop offset="50%" stopColor="transparent"/>
            </linearGradient>
          </defs>
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
      ))}
    </div>
  );
}

export default function RestaurantDetailPage({ params }: PageProps) {
  const restaurant = getRestaurantBySlug(params.slug);
  if (!restaurant) notFound();

  const related = restaurants
    .filter((r) => r.id !== restaurant.id && r.category === restaurant.category)
    .slice(0, 3);

  const hasRelated = related.length > 0;

  return (
    <main className="page-shell" style={{ paddingTop: 24, paddingBottom: 56 }}>
      {/* ── Back ────────────────────────────────── */}
      <Link href="/search" className="detail-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Quay lại kết quả
      </Link>

      {/* ── Gallery ─────────────────────────────── */}
      <section style={{ marginTop: 18 }}>
        <div className="detail-gallery">
          <div className="detail-gallery-main">
            <Image src={restaurant.images[0]} alt={restaurant.name} fill style={{ objectFit: "cover" }} />
          </div>
          {restaurant.images.length > 1 && (
            <div className="detail-gallery-side">
              {restaurant.images.slice(1, 3).map((img) => (
                <div key={img} className="detail-gallery-thumb" style={{ position: "relative" }}>
                  <Image src={img} alt={restaurant.name} fill style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Meta ─────────────────────────────────── */}
      <section className="detail-meta">
        <div className="detail-badges">
          <span className="badge badge-mint">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            {restaurant.aiMatch}% AI Match
          </span>
          <span className={`badge ${restaurant.isOpenNow ? "badge-open" : "badge-close"}`}>
            {restaurant.isOpenNow ? "Đang mở cửa" : "Đã đóng cửa"}
          </span>
        </div>

        <h1 className="detail-title">{restaurant.name}</h1>
        <p className="detail-subtitle">
          {restaurant.address} · {restaurant.categoryLabel} · {restaurant.priceLabel}
        </p>

        {/* Tags */}
        {restaurant.tags.length > 0 && (
          <div className="detail-tags">
            {restaurant.tags.map((tag) => (
              <span key={tag} className="detail-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Features */}
        {restaurant.features.length > 0 && (
          <div className="detail-features">
            {restaurant.features.map((f) => (
              <span key={f} className="detail-feature">{f}</span>
            ))}
          </div>
        )}

        {/* Info cards */}
        <div className="detail-info-grid">
          <div className="detail-info-card detail-ai-card">
            <h3>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--primary)" style={{ marginRight: 6, verticalAlign: "middle" }}>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              AI Insight
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--text-soft)" }}>{restaurant.aiInsight}</p>
          </div>

          <div className="detail-info-card">
            <h3>Thông tin liên hệ</h3>
            <div className="detail-info-row">
              <svg className="detail-info-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              {restaurant.phone}
            </div>
            <div className="detail-info-row">
              <svg className="detail-info-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {restaurant.city}
            </div>
            <div className="detail-info-row">
              <svg className="detail-info-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
              </svg>
              {restaurant.openHours}
            </div>
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "var(--font-montserrat)", fontSize: 20, marginBottom: 10 }}>Giới thiệu</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-soft)", margin: 0 }}>
              {restaurant.description}
            </p>
          </div>
        )}

        {/* Reviews */}
        <h2 style={{ fontFamily: "var(--font-montserrat)", fontSize: 20, marginBottom: 16 }}>
          Đánh giá ({restaurant.reviews.length})
        </h2>

        <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
          {restaurant.reviews.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 24px",
                background: "var(--surface-low)",
                borderRadius: 16,
                color: "var(--text-soft)",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
              <p style={{ margin: 0, fontWeight: 600 }}>Chưa có đánh giá</p>
              <p style={{ margin: "4px 0 0", fontSize: 13 }}>Hãy là người đầu tiên nhận xét!</p>
            </div>
          ) : (
            restaurant.reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-user">
                    <div className="review-avatar">{review.user[0]}</div>
                    <div>
                      <div className="review-name">{review.user}</div>
                      <div className="review-date">{review.createdAt}</div>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="review-content">{review.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Related restaurants */}
        {hasRelated && (
          <>
            <h2 style={{ fontFamily: "var(--font-montserrat)", fontSize: 20, marginBottom: 16 }}>
              Có thể bạn cũng thích
            </h2>
            <div className="related-grid">
              {related.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
