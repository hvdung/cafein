"""Seed restaurants into PostgreSQL (table) AND Qdrant (with real OpenAI embeddings).

Run inside the backend container:
    docker compose exec backend python scripts/seed_data.py
"""
import asyncio
import json
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from qdrant_client.models import PointStruct
from sqlalchemy import delete

from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.db.database import AsyncSessionLocal
from app.models.restaurant import Restaurant
from app.services import embedding_service
from app.services.qdrant_service import ensure_collection, get_client

DATA_FILE = Path(__file__).parent.parent / "data" / "restaurants.json"


def _embedding_text(r: dict) -> str:
    """Build the text that gets embedded — concatenate the semantically rich fields."""
    parts = [
        r.get("name", ""),
        r.get("subcategory", ""),
        r.get("district", ""),
        r.get("price_label", ""),
        " ".join(r.get("tags", [])),
        " ".join(r.get("features", [])),
        r.get("description", ""),
    ]
    return " | ".join(p for p in parts if p)


async def _seed_qdrant(restaurants: list[dict]) -> None:
    await ensure_collection(
        vector_size=settings.EMBEDDING_DIM,
        collection_name=settings.QDRANT_COLLECTION,
        recreate=True,
    )
    client = get_client()

    texts = [_embedding_text(r) for r in restaurants]
    vectors = await embedding_service.embed_texts(texts)

    points = [
        PointStruct(
            id=r["id"],
            vector=vec,
            payload={k: v for k, v in r.items() if k != "id"},
        )
        for r, vec in zip(restaurants, vectors, strict=True)
    ]
    await client.upsert(collection_name=settings.QDRANT_COLLECTION, points=points)
    logger.info("seed_qdrant_done", upserted=len(points))


async def _seed_postgres(restaurants: list[dict]) -> None:
    async with AsyncSessionLocal() as db:
        await db.execute(delete(Restaurant))
        for r in restaurants:
            db.add(
                Restaurant(
                    qdrant_id=uuid.UUID(r["id"]),
                    name=r["name"],
                    slug=r["slug"],
                    address=r.get("address"),
                    district=r.get("district"),
                    city=r.get("city", "Hà Nội"),
                    lat=r.get("lat"),
                    lng=r.get("lng"),
                    category=r.get("category"),
                    price_range=r.get("price_range"),
                    rating=r.get("rating"),
                    review_count=r.get("review_count", 0),
                    is_active=True,
                )
            )
        await db.commit()
    logger.info("seed_postgres_done", count=len(restaurants))


async def seed() -> None:
    setup_logging()
    restaurants = json.loads(DATA_FILE.read_text())
    logger.info("seed_start", count=len(restaurants))
    await _seed_postgres(restaurants)
    await _seed_qdrant(restaurants)
    logger.info("seed_complete")


if __name__ == "__main__":
    asyncio.run(seed())
