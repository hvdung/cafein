import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CaretLeft,
  Star,
  Phone,
  MapPin,
  Clock,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
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
        <Star
          key={i}
          size={13}
          weight={i < full ? "fill" : i === full && half ? "duotone" : "regular"}
        />
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

  return (
    <main className="page-shell" style={{ paddingTop: 28, paddingBottom: 64 }}>
      {/* Back */}
      <Link href="/search" className="detail-back">
        <CaretLeft size={14} weight="bold" />
        Quay lại kết quả
      </Link>

      {/* Gallery */}
      <section style={{ marginTop: 18 }}>
        <div className="detail-gallery">
          <div className="detail-gallery-main">
            <Image
              src={restaurant.images[0]}
              alt={restaurant.name}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          {restaurant.images.length > 1 && (
            <div className="detail-gallery-side">
              {restaurant.images.slice(1, 3).map((img) => (
                <div key={img} className="detail-gallery-thumb">
                  <Image src={img} alt={restaurant.name} fill style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Meta */}
      <section style={{ marginTop: 24 }}>
        {/* Badges row */}
        <div className="detail-tags-row">
          <span className="tag tag-amber">
            <Sparkle size={11} weight="fill" />
            {restaurant.aiMatch}% AI Match
          </span>
          <span className={`tag ${restaurant.isOpenNow ? "tag-open" : "tag-closed"}`}>
            {restaurant.isOpenNow ? "Đang mở cửa" : "Đã đóng cửa"}
          </span>
        </div>

        <h1 className="detail-title">{restaurant.name}</h1>
        <p className="detail-subtitle">
          {restaurant.address} &middot; {restaurant.categoryLabel} &middot; {restaurant.priceLabel}
        </p>

        {/* Tags */}
        {restaurant.tags.length > 0 && (
          <div className="detail-tags-row">
            {restaurant.tags.map((tag) => (
              <span key={tag} className="tag tag-mute">{tag}</span>
            ))}
          </div>
        )}

        {/* Features */}
        {restaurant.features.length > 0 && (
          <div className="detail-feature-tags">
            {restaurant.features.map((f) => (
              <span key={f} className="detail-feature-tag">{f}</span>
            ))}
          </div>
        )}

        {/* Info cards */}
        <div className="detail-info-grid">
          <div className="detail-info-card detail-info-ai">
            <h3 className="detail-info-card-title">
              <Sparkle size={14} weight="fill" color="var(--amber)" />
              AI Insight
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "var(--text-3)" }}>
              {restaurant.aiInsight}
            </p>
          </div>

          <div className="detail-info-card">
            <h3 className="detail-info-card-title">Thông tin liên hệ</h3>
            <div className="detail-info-row">
              <Phone size={14} weight="fill" className="detail-info-icon" />
              {restaurant.phone}
            </div>
            <div className="detail-info-row">
              <MapPin size={14} weight="fill" className="detail-info-icon" />
              {restaurant.city}
            </div>
            <div className="detail-info-row">
              <Clock size={14} weight="fill" className="detail-info-icon" />
              {restaurant.openHours}
            </div>
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <div style={{ marginBottom: 32 }}>
            <h2 className="detail-desc-title">Giới thiệu</h2>
            <p className="detail-desc">{restaurant.description}</p>
          </div>
        )}

        {/* Reviews */}
        <h2
          className="detail-desc-title"
          style={{ marginBottom: 16 }}
        >
          Đánh giá ({restaurant.reviews.length})
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
          {restaurant.reviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Star size={24} weight="regular" />
              </div>
              <h3 className="empty-state-title">Chưa có đánh giá</h3>
              <p className="empty-state-sub">Hãy là người đầu tiên nhận xét về nơi này!</p>
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

        {/* Related */}
        {related.length > 0 && (
          <>
            <h2 className="detail-desc-title" style={{ marginBottom: 16 }}>
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
