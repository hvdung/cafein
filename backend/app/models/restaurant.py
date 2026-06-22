import uuid

from sqlalchemy import UUID, Boolean, Float, Integer, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Restaurant(Base, TimestampMixin):
  __tablename__ = "restaurants"

  id: Mapped[int] = mapped_column(Integer, primary_key=True)
  qdrant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, nullable=False)
  name: Mapped[str] = mapped_column(String(255), nullable=False)
  slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
  address: Mapped[str | None] = mapped_column(Text)
  district: Mapped[str | None] = mapped_column(String(100))
  city: Mapped[str] = mapped_column(String(100), default="Hà Nội")
  lat: Mapped[float | None] = mapped_column(Float)
  lng: Mapped[float | None] = mapped_column(Float)
  category: Mapped[str | None] = mapped_column(String(50))
  price_range: Mapped[int | None] = mapped_column(SmallInteger)
  rating: Mapped[float | None] = mapped_column(Float)
  review_count: Mapped[int] = mapped_column(Integer, default=0)
  is_active: Mapped[bool] = mapped_column(Boolean, default=True)
