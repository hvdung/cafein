"""Text → vector embeddings via OpenAI (LangChain wrapper)."""
from langchain_openai import OpenAIEmbeddings

from app.core.config import settings

_embeddings: OpenAIEmbeddings | None = None


def get_embeddings() -> OpenAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = OpenAIEmbeddings(
            model=settings.OPENAI_EMBEDDING_MODEL,
            api_key=settings.OPENAI_API_KEY,
        )
    return _embeddings


async def embed_query(text: str) -> list[float]:
    """Embed a single query string."""
    return await get_embeddings().aembed_query(text)


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of documents."""
    return await get_embeddings().aembed_documents(texts)
