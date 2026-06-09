import { restaurants, type Restaurant } from "@/lib/mock-data";

export type SearchFilters = {
  query?: string;
  category?: string;
  district?: string;
  openNow?: boolean;
  priceRange?: 1 | 2 | 3;
};

export function searchRestaurants(filters: SearchFilters = {}): Restaurant[] {
  const query = (filters.query || "").toLowerCase().trim();

  return restaurants
    .filter((item) => {
      if (filters.category && item.category !== filters.category) {
        return false;
      }

      if (filters.district && item.district.toLowerCase() !== filters.district.toLowerCase()) {
        return false;
      }

      if (filters.openNow && !item.isOpenNow) {
        return false;
      }

      if (filters.priceRange && item.priceRange !== filters.priceRange) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        item.name,
        item.categoryLabel,
        item.district,
        item.description,
        item.tags.join(" ")
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    })
    .sort((a, b) => b.aiMatch - a.aiMatch || b.rating - a.rating);
}

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return restaurants.find((item) => item.slug === slug);
}
