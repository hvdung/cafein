import uuid

from sqlalchemy import ForeignKey, Integer, SmallInteger, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Review(Base, TimestampMixin):
  __tablename__ = "reviews"

  id: Mapped[int] = mapped_column(Integer, primary_key=True)
  restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id"), nullable=False)
  user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
  rating: Mapped[int] = mapped_column(SmallInteger, nullable=False)
  content: Mapped[str | None] = mapped_column(Text)
