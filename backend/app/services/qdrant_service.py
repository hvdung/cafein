from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, FieldCondition, Filter, MatchValue, VectorParams

from app.core.config import settings
from app.core.logging import logger

_client: AsyncQdrantClient | None = None


def get_client() -> AsyncQdrantClient:
  global _client
  if _client is None:
    _client = AsyncQdrantClient(
      url=settings.QDRANT_URL,
      api_key=settings.QDRANT_API_KEY or None,
    )
  return _client


async def ensure_collection(vector_size: int = 1024) -> None:
  client = get_client()
  collections = await client.get_collections()
  names = [c.name for c in collections.collections]
  if settings.QDRANT_COLLECTION not in names:
    await client.create_collection(
      collection_name=settings.QDRANT_COLLECTION,
      vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )
    logger.info("qdrant_collection_created", collection=settings.QDRANT_COLLECTION)


def _build_filter(
  category: str | None = None,
  price_range: int | None = None,
  district: str | None = None,
) -> Filter | None:
  conditions = []
  if category:
    conditions.append(FieldCondition(key="category", match=MatchValue(value=category)))
  if price_range:
    conditions.append(FieldCondition(key="price_range", match=MatchValue(value=price_range)))
  if district:
    conditions.append(FieldCondition(key="district", match=MatchValue(value=district)))
  return Filter(must=conditions) if conditions else None


async def vector_search(
  vector: list[float],
  limit: int = 10,
  category: str | None = None,
  price_range: int | None = None,
  district: str | None = None,
) -> list[dict]:
  client = get_client()
  query_filter = _build_filter(category, price_range, district)

  results = await client.search(
    collection_name=settings.QDRANT_COLLECTION,
    query_vector=vector,
    query_filter=query_filter,
    limit=limit,
    with_payload=True,
  )
  return [{"id": str(r.id), "score": r.score, **r.payload} for r in results]


async def scroll_with_filter(
  limit: int = 10,
  offset: int = 0,
  category: str | None = None,
  price_range: int | None = None,
  district: str | None = None,
) -> list[dict]:
  """Fallback filter-only search when no embedding is available."""
  client = get_client()
  query_filter = _build_filter(category, price_range, district)

  records, _ = await client.scroll(
    collection_name=settings.QDRANT_COLLECTION,
    scroll_filter=query_filter,
    limit=limit,
    offset=offset,
    with_payload=True,
  )
  return [{"id": str(r.id), "score": 0.5, **r.payload} for r in records]
