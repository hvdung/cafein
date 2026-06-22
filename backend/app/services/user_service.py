import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def register_user(
    db: AsyncSession, email: str, name: str, password: str
) -> tuple[str, User]:
    if await get_user_by_email(db, email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(email=email, name=name, password_hash=hash_password(password))
    db.add(user)
    await db.flush()   # gán id mà chưa commit — commit do get_db dependency xử lý
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return token, user


async def login_user(
    db: AsyncSession, email: str, password: str
) -> tuple[str, User]:
    user = await get_user_by_email(db, email)

    if not user or not user.password_hash or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user.id)})
    return token, user
