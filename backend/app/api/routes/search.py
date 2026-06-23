from fastapi import APIRouter

from app.schemas.search import SearchRequest, SearchResponse
from app.services import search_service

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def search_restaurants(req: SearchRequest) -> SearchResponse:
    return await search_service.search(req)
