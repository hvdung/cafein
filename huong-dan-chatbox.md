# Hướng dẫn xây dựng AI Chat + RAG với Qdrant

## Luồng chạy tổng quan

```
User gửi message
      │
      ▼
[1. Embedding] — chuyển message thành vector
      │
      ▼
[2. Qdrant vector_search] — tìm N restaurant gần nhất
      │
      ▼
[3. Build context] — ghép info các restaurant tìm được thành đoạn text
      │
      ▼
[4. Claude API] — gửi (system prompt + context + chat history + message)
      │
      ▼
[5. Stream response] — trả về từng token cho frontend
      │
      ▼
[6. Lưu history] — PostgreSQL hoặc Redis
```

> **Điểm mấu chốt của RAG**: Claude không trả lời từ kiến thức bản thân, nó chỉ được phép nói những gì nằm trong `context` bạn truyền vào (các restaurant từ Qdrant).

---

## Cấu trúc thư mục cần thêm

Dựa trên cấu trúc hiện tại, chỉ cần thêm vào — không cần tạo mới từ đầu:

```
backend/app/
├── api/routes/
│   └── chat.py              ← NEW: endpoint POST /chat/message, GET /chat/history
│
├── schemas/
│   └── chat.py              ← NEW: ChatMessage, ChatRequest, ChatResponse schema
│
├── services/
│   ├── chat_service.py      ← NEW: orchestrator chính (như search_service.py)
│   ├── embedding_service.py ← NEW: tạo vector từ text
│   └── qdrant_service.py    ← EDIT: thêm vector_search() vào đây (đã có sẵn hàm)
│
└── models/
    └── chat_history.py      ← NEW: PostgreSQL model lưu lịch sử hội thoại

frontend/
└── app/
    └── chat/
        └── page.tsx         ← đã có chatbox UI, chỉ cần wire vào API
```

---

## Vai trò từng file mới

### `embedding_service.py`
Nhận vào một chuỗi text, gọi embedding model (dùng `multilingual-e5-large` như spec, hoặc Claude Embedding API), trả về list float. Đây là bước biến ngôn ngữ tự nhiên thành toạ độ trong không gian vector.

### `chat_service.py`
Orchestrator — điều phối 6 bước trong luồng trên. Tương tự `search_service.py` nhưng thêm:
- Quản lý `chat_history` (truyền vào Claude để nó nhớ ngữ cảnh hội thoại)
- System prompt chuyên biệt cho chatbot ("Bạn là trợ lý tư vấn nhà hàng...")
- Có thể stream response thay vì trả về 1 lúc

### `chat.py` (route)
Expose 2 endpoint:
- `POST /chat/message` — nhận message, chạy qua `chat_service`, trả về response
- `GET /chat/history/{session_id}` — lấy lịch sử hội thoại

### `chat.py` (schema)
Định nghĩa các Pydantic model:
- `ChatMessage` — role + content
- `ChatRequest` — message + session_id + filters tùy chọn
- `ChatResponse` — reply + sources (danh sách restaurant đã dùng làm context)

### `chat_history.py` (model)
SQLAlchemy model lưu vào PostgreSQL: `session_id`, `role`, `content`, `created_at`. Cho phép lấy lại lịch sử theo session.

---

## Điểm khác biệt so với search hiện tại

|  | Search hiện tại | Chat + RAG |
|---|---|---|
| Input | Query text | Message + session history |
| Qdrant | `scroll_with_filter` (filter only) | `vector_search` (semantic) |
| Claude | Parse intent | Generate response từ context |
| Output | List restaurant | Câu trả lời tự nhiên + sources |
| State | Stateless | Stateful (history) |

---

## Bước triển khai theo thứ tự

1. **`embedding_service`** — vì tất cả phụ thuộc vào đây
2. **Kiểm tra Qdrant đã có data chưa** — nếu collection rỗng thì vector search trả về rỗng
3. **`chat_service`** — ghép embedding + qdrant + Claude lại
4. **`chat.py` route + schema**
5. **Wire vào `main.py`** để đăng ký router
6. **Frontend** gọi API thay vì dùng mock
