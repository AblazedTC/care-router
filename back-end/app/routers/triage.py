from fastapi import APIRouter, HTTPException

from app.models import TriageRequest, TriageResponse
from app.services.triage_engine import match_hospitals, triage_from_symptoms_ai, triage_from_symptoms

router = APIRouter(prefix="/triage", tags=["triage"])


@router.post("", response_model=TriageResponse)
def triage_symptoms(body: TriageRequest):
    """Submit symptoms and receive AI-powered triage with matched hospitals."""
    # Try AI first, fallback to keyword matching (which has its own default)
    condition = triage_from_symptoms_ai(body.symptoms)
    if condition is None:
        condition = triage_from_symptoms(body.symptoms)
    
    # Guaranteed to have a condition now
    hospitals = match_hospitals(condition)
    return TriageResponse(condition=condition, hospitals=hospitals)
