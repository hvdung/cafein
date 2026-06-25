# Tài liệu chi tiết: Chức năng Chatbox AI

Tài liệu này mô tả **kiến trúc, luồng hoạt động và từng file** của tính năng chat AI
đã xây dựng cho Gastro-AI: chat thường + RAG (Qdrant) + tool-calling lấy dữ liệu nhà hàng +
lưu lịch sử vào PostgreSQL + streaming theo thời gian thực.

> Stack: **FastAPI · LangChain · OpenAI · Qdrant · PostgreSQL** (backend) và
> **Next.js 14 App Router** (frontend). Tất cả chạy qua Docker Compose.

---

## 1. Tổng quan luồng chạy

```
                       Người dùng gõ tin nhắn (frontend /chat)
                                      │
                                      ▼  POST /api/v1/chat/message  { session_id, message }
        ┌─────────────────────────────────────────────────────────────────────┐
        │  chat_service.stream_chat()                                          │
        │                                                                      │
        │  1. Load lịch sử hội thoại của session_id từ PostgreSQL              │
        │  2. Ghép: [SystemPrompt] + [history] + [HumanMessage(message)]       │
        │  3. Gọi LLM (OpenAI) đã .bind_tools(...)  ── stream token            │
        │                                                                      │
        │  4. Nếu LLM yêu cầu gọi tool:                                        │
        │       ├─ search_restaurants  → embedding → Qdrant vector_search      │
        │       ├─ get_restaurant_details → PostgreSQL                         │
        │       └─ search_knowledge    → embedding → Qdrant documents          │
        │     → đưa kết quả tool trở lại cho LLM → lặp lại bước 3              │
        │                                                                      │
        │  5. Khi LLM không gọi tool nữa → đây là câu trả lời cuối            │
        │  6. Lưu (user message + assistant reply + sources) vào PostgreSQL    │
        └─────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼  Server-Sent Events (SSE)
              data: {"type":"token","content":"..."}   ← từng token
              data: {"type":"sources","sources":[...]} ← thẻ quán gợi ý
              data: {"type":"done"}                     ← kết thúc
```

**Điểm cốt lõi của RAG + tool-calling:** LLM *không* tự bịa tên quán. Khi cần dữ liệu, nó
gọi tool để truy vấn Qdrant/PostgreSQL, nhận về dữ liệu thật, rồi mới soạn câu trả lời dựa
trên dữ liệu đó.

---

## 2. Backend — các file & vai trò

### 2.1. `app/core/config.py` (sửa)
Thêm cấu hình OpenAI và collection tài liệu:
- `OPENAI_API_KEY`, `OPENAI_CHAT_MODEL` (mặc định `gpt-4o-mini`),
  `OPENAI_EMBEDDING_MODEL` (`text-embedding-3-small`), `EMBEDDING_DIM` = 1536.
- `QDRANT_DOCS_COLLECTION` = `documents` (tách riêng với collection `restaurants`).

### 2.2. `app/services/embedding_service.py` (mới)
Bọc `OpenAIEmbeddings` của LangChain — biến **text → vector 1536 chiều**.
- `embed_query(text)` — embed 1 câu truy vấn.
- `embed_texts(texts)` — embed cả lô (dùng khi seed/ingest).

Đây là bước biến ngôn ngữ tự nhiên thành toạ độ trong không gian vector để Qdrant so khớp.

### 2.3. `app/services/qdrant_service.py` (sửa)
- `ensure_collection(vector_size, collection_name, recreate)` — tạo collection; có cờ
  `recreate=True` để xoá rồi tạo lại (dùng khi seed/ingest).
- `vector_search(vector, limit, category, price_range, district)` — **semantic search** trên
  collection `restaurants`, có thể kèm filter cứng. Dùng `client.query_points(...)`
  (API mới của qdrant-client ≥ 1.10; bản `.search()` cũ đã bị gỡ).
- `document_search(vector, limit)` — semantic search trên collection `documents` (PDF đã nạp).

### 2.4. `app/services/chat_tools.py` (mới) — 3 công cụ LangChain
Mỗi tool là một hàm `@tool` async; LLM tự quyết định gọi tool nào dựa trên docstring tiếng Việt.

