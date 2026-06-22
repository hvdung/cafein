import Link from "next/link";
import {
  MagnifyingGlass,
  Clock,
} from "@phosphor-icons/react/dist/ssr";
import { RestaurantCard } from "@/components/restaurant-card";
import { RightPanel } from "@/components/right-panel";
import { searchRestaurants } from "@/lib/search";

type PageProps = {
  searchParams: {
  q?: string;
  category?: string;
  openNow?: string;
  price?: string;
  };
};

const categoryOptions = [
  { key: "cafe",    label: "Cafe"     },
  { key: "nuong",   label: "Nướng"    },
  { key: "lau",     label: "Lẩu"      },
  { key: "bun-pho", label: "Bún / Phở" },
  { key: "com",     label: "Cơm"      },
];

const priceOptions = [
  { key: "1", label: "Dưới 100k"  },
  { key: "2", label: "100 - 300k" },
  { key: "3", label: "Trên 300k"  },
];

function buildHref(
  base: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
) {
  const merged = { ...base, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
  if (v) params.set(k, v);
  }
  const str = params.toString();
  return `/search${str ? "?" + str : ""}`;
}

export default function SearchPage({ searchParams }: PageProps) {
  const results = searchRestaurants({
  query: searchParams.q,
  category: searchParams.category,
  openNow: searchParams.openNow === "1",
  priceRange: searchParams.price ? (Number(searchParams.price) as 1 | 2 | 3) : undefined,
  });

  const base = {
  q: searchParams.q,
  category: searchParams.category,
  openNow: searchParams.openNow,
  price: searchParams.price,
  };

  const activeCategory = searchParams.category;
  const activePrice    = searchParams.price;
  const activeOpenNow  = searchParams.openNow === "1";

  return (
  <main>
    {/* Sticky header */}
    <header className="search-header">
    <div className="search-header-inner">
      <Link href="/" className="search-header-brand">Gastro-AI</Link>

      <form action="/search" className="search-bar">
      <span className="search-bar-icon">
        <MagnifyingGlass size={15} weight="regular" />
      </span>
      <input
        name="q"
        defaultValue={searchParams.q || ""}
        placeholder="Tìm quán ăn, cafe..."
      />
      <button type="submit" className="search-bar-btn">Tìm</button>
      </form>
    </div>
    </header>

    <section className="split-layout">
    {/* Left: Results pane */}
    <div className="results-pane">
      <div className="results-pane-header">
      <h1 className="results-pane-title">
        {searchParams.q
        ? `Kết quả cho "${searchParams.q}"`
        : "Tất cả quán"}
      </h1>
      <p className="results-pane-count">{results.length} địa điểm phù hợp</p>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
      <Link
        href={buildHref(base, { openNow: activeOpenNow ? undefined : "1" })}
        className={`filter-chip${activeOpenNow ? " active" : ""}`}
      >
        <Clock size={12} weight="fill" />
        Đang mở
      </Link>

      {categoryOptions.map((opt) => (
        <Link
        key={opt.key}
        href={buildHref(base, {
          category: activeCategory === opt.key ? undefined : opt.key,
        })}
        className={`filter-chip${activeCategory === opt.key ? " active" : ""}`}
        >
        {opt.label}
        </Link>
      ))}

      <span className="filter-separator" />

      {priceOptions.map((opt) => (
        <Link
        key={opt.key}
        href={buildHref(base, {
          price: activePrice === opt.key ? undefined : opt.key,
        })}
        className={`filter-chip${activePrice === opt.key ? " active" : ""}`}
        >
        {opt.label}
        </Link>
      ))}
      </div>

      {/* Results list */}
      <div className="results-list">
      {results.length === 0 ? (
        <div className="empty-state">
        <div className="empty-state-icon">
          <MagnifyingGlass size={26} weight="regular" />
        </div>
        <h3 className="empty-state-title">Không tìm thấy quán phù hợp</h3>
        <p className="empty-state-sub">
          Hãy thử điều chỉnh bộ lọc hoặc dùng từ khóa khác.
        </p>
        </div>
      ) : (
        results.map((item) => (
        <RestaurantCard key={item.id} restaurant={item} compact />
        ))
      )}
      </div>
    </div>

    {/* Right: tabbed panel (map / AI chat) */}
    <RightPanel restaurants={results} />
    </section>
  </main>
  );
}
