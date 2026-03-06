from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.models import Referral, ReferralCreate
from app.services.auth_service import decode_access_token
from app.services.triage_engine import (
    create_referral,
    get_referral_by_token,
    get_referrals_for_user,
)

router = APIRouter(prefix="/referrals", tags=["referrals"])

# Optional bearer — allows both authenticated and guest callers
_optional_bearer = HTTPBearer(auto_error=False)


def _extract_user_id(
    credentials: Optional[HTTPAuthorizationCredentials],
) -> str | None:
    """Return the user_id from a valid JWT, or None when no token is provided."""
    if credentials is None:
        return None
    payload = decode_access_token(credentials.credentials)
    return payload.get("sub")


@router.post("", response_model=Referral, status_code=201)
async def issue_referral(
    body: ReferralCreate,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer),
):
    """Generate a new referral token for a hospital + condition.

    Authenticated users are linked via their user ID.
    Guests must supply guestInfo in the request body.
    """
    user_id = _extract_user_id(credentials)

    if user_id is None and body.guest_info is None:
        raise HTTPException(
            status_code=422,
            detail="Guest users must provide guestInfo (name, email, phone, dateOfBirth).",
        )

    try:
<<<<<<< HEAD
        return await create_referral(
            hospital_id=body.hospital_id,
            condition_name=body.condition_name,
            severity=body.severity,
            user_id=user_id,
            guest_info=body.guest_info,
        )
=======
        return create_referral(body.hospital_id, body.condition_name, body.severity, body.summary)
>>>>>>> bb86b7d (triage follo-up questions)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("", response_model=list[Referral])
async def list_referrals(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
):
    """Return all referrals for the authenticated user."""
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return await get_referrals_for_user(user_id)


@router.get("/{token}", response_model=Referral)
async def lookup_referral(token: str):
    """Look up a referral by its token (public — no auth required)."""
    referral = await get_referral_by_token(token)
    if referral is None:
        raise HTTPException(status_code=404, detail="Referral not found")
    return referral
