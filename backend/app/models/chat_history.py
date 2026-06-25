from typing import Any

from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class ChatMessage(Base, TimestampMixin):
    """A single turn in a chat conversation, grouped by session_id."""

    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # "user" | "assistant"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # Restaurant cards / passages the assistant used as context (assistant turns only)
    sources: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB, nullable=True)
