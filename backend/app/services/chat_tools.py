"""LangChain tools the chat agent can call to fetch real restaurant / document data."""
import json

from langchain_core.tools import tool
from sqlalchemy import or_, select

from app.core.logging import logger
from app.db.database import AsyncSessionLocal
from app.models.restaurant import Restaurant
from app.services import embedding_service, qdrant_service


def _slim_restaurant(r: dict) -> dict:
    """Keep only the fields useful to the LLM and to the frontend rec cards."""
    return {
        "name": r.get("name"),
        "slug": r.get("slug"),
        "category": r.get("category"),
        "district": r.get("district"),
        "city": r.get("city", "Hà Nội"),
        "address": r.get("address"),
        "price_range": r.get("price_range"),
        "price_label": r.get("price_label"),
        "rating": r.get("rating"),
        "review_count": r.get("review_count"),
        "tags": r.get("tags"),
        "description": r.get("description"),
        "score": round(float(r.get("score", 0)), 4),
    }


@tool
async def search_restaurants(
    query: str,
    category: str | None = None,
    price_range: int | None = None,
    district: str | None = None,
) -> str:
    """Tìm kiếm nhà hàng/quán ăn/cafe phù hợp với nhu cầu của người dùng bằng semantic search.

    Dùng tool này MỖI KHI người dùng muốn gợi ý quán ăn, cafe, hoặc hỏi về địa điểm ăn uống.

    Args:
        query: Mô tả nhu cầu bằng tiếng Việt tự nhiên (vd "cafe yên tĩnh để làm việc ở Tây Hồ").
        category: Lọc theo loại, một trong: nuong, lau, cafe, bun-pho, com. Để trống nếu không rõ.
        price_range: Lọc theo mức giá: 1=<100k, 2=100-300k, 3=>300k. Để trống nếu không rõ.
        district: Lọc theo quận/huyện (vd "Tây Hồ", "Hoàn Kiếm"). Để trống nếu không rõ.
    """
    try:
        vector = await embedding_service.embed_query(query)
        results = await qdrant_service.vector_search(
            vector,
            limit=5,
            category=category,
            price_range=price_range,
            district=district,
        )
    except Exception as e:
        logger.error("tool_search_restaurants_failed", error=str(e))
        return json.dumps({"results": [], "error": "không truy vấn được dữ liệu quán"})

    slim = [_slim_restaurant(r) for r in results]
    return json.dumps({"results": slim}, ensure_ascii=False)


@tool
async def get_restaurant_details(slug: str) -> str:
    """Lấy thông tin chi tiết của một nhà hàng cụ thể theo slug (lấy được từ search_restaurants).

    Dùng khi người dùng hỏi sâu về một quán cụ thể (địa chỉ, đánh giá, mức giá...).
    """
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Restaurant).where(
                    or_(Restaurant.slug == slug, Restaurant.name.ilike(f"%{slug}%"))
                )
            )
            r = result.scalars().first()
    except Exception as e:
        logger.error("tool_get_restaurant_failed", slug=slug, error=str(e))
        return json.dumps({"found": False})

    if not r:
        return json.dumps({"found": False})

    return json.dumps(
        {
            "found": True,
            "name": r.name,
            "slug": r.slug,
            "category": r.category,
            "district": r.district,
            "city": r.city,
            "address": r.address,
            "price_range": r.price_range,
            "rating": r.rating,
            "review_count": r.review_count,
        },
        ensure_ascii=False,
    )


@tool
async def search_knowledge(query: str) -> str:
    """Tra cứu thông tin trong kho tài liệu nội bộ (các file PDF đã được nạp vào hệ thống).

    Dùng khi người dùng hỏi về nội dung tài liệu/văn học/kiến thức không liên quan đến quán ăn.
    """
    try:
        vector = await embedding_service.embed_query(query)
        passages = await qdrant_service.document_search(vector, limit=4)
    except Exception as e:
        logger.error("tool_search_knowledge_failed", error=str(e))
        return json.dumps({"passages": []})

    slim = [
        {"source": p.get("source"), "page": p.get("page"), "text": p.get("text")}
        for p in passages
    ]
    return json.dumps({"passages": slim}, ensure_ascii=False)


TOOLS = [search_restaurants, get_restaurant_details, search_knowledge]
TOOL_MAP = {t.name: t for t in TOOLS}
