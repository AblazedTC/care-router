from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.models import (
    PasswordChange,
    ProfileUpdate,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
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
    """Return the currently authenticated user with full profile."""
    db = get_db()
    user = await db.Users.find_one({"_id": ObjectId(current_user["id"])})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        phone=user.get("phone"),
        address=user.get("address"),
        dateOfBirth=user.get("date_of_birth"),
    )


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    body: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update the current user's profile information."""
    db = get_db()
    updates: dict = {}
    if body.name is not None:
        updates["name"] = body.name.strip()
    if body.phone is not None:
        val = body.phone.strip()
        updates["phone"] = val if val else None
    if body.address is not None:
        val = body.address.strip()
        updates["address"] = val if val else None
    if body.date_of_birth is not None:
        val = body.date_of_birth.strip()
        updates["date_of_birth"] = val if val else None

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    await db.Users.update_one(
        {"_id": ObjectId(current_user["id"])}, {"$set": updates}
    )

    user = await db.Users.find_one({"_id": ObjectId(current_user["id"])})
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        phone=user.get("phone"),
        address=user.get("address"),
        dateOfBirth=user.get("date_of_birth"),
    )


@router.put("/password")
async def change_password(
    body: PasswordChange,
    current_user: dict = Depends(get_current_user),
):
    """Change the current user's password."""
    db = get_db()
    user = await db.Users.find_one({"_id": ObjectId(current_user["id"])})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if not verify_password(body.current_password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    await db.Users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"password": hash_password(body.new_password)}},
    )
    return {"detail": "Password updated successfully"}