| Tool | Nguồn dữ liệu | Khi nào LLM gọi |
|---|---|---|
| `search_restaurants(query, category?, price_range?, district?)` | Qdrant `restaurants` | Người dùng muốn gợi ý quán ăn/cafe |
| `get_restaurant_details(slug)` | PostgreSQL `restaurants` | Hỏi sâu về một quán cụ thể |
| `search_knowledge(query)` | Qdrant `documents` | Hỏi về nội dung tài liệu/văn học |

- `search_restaurants` trả về JSON gọn (`name, slug, category, district, price, rating, score, ...`).
  Backend dùng chính JSON này để vừa cho LLM đọc, vừa trích ra **sources** gửi cho frontend.
- `TOOLS` = danh sách 3 tool; `TOOL_MAP` = ánh xạ tên → tool để gọi khi LLM yêu cầu.

### 2.5. `app/services/chat_service.py` (mới) — orchestrator chính
Trái tim của tính năng. Hàm `stream_chat(db, session_id, user_message)` là async generator
sinh ra các chuỗi SSE.

**System prompt** ràng buộc hành vi: luôn gọi `search_restaurants` khi hỏi quán, không bịa,
trả lời tiếng Việt ngắn gọn ấm áp.

**Vòng lặp agent (tối đa `MAX_TOOL_ROUNDS = 4`):**
1. `astream(messages)` — stream từng `AIMessageChunk`, cộng dồn lại thành `gathered`.
   - Có `chunk.content` (text) → yield event `token` cho frontend ngay.
2. Sau khi stream xong 1 vòng: nếu `gathered.tool_calls` rỗng → đây là câu trả lời cuối, dừng.
3. Nếu có tool_calls → chạy từng tool (`await impl.ainvoke(args)`), gắn kết quả vào `messages`
   dưới dạng `ToolMessage`, rồi **lặp lại** để LLM đọc kết quả và soạn câu trả lời.
4. Với tool `search_restaurants`, parse JSON kết quả để gom **sources** (khử trùng theo `slug`),
   yield event `sources`.
5. Kết thúc: gọi `_save_turn(...)` lưu cặp (user, assistant) + sources vào `chat_messages`,
   yield event `done`.

Các hàm phụ:
- `_load_history()` — lấy 20 lượt gần nhất, chuyển thành `HumanMessage`/`AIMessage` cho LLM nhớ ngữ cảnh.
- `get_history()` — trả về toàn bộ lịch sử (cho endpoint GET).
- `_save_turn()` — ghi DB.
- `_sse(event)` — format `data: {json}\n\n` chuẩn SSE.

### 2.6. `app/models/chat_history.py` (mới) — model lưu lịch sử
Bảng `chat_messages`: `id`, `session_id` (index), `role` (`user|assistant`), `content`,
`sources` (JSONB — danh sách quán đã dùng làm context), `created_at`, `updated_at`.

Migration: `alembic/versions/0002_chat_messages.py` (đã đăng ký trong `alembic/env.py`).

### 2.7. `app/schemas/chat.py` (mới)
- `ChatRequest` — `{ session_id, message }`.
- `ChatHistoryMessage` / `ChatHistoryResponse` — cho endpoint lấy lịch sử.

