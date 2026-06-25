from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.chat_history import ChatMessage
from app.schemas.chat import ChatHistoryResponse, ChatRequest
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message")
async def chat_message(req: ChatRequest, db: AsyncSession = Depends(get_db)) -> StreamingResponse:
    """Stream the assistant reply token-by-token as Server-Sent Events."""
    generator = chat_service.stream_chat(db, req.session_id, req.message)
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def chat_history(session_id: str, db: AsyncSession = Depends(get_db)) -> ChatHistoryResponse:
    messages = await chat_service.get_history(db, session_id)
    return ChatHistoryResponse(session_id=session_id, messages=messages)


@router.delete("/history/{session_id}")
async def clear_history(session_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    await db.execute(delete(ChatMessage).where(ChatMessage.session_id == session_id))
    await db.commit()
    return {"status": "cleared"}
