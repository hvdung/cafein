# 🍜 Restaurant & Cafe AI Recommendation App
> Ứng dụng gợi ý quán ăn, cafe thông minh dùng AI + Qdrant + Google Maps

---

## 📐 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                  Next.js 14 (App Router)                 │
│      Server Components + Client Components              │
│         SearchBar → ResultCards → Google Maps           │
│                                                         │
│   /app/page.tsx          → Trang chính (SSR)           │
│   /app/[slug]/page.tsx   → Chi tiết quán (SSG)         │
│   /app/api/search/       → Route Handler (thay BE nhỏ) │
└──────────────────────┬──────────────────────────────────┘
                       │ Internal fetch / Route Handlers
┌──────────────────────▼──────────────────────────────────┐
│                  FastAPI Backend                         │
│   1. Nhận query từ user                                 │
│   2. Claude API → parse intent                          │
│   3. Tạo embedding từ query                             │
│   4. Qdrant → vector search + filter                    │
│   5. Re-rank → trả kết quả                             │
└────────┬──────────────────┬────────────────────────────┘
         │                  │
┌────────▼──────┐    ┌──────▼──────┐    ┌──────────────┐
│  PostgreSQL   │    │   Qdrant    │    │  Claude API  │
│  (users,      │    │  (vectors + │    │  (intent AI) │
│   reviews,    │    │   payload)  │    └──────────────┘
│   auth)       │    └─────────────┘
└───────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Công nghệ | Mục đích |
|-----------|----------|
| **Next.js 14 (App Router)** | Framework chính — SSR, SSG, Route Handlers |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Google Maps JS API | Hiển thị bản đồ, markers, directions |
| @vis.gl/react-google-maps | React wrapper cho Google Maps (Next.js 14 compatible) |
| React Query (TanStack) | Client-side data fetching, caching |
| Zustand | Client state management |
| next-auth v5 | Authentication (Google OAuth, JWT) |
| next/image | Tối ưu ảnh quán tự động |

### Backend
| Công nghệ | Mục đích |
|-----------|----------|
| Python 3.11+ | Ngôn ngữ chính |
| FastAPI | Web framework async |
| Uvicorn | ASGI server |
| Pydantic v2 | Validation dữ liệu |
| SQLAlchemy 2.0 | ORM cho PostgreSQL |
| Alembic | Database migrations |
| asyncpg | PostgreSQL async driver |
| Redis + aioredis | Caching kết quả search |

### AI / Vector
| Công nghệ | Mục đích |
|-----------|----------|
| Anthropic Claude API | Parse intent từ câu query tự nhiên |
| `intfloat/multilingual-e5-large` | Embedding model (hỗ trợ tiếng Việt, free) |
| Qdrant | Vector database, semantic search |
| qdrant-client | Python SDK cho Qdrant |

### Database
| Công nghệ | Mục đích |
|-----------|----------|
| PostgreSQL 15+ | Lưu user, review, auth |
| Qdrant | Lưu vector + payload quán ăn |
| Redis | Cache query phổ biến |

### DevOps / Deploy
| Công nghệ | Mục đích |
|-----------|----------|
| Docker + Docker Compose | Local development |
| Railway / Render | Deploy backend + PostgreSQL |
| Qdrant Cloud | Deploy Qdrant |
| **Vercel** | Deploy Next.js (tối ưu nhất cho Next.js) |
| GitHub Actions | CI/CD |

---

## 🤖 AI Flow chi tiết

```
User input: "quán nướng giá rẻ gần Hoàn Kiếm buổi tối"
                          │
                          ▼
              ┌──────────────────────┐
              │     Claude API       │
              │   Parse Intent       │
              └──────────┬───────────┘
                         │
                         ▼
          {
            category: "nướng",
            price_range: 1,         ← rẻ (<100k)
            district: "Hoàn Kiếm",
            time: "evening",
            mood: null
          }
                         │
           ┌─────────────┴─────────────┐
           │                           │
           ▼                           ▼
  Qdrant vector search         SQL filter fallback
  (semantic similarity)        (nếu qdrant < 3 kết quả)
           │                           │
           └─────────────┬─────────────┘
                         │
                         ▼
              Re-rank theo:
              - Vector score (70%)
              - Rating (20%)
              - Distance từ trung tâm quận (10%)
                         │
                         ▼
              Top 10 kết quả → Response
```

---

## 📊 Data Schema

### Qdrant Collection: `restaurants`

