from fastapi import APIRouter, HTTPException, Query

from app.data.mock_data import HOSPITALS
from app.database import get_hospitals_collection
from app.models import Hospital

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


async def _get_hospitals() -> list[Hospital]:
    """Return hospitals from MongoDB if available, otherwise fall back to mock data."""
    try:
        col = get_hospitals_collection()
        docs = await col.find().to_list(length=200)
        if docs:
            return [Hospital(**doc) for doc in docs]
    except Exception:
        pass
    return HOSPITALS


@router.get("", response_model=list[Hospital])
async def list_hospitals(
    specialty: str | None = Query(default=None, description="Filter by specialty (case-insensitive substring)"),
    emergency: bool | None = Query(default=None, description="Filter by emergency capability"),
):
    """Return all hospitals, optionally filtered by specialty or emergency flag."""
    results = await _get_hospitals()

    if specialty is not None:
        spec_lower = specialty.lower()
        results = [h for h in results if any(spec_lower in s.lower() for s in h.specialty)]

    if emergency is not None:
        results = [h for h in results if h.emergency == emergency]

    return results


@router.get("/{hospital_id}", response_model=Hospital)
async def get_hospital(hospital_id: str):
    """Get a single hospital by ID."""
    all_hospitals = await _get_hospitals()
    hospital = next((h for h in all_hospitals if h.id == hospital_id), None)
    if hospital is None:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital
