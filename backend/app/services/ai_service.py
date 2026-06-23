import json

import anthropic
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.logging import logger
from app.schemas.search import ParsedIntent

_client: anthropic.AsyncAnthropic | None = None

INTENT_SYSTEM_PROMPT = """Bạn là AI phân tích intent tìm kiếm quán ăn, cafe tại Việt Nam.
Trích xuất thông tin từ query của user và trả về JSON với cấu trúc sau:
{
    "category": "nuong|lau|cafe|bun-pho|com|null",
    "price_range": 1|2|3|null,  // 1=<100k, 2=100-300k, 3=>300k
    "district": "tên quận/huyện hoặc null",
    "time_of_day": "morning|afternoon|evening|night|null",
    "mood": "mô tả không khí hoặc null",
    "keywords": ["từ khóa liên quan"]
}
Chỉ trả về JSON, không có text khác."""


def get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=4))
async def parse_search_intent(query: str) -> ParsedIntent:
    if not settings.ANTHROPIC_API_KEY:
        logger.warning("ANTHROPIC_API_KEY not set, returning empty intent")
        return ParsedIntent(keywords=query.split())

    client = get_client()
    try:
        message = await client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=256,
            system=INTENT_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": query}],
        )
        raw = message.content[0].text.strip()
        data = json.loads(raw)
        return ParsedIntent(**data)
    except Exception as e:
        logger.error("ai_intent_parse_failed", query=query, error=str(e))
        return ParsedIntent(keywords=query.split())