```python
# Mỗi point trong Qdrant
{
    "id": "uuid-v4",
    "vector": [0.12, -0.34, ...],   # 1024 dims (multilingual-e5-large)
    "payload": {
        "name": "Quán Nướng Tí Hon",
        "slug": "quan-nuong-ti-hon",
        "category": "nướng",           # lẩu | nướng | cafe | bún | cơm | ...
        "subcategory": "nướng than",
        "price_range": 1,              # 1=<100k | 2=100-300k | 3=>300k
        "price_label": "<100k/người",
        "district": "Hoàn Kiếm",
        "city": "Hà Nội",
        "address": "12 Tống Duy Tân, Hoàn Kiếm",
        "lat": 21.028511,
        "lng": 105.852478,
        "phone": "024-3825-xxxx",
        "hours": {
            "mon": "10:00-22:00",
            "tue": "10:00-22:00",
            "sat": "10:00-23:00",
            "sun": "closed"
        },
        "tags": ["vỉa hè", "đông khách", "ngon", "có wifi"],
        "features": ["giao hàng", "đặt bàn", "chỗ đậu xe"],
        "rating": 4.5,
        "review_count": 128,
        "images": [
            "https://cdn.example.com/img/quan-nuong-1.jpg"
        ],
        "description": "Quán nướng than hoa nổi tiếng...",
        "postgres_id": 42
    }
}
```

### PostgreSQL Tables

```sql
-- Users
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    name        TEXT,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurants (metadata đầy đủ)
CREATE TABLE restaurants (
    id          SERIAL PRIMARY KEY,
    qdrant_id   UUID UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    address     TEXT,
    district    TEXT,
    city        TEXT DEFAULT 'Hà Nội',
    lat         FLOAT,
    lng         FLOAT,
    category    TEXT,
    price_range SMALLINT CHECK (price_range IN (1,2,3)),
    rating      FLOAT,
    review_count INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id            SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id),
    user_id       UUID REFERENCES users(id),
    rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
    content       TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Search history (analytics)
CREATE TABLE search_logs (
    id         SERIAL PRIMARY KEY,
    user_id    UUID REFERENCES users(id),
    query      TEXT NOT NULL,
    intent     JSONB,
    result_ids INT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🗂️ Cấu trúc dự án

```
restaurant-ai-app/
│
├── frontend/                        # Next.js 14 App
│   ├── public/
│   ├── app/                         # App Router
│   │   ├── layout.tsx               # Root layout (font, metadata)
│   │   ├── page.tsx                 # Trang chủ — search + map (SSR)
│   │   ├── [slug]/
│   │   │   └── page.tsx             # Chi tiết quán (SSG + ISR)
│   │   ├── profile/
│   │   │   └── page.tsx             # Trang cá nhân
│   │   └── api/
│   │       ├── search/
│   │       │   └── route.ts         # Route Handler → gọi FastAPI
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts     # NextAuth handler
│   ├── components/
│   │   ├── SearchBar/
│   │   │   └── SearchBar.tsx        # "use client"
│   │   ├── RestaurantCard/
│   │   │   └── RestaurantCard.tsx   # Server Component
│   │   ├── MapView/
│   │   │   ├── MapView.tsx          # "use client" — Google Maps
│   │   │   └── MapMarker.tsx
│   │   ├── FilterPanel/
│   │   │   └── FilterPanel.tsx      # "use client"
│   │   └── ui/                      # Shared UI components
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       └── Skeleton.tsx
│   ├── hooks/
│   │   ├── useSearch.ts             # React Query search hook
│   │   └── useGeolocation.ts
│   ├── store/
│   │   └── useAppStore.ts           # Zustand store
│   ├── lib/
│   │   └── api.ts                   # fetch wrapper + endpoints
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   ├── .env.local.example
│   ├── next.config.ts
│   └── package.json
│
├── backend/                         # FastAPI App
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── search.py        # POST /search
│   │   │   │   ├── restaurants.py   # GET /restaurants/:id
│   │   │   │   ├── reviews.py       # POST /reviews
│   │   │   │   └── auth.py
│   │   │   └── deps.py             # Dependencies injection
│   │   ├── core/
│   │   │   ├── config.py            # Settings (env vars)
│   │   │   ├── security.py
│   │   │   └── logging.py
│   │   ├── services/
│   │   │   ├── ai_service.py        # Claude API intent parsing
│   │   │   ├── embedding_service.py # Tạo vector embeddings
│   │   │   ├── qdrant_service.py    # Qdrant search
│   │   │   ├── search_service.py    # Orchestrate toàn bộ flow
│   │   │   └── cache_service.py     # Redis caching
│   │   ├── models/
│   │   │   ├── restaurant.py        # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   └── review.py
│   │   ├── schemas/
│   │   │   ├── search.py            # Pydantic schemas
│   │   │   └── restaurant.py
│   │   ├── db/
│   │   │   ├── database.py          # DB connection
│   │   │   └── migrations/          # Alembic migrations
│   │   └── main.py                  # FastAPI app entry
│   ├── scripts/
│   │   ├── ingest_data.py           # Nhập dữ liệu vào Qdrant + PG
│   │   ├── generate_embeddings.py   # Tạo embeddings cho toàn bộ data
│   │   └── seed_data.py             # Seed dữ liệu mẫu
│   ├── data/
│   │   └── restaurants.json         # Dữ liệu sạch nhập vào
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── docker-compose.yml               # Local dev: PG + Qdrant + Redis
└── README.md
```

---

## 📦 Thư viện & Packages

### Frontend — `package.json`

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "@tanstack/react-query": "^5.28.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.383.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38"
  }
}
```

