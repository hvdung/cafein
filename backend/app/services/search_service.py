"""Orchestrates the full AI search flow: intent → (embedding) → vector search → re-rank."""
import time

from app.core.logging import logger
from app.schemas.search import ParsedIntent, SearchRequest, SearchResponse, SearchResultItem
from app.services import ai_service, cache_service, qdrant_service


def _rerank(results: list[dict]) -> list[dict]:
    """Re-rank by: vector score (70%) + rating (20%) + review_count weight (10%)."""
    max_reviews = max((r.get("review_count", 0) for r in results), default=1) or 1
    for r in results:
        score = r.get("score", 0) * 0.7
        score += (r.get("rating", 0) / 5.0) * 0.2
        score += (min(r.get("review_count", 0), max_reviews) / max_reviews) * 0.1
        r["_final_score"] = score
    return sorted(results, key=lambda r: r["_final_score"], reverse=True)


def _to_ai_match(score: float) -> int:
    return min(100, max(0, int(score * 100)))


def _build_result_item(r: dict) -> SearchResultItem:
    return SearchResultItem(
        id=r.get("id", ""),
        name=r.get("name", ""),
        slug=r.get("slug", ""),
        address=r.get("address"),
        district=r.get("district"),
        city=r.get("city", "Hà Nội"),
        category=r.get("category"),
        price_range=r.get("price_range"),
        rating=r.get("rating"),
        review_count=r.get("review_count", 0),
        lat=r.get("lat"),
        lng=r.get("lng"),
        ai_match=_to_ai_match(r.get("_final_score", r.get("score", 0))),
        ai_insight=r.get("description", "Quán phù hợp với yêu cầu của bạn."),
        score=r.get("_final_score", r.get("score", 0)),
    )


async def search(req: SearchRequest) -> SearchResponse:
    start = time.perf_counter()

    cache_payload = req.model_dump()
    cached = await cache_service.get_cached("search", cache_payload)
    if cached:
        logger.info("search_cache_hit", query=req.query)
        return SearchResponse(**cached)

    # 1. Parse intent via Claude
    intent: ParsedIntent = await ai_service.parse_search_intent(req.query)

    # Merge explicit filters (override AI intent)
    category = req.category or intent.category
    price_range = req.price_range or intent.price_range
    district = req.district or intent.district

    # 2. Vector search (falls back to filter-only if no vector available)
    try:
        raw_results = await qdrant_service.scroll_with_filter(
            limit=req.limit * 3,
            offset=req.offset,
            category=category,
            price_range=price_range,
            district=district,
        )
    except Exception as e:
        logger.error("qdrant_search_failed", error=str(e))
        raw_results = []

    # 3. Re-rank
    ranked = _rerank(raw_results)[: req.limit]

    took_ms = (time.perf_counter() - start) * 1000
    response = SearchResponse(
        query=req.query,
        intent=intent,
        results=[_build_result_item(r) for r in ranked],
        total=len(raw_results),
        took_ms=round(took_ms, 2),
    )

    await cache_service.set_cached("search", cache_payload, response.model_dump())
    logger.info("search_completed", query=req.query, results=len(ranked), took_ms=took_ms)
    return response
