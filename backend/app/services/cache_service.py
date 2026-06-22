import hashlib
import json

import redis.asyncio as aioredis

from app.core.config import settings
from app.core.logging import logger

_redis: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


def _cache_key(prefix: str, payload: dict) -> str:
    digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()[:16]
    return f"{prefix}:{digest}"


async def get_cached(prefix: str, payload: dict) -> dict | None:
    try:
        key = _cache_key(prefix, payload)
        raw = await get_redis().get(key)
        return json.loads(raw) if raw else None
    except Exception as e:
        logger.warning("cache_get_failed", error=str(e))
        return None


async def set_cached(prefix: str, payload: dict, value: dict, ttl: int | None = None) -> None:
    try:
        key = _cache_key(prefix, payload)
        await get_redis().setex(key, ttl or settings.REDIS_TTL_SECONDS, json.dumps(value))
    except Exception as e:
        logger.warning("cache_set_failed", error=str(e))


async def close() -> None:
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None