### Backend — `requirements.txt`

```txt
# Web Framework
fastapi==0.111.0
uvicorn[standard]==0.29.0
pydantic==2.7.0
pydantic-settings==2.2.1
python-multipart==0.0.9

# Database
sqlalchemy==2.0.29
alembic==1.13.1
asyncpg==0.29.0
psycopg2-binary==2.9.9

# Vector DB
qdrant-client==1.9.0

# AI
anthropic==0.28.0

# Embedding (chạy local, free)
sentence-transformers==3.0.0
torch==2.3.0

# Cache
redis==5.0.4
aioredis==2.0.1

# Utilities
python-dotenv==1.0.1
httpx==0.27.0
tenacity==8.2.3       # retry logic
structlog==24.1.0     # logging
```

---

## 🔑 Environment Variables

### Frontend — `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Backend — `.env`
```env
# App
APP_ENV=development
SECRET_KEY=your_secret_key

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/restaurants_db

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=                     # để trống nếu self-host local
QDRANT_COLLECTION=restaurants

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Redis
REDIS_URL=redis://localhost:6379

# Google Maps (backend nếu cần geocoding)
GOOGLE_MAPS_API_KEY=your_key
```

---

## 🐳 Docker Compose (Local Dev)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: restaurants_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"     # HTTP API + Dashboard
      - "6334:6334"     # gRPC
    volumes:
      - qdrant_data:/qdrant/storage

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pg_data:
  qdrant_data:
```

```bash
# Khởi động toàn bộ services local
docker compose up -d

# Qdrant Dashboard
open http://localhost:6333/dashboard
```

---

## 🚀 Lộ trình phát triển

### Phase 1 — Data & Backend Core (Tuần 1-2)
- [ ] Thiết kế và nhập dữ liệu sạch vào `restaurants.json`
- [ ] Setup PostgreSQL schema + migrations
- [ ] Setup Qdrant collection
- [ ] Script generate embeddings + ingest toàn bộ data
- [ ] API `/search` cơ bản với Qdrant filter

### Phase 2 — AI Integration (Tuần 2-3)
- [ ] Tích hợp Claude API để parse intent
- [ ] Embedding service với `multilingual-e5-large`
- [ ] Semantic search + re-ranking logic
- [ ] Redis caching cho query phổ biến

### Phase 3 — Frontend (Tuần 3-4)
- [ ] Layout chính: SearchBar + ResultCards + MapView
- [ ] Google Maps integration: markers, info windows
- [ ] Trang chi tiết quán
- [ ] Filter UI (category, price, district)
- [ ] Responsive mobile

### Phase 4 — Polish & Deploy (Tuần 4-5)
- [ ] Auth (Google OAuth)
- [ ] Review & Rating system
- [ ] Analytics (search logs)
- [ ] Deploy: **Vercel** (Next.js) + Railway (FastAPI) + Qdrant Cloud
- [ ] CI/CD với GitHub Actions

---

## 💡 Gợi ý mở rộng sau MVP

- **Gợi ý theo mood**: "chỗ hẹn hò lãng mạn", "họp nhóm bạn thân"
- **Lọc theo giờ mở cửa hiện tại**: real-time hours check
- **Tích hợp Google Places API**: lấy thêm ảnh, reviews thực
- **Cá nhân hóa**: học từ lịch sử tìm kiếm của user
- **Admin panel**: nhập/sửa data quán ăn có UI

---

*Tài liệu này tổng hợp toàn bộ tech stack, flow, và cấu trúc dự án cho Restaurant AI App.*
