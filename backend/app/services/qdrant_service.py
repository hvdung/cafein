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


async def ensure_collection(
    vector_size: int = 1024,
    collection_name: str | None = None,
    recreate: bool = False,
) -> None:
    client = get_client()
    name = collection_name or settings.QDRANT_COLLECTION
    collections = await client.get_collections()
    names = [c.name for c in collections.collections]
    if name in names and recreate:
        await client.delete_collection(collection_name=name)
        names.remove(name)
    if name not in names:
        await client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )
        logger.info("qdrant_collection_created", collection=name)


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

    response = await client.query_points(
        collection_name=settings.QDRANT_COLLECTION,
        query=vector,
        query_filter=query_filter,
        limit=limit,
        with_payload=True,
    )
    return [{"id": str(r.id), "score": r.score, **r.payload} for r in response.points]


async def document_search(vector: list[float], limit: int = 4) -> list[dict]:
    """Semantic search over the ingested documents collection (e.g. PDFs in /public)."""
    client = get_client()
    response = await client.query_points(
        collection_name=settings.QDRANT_DOCS_COLLECTION,
        query=vector,
        limit=limit,
        with_payload=True,
    )
    return [{"score": r.score, **r.payload} for r in response.points]


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
