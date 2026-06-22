"""Ingest restaurants.json into Qdrant (and optionally PostgreSQL)."""
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from qdrant_client.models import PointStruct

from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.services.qdrant_service import ensure_collection, get_client

DATA_FILE = Path(__file__).parent.parent / "data" / "restaurants.json"
VECTOR_SIZE = 4  # placeholder; replace with real embedding size (e.g. 1024)


def _dummy_vector(size: int) -> list[float]:
  """Placeholder vector. Replace with real embedding service call."""
  import random
  return [random.uniform(-1, 1) for _ in range(size)]


async def seed() -> None:
  setup_logging()
  restaurants = json.loads(DATA_FILE.read_text())
  logger.info("seed_start", count=len(restaurants))

  await ensure_collection(vector_size=VECTOR_SIZE)
  client = get_client()

  points = [
    PointStruct(
      id=r["id"],
      vector=_dummy_vector(VECTOR_SIZE),
      payload={k: v for k, v in r.items() if k != "id"},
    )
    for r in restaurants
  ]

  await client.upsert(collection_name=settings.QDRANT_COLLECTION, points=points)
  logger.info("seed_done", upserted=len(points))


if __name__ == "__main__":
  asyncio.run(seed())
