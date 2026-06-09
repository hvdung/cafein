import Image from "next/image";
import Link from "next/link";
import type { Restaurant } from "@/lib/mock-data";

type Props = {
  restaurant: Restaurant;
  compact?: boolean;
};

export function RestaurantCard({ restaurant, compact }: Props) {
  return (
    <article className="restaurant-card">
      <Link href={`/${restaurant.slug}`}>
        <div className="restaurant-card-image">
          <Image
            src={restaurant.images[0]}
            alt={restaurant.name}
            fill
            style={{ objectFit: "cover" }}
            className="restaurant-card-img"
          />
          <div className="restaurant-card-badges">
            <span className="badge badge-mint">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              {restaurant.aiMatch}% Match
            </span>
          </div>
          <div className="restaurant-card-status">
            <span className={`badge ${restaurant.isOpenNow ? "badge-open" : "badge-close"}`}>
              {restaurant.isOpenNow ? "Open" : "Closed"}
            </span>
          </div>
        </div>

        <div className="restaurant-card-body">
          <div className="restaurant-card-header">
            <h3 className="restaurant-card-name">{restaurant.name}</h3>
            <div className="restaurant-card-rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--primary)" style={{ flexShrink: 0 }}>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span>{restaurant.rating}</span>
            </div>
          </div>

          <p className="restaurant-card-meta">
            {restaurant.categoryLabel} • {restaurant.district}
          </p>

          <div className="restaurant-card-footer">
            <div className="restaurant-card-chips">
              <span className="chip chip-price">{restaurant.priceLabel}</span>
              <span className="chip">{restaurant.distanceKm} km</span>
            </div>
            <span className="restaurant-card-reviews">{restaurant.reviewCount} reviews</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