### 2.8. `app/api/routes/chat.py` (mới) — 3 endpoint

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/v1/chat/message` | Trả về `StreamingResponse` media-type `text/event-stream` (SSE). |
| `GET` | `/api/v1/chat/history/{session_id}` | Lấy toàn bộ lịch sử của session. |
| `DELETE` | `/api/v1/chat/history/{session_id}` | Xoá lịch sử của session. |

Đã đăng ký router trong `app/main.py`.

---

## 3. Scripts dữ liệu

### 3.1. `scripts/seed_data.py` (viết lại)
Nạp `data/restaurants.json` vào **cả 2 nơi**:
- **PostgreSQL** bảng `restaurants` (xoá sạch rồi insert lại).
- **Qdrant** collection `restaurants` — tạo embedding thật từ OpenAI cho mỗi quán
  (ghép `name + subcategory + district + tags + features + description` rồi embed).

```bash
docker compose exec backend python scripts/seed_data.py
```

### 3.2. `scripts/ingest_documents.py` (mới)
Đọc file trong `backend/public/` (PDF/TXT/MD) → cắt chunk (`RecursiveCharacterTextSplitter`,
chunk 800 / overlap 120) → embedding → nạp vào Qdrant collection `documents`.

```bash
docker compose exec backend python scripts/ingest_documents.py
```

> ⚠️ Ingest **không tự động**: mỗi lần thêm file vào `public/` phải chạy lại lệnh này.
> Script dùng `recreate=True` nên mỗi lần chạy sẽ nạp lại toàn bộ (không trùng lặp).

---

## 4. Frontend — các file & vai trò

### 4.1. `lib/api/chat.ts` (mới) — lớp gọi API
- `getSessionId()` — sinh & lưu `session_id` trong `localStorage` (key `gastro_chat_session`),
  giúp **tải lại trang không mất lịch sử chat**.
- `fetchHistory(sessionId)` — gọi `GET /chat/history`.
- `clearHistory(sessionId)` — gọi `DELETE`.
- `streamChat(sessionId, message, handlers)` — **đọc luồng SSE**: dùng
  `fetch().body.getReader()`, decode, tách theo `\n\n`, parse từng `data:` và gọi callback
  `onToken / onSources / onDone / onError`.

### 4.2. `components/ai-chat.tsx` (viết lại) — UI chat
- Khi mount: lấy `session_id`, gọi `fetchHistory` để **khôi phục lịch sử**.
- Khi gửi: thêm bubble user + 1 bubble AI rỗng (làm đích để đổ token), rồi gọi `streamChat`:
  - `onToken` → nối token vào bubble AI (hiệu ứng gõ từng chữ).
  - `onSources` → gắn danh sách thẻ quán gợi ý (link sang `/{slug}`).
  - `onError` → hiện thông báo lỗi.
- Trạng thái `thinking` (trước token đầu) hiển thị 3 chấm; `streaming` khi đang đổ token.

### 4.3. `app/chat/page.tsx` & `components/right-panel.tsx` (sửa)
Bỏ truyền prop `restaurants` (trước đây dùng mock-data) — `AiChat` nay tự lấy dữ liệu qua API.

---

## 5. Bản vá lỗi: "hiện thêm 1 bubble trống"

**Hiện tượng:** khi vừa gửi, màn hình hiện 1 bong bóng AI **trống** + 1 bong bóng "đang gõ" (3 chấm).

**Nguyên nhân:** lúc gửi, code thêm sẵn 1 bubble AI rỗng (placeholder để stream token vào).
Nhưng cùng lúc `thinking = true` nên bubble 3 chấm cũng hiện → thành 2 bong bóng.

**Cách sửa** (trong `ai-chat.tsx`): **bỏ qua không render** bubble AI khi nó còn rỗng
(chưa có `text` và chưa có `recs`). Lúc đó chỉ còn 3 chấm "đang gõ". Khi token đầu tiên về,
`thinking = false` và bubble có nội dung → render bình thường, 3 chấm biến mất.

```tsx
{messages.map((msg) => {
  // Bỏ qua placeholder AI khi chưa có nội dung — 3 chấm "đang gõ" đã đại diện trạng thái này.
  if (msg.role === "ai" && !msg.text && !(msg.recs && msg.recs.length)) {
    return null;
  }
  return ( /* ...render bubble... */ );
})}
```

---

## 6. Các loại sự kiện SSE (giao kèo backend ↔ frontend)

| `type` | Payload | Ý nghĩa |
|---|---|---|
| `token` | `{ content: string }` | Một mẩu text của câu trả lời (stream dần) |
| `sources` | `{ sources: [...] }` | Danh sách quán dùng làm context → render thẻ gợi ý |
| `done` | — | Kết thúc, đã lưu lịch sử |
| `error` | `{ message: string }` | Có lỗi khi xử lý |

---

## 7. Kiểm thử nhanh

```bash
# Chat có tool-calling (gợi ý quán)
curl -N -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"session_id":"demo","message":"Gợi ý quán cafe yên tĩnh ở Tây Hồ"}'

# Lấy lại lịch sử
curl http://localhost:8000/api/v1/chat/history/demo

# Tra cứu tài liệu đã ingest
curl -N -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"session_id":"kb","message":"Truyện Kiều mở đầu bằng câu nào?"}'
```

Đã kiểm thử end-to-end: streaming ✔, tool-calling + sources ✔, RAG tài liệu PDF ✔,
lưu & khôi phục lịch sử ✔, chat thường ✔.
