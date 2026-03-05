from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.models import TokenResponse, UserLogin, UserRegister, UserResponse
from app.services.auth_service import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: UserRegister):
    """Register a new user account."""
    db = get_db()
    existing = await db.Users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user_doc = {
        "name": body.name.strip(),
        "email": body.email.lower().strip(),
        "password": hash_password(body.password),
    }
    result = await db.Users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token(
        {"sub": user_id, "email": user_doc["email"], "name": user_doc["name"]}
    )
    return TokenResponse(
        accessToken=token,
        user=UserResponse(id=user_id, email=user_doc["email"], name=user_doc["name"]),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    """Log in with email and password."""
    db = get_db()
    user = await db.Users.find_one({"email": body.email.lower().strip()})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])
    token = create_access_token(
        {"sub": user_id, "email": user["email"], "name": user["name"]}
    )
    return TokenResponse(
        accessToken=token,
        user=UserResponse(id=user_id, email=user["email"], name=user["name"]),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return UserResponse(**current_user)
