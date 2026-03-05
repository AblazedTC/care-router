from fastapi import APIRouter, HTTPException

from app.models import Referral, ReferralCreate
from app.services.triage_engine import (
    clear_referrals,
    create_referral,
    get_referral_by_token,
    get_referrals,
)

router = APIRouter(prefix="/referrals", tags=["referrals"])


@router.post("", response_model=Referral, status_code=201)
def issue_referral(body: ReferralCreate):
    """Generate a new referral token for a hospital + condition."""
    try:
        return create_referral(body.hospital_id, body.condition_name, body.severity)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("", response_model=list[Referral])
def list_referrals():
    """Return all issued referrals."""
    return get_referrals()


@router.get("/{token}", response_model=Referral)
def lookup_referral(token: str):
    """Look up a referral by its token."""
    referral = get_referral_by_token(token)
    if referral is None:
        raise HTTPException(status_code=404, detail="Referral not found")
    return referral


@router.delete("", status_code=204)
def delete_all_referrals():
    """Clear all stored referrals."""
    clear_referrals()
