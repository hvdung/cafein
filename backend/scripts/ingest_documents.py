"""Ingest PDF/text files from backend/public/ into the Qdrant `documents` collection.

This gives the chat agent extra knowledge (via the `search_knowledge` tool) beyond
the restaurant data. Run inside the backend container:

    docker compose exec backend python scripts/ingest_documents.py
"""
import asyncio
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client.models import PointStruct

from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.services import embedding_service
from app.services.qdrant_service import ensure_collection, get_client

PUBLIC_DIR = Path(__file__).parent.parent / "public"
BATCH = 64


def _load_chunks() -> list[dict]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=120)
    chunks: list[dict] = []
    for path in sorted(PUBLIC_DIR.glob("*")):
        if path.suffix.lower() == ".pdf":
            docs = PyPDFLoader(str(path)).load()
        elif path.suffix.lower() in {".txt", ".md"}:
            from langchain_community.document_loaders import TextLoader

            docs = TextLoader(str(path), encoding="utf-8").load()
        else:
            continue
        for doc in splitter.split_documents(docs):
            text = doc.page_content.strip()
            if not text:
                continue
            chunks.append(
                {
                    "text": text,
                    "source": path.name,
                    "page": doc.metadata.get("page"),
                }
            )
        logger.info("doc_loaded", file=path.name)
    return chunks


async def ingest() -> None:
    setup_logging()
    if not PUBLIC_DIR.exists():
        logger.warning("public_dir_missing", path=str(PUBLIC_DIR))
        return

    chunks = _load_chunks()
    if not chunks:
        logger.warning("no_documents_found", path=str(PUBLIC_DIR))
        return
    logger.info("ingest_start", chunks=len(chunks))

    await ensure_collection(
        vector_size=settings.EMBEDDING_DIM,
        collection_name=settings.QDRANT_DOCS_COLLECTION,
        recreate=True,
    )
    client = get_client()

    for start in range(0, len(chunks), BATCH):
        batch = chunks[start : start + BATCH]
        vectors = await embedding_service.embed_texts([c["text"] for c in batch])
        points = [
            PointStruct(id=str(uuid.uuid4()), vector=vec, payload=chunk)
            for chunk, vec in zip(batch, vectors, strict=True)
        ]
        await client.upsert(collection_name=settings.QDRANT_DOCS_COLLECTION, points=points)
        logger.info("ingest_batch", upserted=start + len(batch))

    logger.info("ingest_complete", total=len(chunks))


if __name__ == "__main__":
    asyncio.run(ingest())
