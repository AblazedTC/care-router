from fastapi import APIRouter, HTTPException

from app.models import TriageRequest, TriageResponse
from app.services.triage_engine import match_hospitals, triage_from_symptoms

router = APIRouter(prefix="/triage", tags=["triage"])


@router.post("", response_model=TriageResponse)
def triage_symptoms(body: TriageRequest):
    """Submit symptoms and receive a triage condition with matched hospitals."""
    condition = triage_from_symptoms(body.symptoms)
    if condition is None:
        return TriageResponse(condition=None, hospitals=[])

    hospitals = match_hospitals(condition)
    return TriageResponse(condition=condition, hospitals=hospitals)
