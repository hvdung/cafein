from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
  query: str = Field(..., min_length=1, max_length=500, description="Natural language search query")
  limit: int = Field(10, ge=1, le=50)
  offset: int = Field(0, ge=0)
  # Optional hard filters (bypasses AI intent parsing if provided)
  category: str | None = None
  price_range: int | None = Field(None, ge=1, le=3)
  district: str | None = None


class ParsedIntent(BaseModel):
  category: str | None = None
  price_range: int | None = None
  district: str | None = None
  time_of_day: str | None = None
  mood: str | None = None
  keywords: list[str] = []


class SearchResultItem(BaseModel):
  id: str
  name: str
  slug: str
  address: str | None
  district: str | None
  city: str
  category: str | None
  price_range: int | None
  rating: float | None
  review_count: int
  lat: float | None
  lng: float | None
  ai_match: int
  ai_insight: str
  score: float


class SearchResponse(BaseModel):
  query: str
  intent: ParsedIntent
  results: list[SearchResultItem]
  total: int
  took_ms: float
