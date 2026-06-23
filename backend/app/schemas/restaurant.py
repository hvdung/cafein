from pydantic import BaseModel, Field


class RestaurantBase(BaseModel):
    name: str
    slug: str
    address: str | None = None
    district: str | None = None
    city: str = "Hà Nội"
    lat: float | None = None
    lng: float | None = None
    category: str | None = None
    price_range: int | None = Field(None, ge=1, le=3)
    rating: float | None = Field(None, ge=0, le=5)
    review_count: int = 0


class RestaurantResponse(RestaurantBase):
    id: int
    qdrant_id: str
    is_active: bool
    ai_match: int | None = None
    ai_insight: str | None = None

    model_config = {"from_attributes": True}


class RestaurantListResponse(BaseModel):
    items: list[RestaurantResponse]
    total: int
