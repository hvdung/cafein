import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { Restaurant } from "@/lib/mock-data";

type Props = {
  restaurant: Restaurant;
  compact?: boolean;
};

export function RestaurantCard({ restaurant, compact }: Props) {
  if (compact) {
    return (
      <Link href={`/${restaurant.slug}`} className="r-card-compact">
        <div className="r-card-compact-img">
          <Image
            src={restaurant.images[0]}
            alt={restaurant.name}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="r-card-compact-body">
          <div>
            <h3 className="r-card-compact-name">{restaurant.name}</h3>
            <p className="r-card-compact-meta">
              {restaurant.categoryLabel} · {restaurant.district}
            </p>
          </div>
          <div className="r-card-compact-footer">
            <span className="tag tag-price">{restaurant.priceLabel}</span>
            <span className={`tag ${restaurant.isOpenNow ? "tag-open" : "tag-closed"}`}>
              {restaurant.isOpenNow ? "Đang mở" : "Đã đóng"}
            </span>
            <span className="tag tag-amber">
              {restaurant.aiMatch}% phù hợp
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article className="r-card">
      <Link href={`/${restaurant.slug}`} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
        <div className="r-card-img">
          <Image
            src={restaurant.images[0]}
            alt={restaurant.name}
            fill
            style={{ objectFit: "cover" }}
          />
          <div className="r-card-badges">
            <span className="tag tag-amber">
              <Star size={10} weight="fill" />
              {restaurant.aiMatch}% phù hợp
            </span>
          </div>
          <div className="r-card-status">
            <span className={`tag ${restaurant.isOpenNow ? "tag-open" : "tag-closed"}`}>
              {restaurant.isOpenNow ? "Đang mở" : "Đã đóng"}
            </span>
          </div>
        </div>

        <div className="r-card-body">
          <div className="r-card-header">
            <h3 className="r-card-name">{restaurant.name}</h3>
            <div className="r-card-rating">
              <Star size={13} weight="fill" color="var(--amber)" />
              <span>{restaurant.rating}</span>
            </div>
          </div>

          <p className="r-card-meta">
            {restaurant.categoryLabel} &middot; {restaurant.district}
          </p>

          <div className="r-card-footer">
            <div className="r-card-chips">
              <span className="tag tag-price">{restaurant.priceLabel}</span>
              <span className="tag tag-slate">
                <MapPin size={10} weight="fill" />
                {restaurant.distanceKm} km
              </span>
            </div>
            <span className="r-card-reviews">{restaurant.reviewCount} đánh giá</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
