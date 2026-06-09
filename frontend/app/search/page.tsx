import Link from "next/link";
import { RestaurantCard } from "@/components/restaurant-card";
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
  { key: "cafe",    label: "Cafe" },
  { key: "nuong",   label: "Nướng" },
  { key: "lau",     label: "Lẩu" },
  { key: "bun-pho", label: "Bún/Phở" },
  { key: "com",     label: "Cơm" },
];

const priceOptions = [
  { key: "1", label: "< 100k" },
  { key: "2", label: "100–300k" },
  { key: "3", label: "> 300k" },
];

function buildHref(base: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
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
  const activePrice = searchParams.price;
  const activeOpenNow = searchParams.openNow === "1";

  return (
    <main>
      {/* ── Sticky header ────────────────────────── */}
      <header
        style={{
          height: 72,
          borderBottom: "1px solid var(--line)",
          position: "sticky",
          top: 0,
          background: "rgba(247,249,251,0.92)",
          backdropFilter: "blur(10px)",
          zIndex: 10,
        }}
      >
        <div
          className="page-shell"
          style={{ height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}
        >
          <Link
            href="/"
            style={{ fontFamily: "var(--font-montserrat)", color: "var(--primary)", fontWeight: 800, fontSize: 20, flexShrink: 0 }}
          >
            Gastro-AI
          </Link>
          <form action="/search" style={{ display: "flex", gap: 8, flex: 1, maxWidth: 500 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                border: "1.5px solid var(--line)",
                borderRadius: 999,
                padding: "8px 16px",
                background: "var(--surface)",
                transition: "border-color 0.2s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-soft)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                name="q"
                defaultValue={searchParams.q || ""}
                placeholder="Tìm quán..."
                style={{ border: 0, background: "transparent", outline: "none", flex: 1, fontSize: 15 }}
              />
            </div>
            <button
              style={{
                borderRadius: 999,
                border: 0,
                background: "var(--primary)",
                color: "#fff",
                padding: "8px 20px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Tìm
            </button>
          </form>
        </div>
      </header>

      <section className="split-layout">
        {/* ── Left Pane ──────────────────────────── */}
        <div className="left-pane">
          {/* Results header */}
          <div style={{ padding: "20px 20px 0" }}>
            <h1 style={{ margin: 0, fontFamily: "var(--font-montserrat)", fontSize: 22, fontWeight: 700 }}>
              {searchParams.q ? `Kết quả cho "${searchParams.q}"` : "Tất cả quán"}
            </h1>
            <p style={{ margin: "4px 0 0", color: "var(--text-soft)", fontSize: 14 }}>
              {results.length} quán phù hợp
            </p>
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            {/* Open Now toggle */}
            <Link
              href={buildHref(base, { openNow: activeOpenNow ? undefined : "1" })}
              className={`filter-chip ${activeOpenNow ? "active" : ""}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              Đang mở
            </Link>

            {/* Category filters */}
            {categoryOptions.map((opt) => (
              <Link
                key={opt.key}
                href={buildHref(base, { category: activeCategory === opt.key ? undefined : opt.key })}
                className={`filter-chip ${activeCategory === opt.key ? "active" : ""}`}
              >
                {opt.label}
              </Link>
            ))}

            {/* Price filters */}
            <span style={{ width: 1, height: 20, background: "var(--line)", flexShrink: 0, margin: "0 4px" }} />
            {priceOptions.map((opt) => (
              <Link
                key={opt.key}
                href={buildHref(base, { price: activePrice === opt.key ? undefined : opt.key })}
                className={`filter-chip ${activePrice === opt.key ? "active" : ""}`}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {/* Results list */}
          <div style={{ padding: "16px 20px 24px", display: "grid", gap: 16 }}>
            {results.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: "var(--text-soft)",
                  background: "var(--surface-low)",
                  borderRadius: 16,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p style={{ margin: 0, fontWeight: 600 }}>Không tìm thấy quán phù hợp</p>
                <p style={{ margin: "6px 0 0", fontSize: 14 }}>Thử điều chỉnh bộ lọc hoặc tìm từ khóa khác.</p>
              </div>
            ) : (
              results.map((item) => <RestaurantCard key={item.id} restaurant={item} />)
            )}
          </div>
        </div>

        {/* ── Map Pane ──────────────────────────── */}
        <div className="map-pane">
          <div className="fake-map-grid" />

          {/* Decorative road lines */}
          <div className="map-road-h" style={{ top: "30%" }} />
          <div className="map-road-h" style={{ top: "62%" }} />
          <div className="map-road-v" style={{ left: "35%" }} />
          <div className="map-road-v" style={{ left: "68%" }} />

          {/* Street labels */}
          <span className="map-label" style={{ top: "28%", left: "38%", transform: "translateY(-100%)" }}>
            Lê Lợi
          </span>
          <span className="map-label" style={{ top: "60%", left: "70%", transform: "translateY(-100%)" }}>
            Võ Văn Tần
          </span>

          {/* Markers */}
          {results.slice(0, 5).map((item, index) => (
            <Link
              key={item.id}
              href={`/${item.slug}`}
              className="marker"
              style={{
                left: `${20 + (index % 3) * 24}%`,
                top: `${28 + Math.floor(index / 3) * 30 + (index % 2) * 12}%`,
              }}
            >
              {item.name}
            </Link>
          ))}

          {/* Map attribution overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(6px)",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 11,
              color: "var(--text-soft)",
            }}
          >
            Map preview — Google Maps coming soon
          </div>
        </div>
      </section>
    </main>
  );
}
