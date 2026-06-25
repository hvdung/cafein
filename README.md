# Gastro-AI — Hướng dẫn Chat, Seed & Ingest

Ứng dụng gợi ý nhà hàng/cafe tại Hà Nội. Tài liệu này hướng dẫn cách chạy tính năng
**Chat AI (RAG + tool-calling, streaming)**, **tạo dữ liệu seed**, và **nạp tài liệu (ingest) vào Qdrant**.

> ⚠️ Mọi lệnh đều chạy qua **Docker Compose**. Backend dùng **LangChain + OpenAI**, vector DB là **Qdrant**, lịch sử chat lưu ở **PostgreSQL**.

---

## 1. Khởi động hệ thống

```bash
# Bật toàn bộ services: frontend (3000), backend (8000), postgres (5432), qdrant (6333), redis (6379)
docker compose up -d

# Kiểm tra trạng thái
docker compose ps
```

Cấu hình khóa API nằm trong `backend/.env` (bắt buộc có `OPENAI_API_KEY`):

```env
OPENAI_API_KEY=sk-...
# tùy chọn — đã có default
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
QDRANT_COLLECTION=restaurants
QDRANT_DOCS_COLLECTION=documents
```

---

## 2. Chạy migration (tạo bảng)

Lần đầu hoặc khi có migration mới (vd bảng `chat_messages` lưu lịch sử chat):

```bash
docker compose exec backend alembic upgrade head
```

---

## 3. Tạo dữ liệu seed (nhà hàng)

Script nạp dữ liệu nhà hàng từ [`backend/data/restaurants.json`](backend/data/restaurants.json)
vào **PostgreSQL** (bảng `restaurants`) **và** **Qdrant** (collection `restaurants`, kèm embedding thật từ OpenAI).

```bash
docker compose exec backend python scripts/seed_data.py
```

- Mỗi lần chạy sẽ **xóa sạch và nạp lại** collection `restaurants` + bảng `restaurants`.
- Muốn thêm/sửa quán: chỉnh `backend/data/restaurants.json` rồi chạy lại lệnh trên.
- Mỗi quán cần `id` (UUID), `name`, `slug`, `category` (`nuong|lau|cafe|bun-pho|com`),
  `price_range` (`1|2|3`), `district`, `description`, `tags`, ...

---

## 4. Nạp tài liệu vào Qdrant (Ingest)

Cho phép chat trả lời dựa trên nội dung file (PDF/TXT/MD) — qua tool `search_knowledge`.

**Bước 1 — copy file vào thư mục:**

```bash
backend/public/        # đặt file .pdf / .txt / .md vào đây
```

**Bước 2 — chạy ingest:**

```bash
docker compose exec backend python scripts/ingest_documents.py
```

Script sẽ: đọc tất cả file trong `backend/public/` → cắt thành chunk → tạo embedding →
nạp vào Qdrant collection `documents`.

> ❗ **Quan trọng:** Việc nạp tài liệu **KHÔNG tự động**. Mỗi lần thêm/đổi file trong `public/`
> bạn phải chạy lại `python scripts/ingest_documents.py`. Chat chỉ *đọc* dữ liệu đã được nạp sẵn.
>
> Mỗi lần chạy sẽ **nạp lại toàn bộ** (xóa collection `documents` cũ rồi tạo mới) nên không bị trùng lặp.

---

## 5. Sử dụng Chat

### Trên giao diện
Mở **http://localhost:3000/chat**. Lịch sử hội thoại được lưu theo `session_id`
(tự sinh và giữ trong `localStorage`), nên tải lại trang **không mất lịch sử chat**.

### Tính năng
- **Chat thường với AI** — câu hỏi xã giao trả lời tự nhiên.
- **RAG + tool-calling** — khi hỏi về quán ăn/cafe, AI gọi tool truy vấn Qdrant/PostgreSQL
  để lấy dữ liệu thật (không bịa), kèm thẻ gợi ý quán.
- **Tra cứu tài liệu** — hỏi về nội dung file đã ingest (vd Truyện Kiều).
- **Streaming** — trả lời từng token theo thời gian thực (SSE).
- **Lưu lịch sử** — mỗi lượt chat ghi vào PostgreSQL (`chat_messages`).

### Các API endpoint

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/v1/chat/message` | Gửi tin nhắn, nhận phản hồi **stream (SSE)**. Body: `{ "session_id": "...", "message": "..." }` |
| `GET`  | `/api/v1/chat/history/{session_id}` | Lấy toàn bộ lịch sử hội thoại của session |
| `DELETE` | `/api/v1/chat/history/{session_id}` | Xóa lịch sử của session |

Ví dụ test nhanh bằng `curl`:

```bash
curl -N -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"session_id":"demo","message":"Gợi ý quán cafe yên tĩnh ở Tây Hồ"}'
```

---

## 6. Quy trình thiết lập lần đầu (tóm tắt)

```bash
docker compose up -d                                       # 1. bật services
docker compose exec backend alembic upgrade head           # 2. tạo bảng
docker compose exec backend python scripts/seed_data.py    # 3. seed nhà hàng
docker compose exec backend python scripts/ingest_documents.py  # 4. nạp tài liệu (nếu cần)
# 5. mở http://localhost:3000/chat
```
