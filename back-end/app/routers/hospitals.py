from fastapi import APIRouter, HTTPException, Query

from app.data.mock_data import HOSPITALS
from app.models import Hospital

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.get("", response_model=list[Hospital])
def list_hospitals(
    specialty: str | None = Query(default=None, description="Filter by specialty (case-insensitive substring)"),
    emergency: bool | None = Query(default=None, description="Filter by emergency capability"),
):
    """Return all hospitals, optionally filtered by specialty or emergency flag."""
    results = HOSPITALS

    if specialty is not None:
        spec_lower = specialty.lower()
        results = [h for h in results if any(spec_lower in s.lower() for s in h.specialty)]

    if emergency is not None:
        results = [h for h in results if h.emergency == emergency]

    return results


@router.get("/{hospital_id}", response_model=Hospital)
def get_hospital(hospital_id: str):
    """Get a single hospital by ID."""
    hospital = next((h for h in HOSPITALS if h.id == hospital_id), None)
    if hospital is None:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital
