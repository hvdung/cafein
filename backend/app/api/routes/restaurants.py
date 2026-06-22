from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.restaurant import Restaurant
from app.schemas.restaurant import RestaurantListResponse, RestaurantResponse

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.get("", response_model=RestaurantListResponse)
async def list_restaurants(
  skip: int = 0,
  limit: int = 20,
  category: str | None = None,
  db: AsyncSession = Depends(get_db),
) -> RestaurantListResponse:
  query = select(Restaurant).where(Restaurant.is_active.is_(True))
  if category:
    query = query.where(Restaurant.category == category)
  result = await db.execute(query.offset(skip).limit(limit))
  items = result.scalars().all()
  return RestaurantListResponse(items=list(items), total=len(items))


@router.get("/{slug}", response_model=RestaurantResponse)
async def get_restaurant(slug: str, db: AsyncSession = Depends(get_db)) -> RestaurantResponse:
  result = await db.execute(select(Restaurant).where(Restaurant.slug == slug))
  restaurant = result.scalar_one_or_none()
  if not restaurant:
    raise HTTPException(status_code=404, detail="Restaurant not found")
  return RestaurantResponse.model_validate(restaurant)
