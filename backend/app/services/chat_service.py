"""Chat orchestrator: LangChain + OpenAI agent with Qdrant RAG, tool-calling & streaming.

Flow per user message:
  load history → stream LLM → if tool_calls: run tools (Qdrant/DB) → loop → stream final answer
Tokens are yielded as SSE events; full reply + sources are persisted to PostgreSQL.
"""
import json
from collections.abc import AsyncGenerator
from typing import Any

from langchain_core.messages import (
    AIMessage,
    AIMessageChunk,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langchain_openai import ChatOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.models.chat_history import ChatMessage
from app.services.chat_tools import TOOL_MAP, TOOLS

MAX_TOOL_ROUNDS = 4

SYSTEM_PROMPT = """Bạn là trợ lý ẩm thực của Gastro-AI, tư vấn quán ăn và cafe tại Hà Nội.

Nguyên tắc:
- Khi người dùng hỏi gợi ý quán ăn/cafe/địa điểm, LUÔN gọi tool `search_restaurants` để lấy dữ liệu \
thật trước khi trả lời. KHÔNG bịa tên quán không có trong kết quả tool.
- Chỉ giới thiệu những quán nằm trong kết quả trả về từ tool. Nêu rõ điểm nổi bật, khu vực, mức giá.
- Nếu người dùng hỏi chi tiết một quán, dùng `get_restaurant_details`.
- Nếu hỏi về nội dung tài liệu/văn học (không phải quán ăn), dùng `search_knowledge`.
- Với câu hỏi xã giao hoặc chung chung không cần dữ liệu, cứ trả lời tự nhiên, thân thiện.
- Trả lời bằng tiếng Việt, ngắn gọn, ấm áp. Có thể dùng **đậm** cho tên quán.
- Nếu không tìm thấy quán phù hợp, gợi ý người dùng mô tả thêm (loại món, khu vực, ngân sách)."""


_llm: ChatOpenAI | None = None


def _get_llm() -> ChatOpenAI:
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(
            model=settings.OPENAI_CHAT_MODEL,
            api_key=settings.OPENAI_API_KEY,
            temperature=0.4,
            streaming=True,
        )
    return _llm


async def _load_history(db: AsyncSession, session_id: str, limit: int = 20) -> list[BaseMessage]:
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.id.desc())
        .limit(limit)
    )
    rows = list(reversed(result.scalars().all()))
    messages: list[BaseMessage] = []
    for row in rows:
        if row.role == "user":
            messages.append(HumanMessage(content=row.content))
        else:
            messages.append(AIMessage(content=row.content))
    return messages


async def get_history(db: AsyncSession, session_id: str) -> list[dict[str, Any]]:
    """Return the full stored conversation for a session (for the GET endpoint)."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.id.asc())
    )
    return [
        {"role": r.role, "content": r.content, "sources": r.sources or []}
        for r in result.scalars().all()
    ]


async def _save_turn(
    db: AsyncSession,
    session_id: str,
    user_message: str,
    reply: str,
    sources: list[dict],
) -> None:
    db.add(ChatMessage(session_id=session_id, role="user", content=user_message))
    db.add(
        ChatMessage(
            session_id=session_id,
            role="assistant",
            content=reply,
            sources=sources or None,
        )
    )
    await db.commit()


def _sse(event: dict) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


async def stream_chat(
    db: AsyncSession,
    session_id: str,
    user_message: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE-formatted events: {type: token|sources|done|error}."""
    history = await _load_history(db, session_id)
    messages: list[BaseMessage] = [
        SystemMessage(content=SYSTEM_PROMPT),
        *history,
        HumanMessage(content=user_message),
    ]

    llm_with_tools = _get_llm().bind_tools(TOOLS)
    full_reply = ""
    sources: list[dict] = []

    try:
        for _ in range(MAX_TOOL_ROUNDS):
            gathered: AIMessageChunk | None = None
            async for chunk in llm_with_tools.astream(messages):
                gathered = chunk if gathered is None else gathered + chunk
                if chunk.content:
                    text = (
                        chunk.content
                        if isinstance(chunk.content, str)
                        else "".join(
                            part.get("text", "")
                            for part in chunk.content
                            if isinstance(part, dict)
                        )
                    )
                    if text:
                        full_reply += text
                        yield _sse({"type": "token", "content": text})

            if gathered is None:
                break
            messages.append(gathered)

            if not gathered.tool_calls:
                break

            for tc in gathered.tool_calls:
                impl = TOOL_MAP.get(tc["name"])
                if impl is None:
                    tool_result = json.dumps({"error": "unknown tool"})
                else:
                    tool_result = await impl.ainvoke(tc["args"])
                messages.append(ToolMessage(content=tool_result, tool_call_id=tc["id"]))

                if tc["name"] == "search_restaurants":
                    try:
                        parsed = json.loads(tool_result)
                        for item in parsed.get("results", []):
                            if not any(s["slug"] == item["slug"] for s in sources):
                                sources.append(item)
                    except (json.JSONDecodeError, KeyError):
                        pass

            if sources:
                yield _sse({"type": "sources", "sources": sources})

        await _save_turn(db, session_id, user_message, full_reply, sources)
        yield _sse({"type": "done"})
    except Exception as e:
        logger.error("chat_stream_failed", session_id=session_id, error=str(e))
        yield _sse({"type": "error", "message": "Xin lỗi, đã có lỗi khi xử lý yêu cầu của bạn."})
