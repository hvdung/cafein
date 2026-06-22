from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import AuthResponse, UserLogin, UserOut, UserRegister
from app.services.user_service import login_user, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo tài khoản mới",
)
async def register(
    body: UserRegister,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    token, user = await register_user(db, body.email, body.name, body.password)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Đăng nhập, nhận JWT",
)
async def login(
    body: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    token, user = await login_user(db, body.email, body.password)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Đăng xuất (client tự xoá token)",
    dependencies=[Depends(get_current_user)],   # yêu cầu token hợp lệ
)
async def logout() -> None:
    # JWT là stateless — server không lưu token nên không thể revoke.
    # Client phải tự xoá token khỏi storage.
    # Để revoke thật sự cần thêm Redis blacklist (bước sau).
    return None


@router.get(
    "/me",
    response_model=UserOut,
    summary="Lấy thông tin user đang đăng nhập",
)
async def me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)
