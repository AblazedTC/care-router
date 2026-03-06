import logging

from fastapi import APIRouter, HTTPException

from app.models import TriageRequest, TriageResponse
from app.services.triage_engine import triage_from_symptoms_ai

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/triage", tags=["triage"])


@router.post("", response_model=TriageResponse)
async def triage_symptoms(body: TriageRequest):
    """Submit symptoms and receive an AI-powered triage condition with matched hospitals.

    Uses OpenAI for high-confidence diagnosis, with a rule-based fallback.
    Results are cached in MongoDB to avoid redundant API calls.
    """
    try:
        condition, hospitals, from_cache = await triage_from_symptoms_ai(body.symptoms)
    except Exception:
        logger.exception("Triage processing failed")
        raise HTTPException(status_code=500, detail="Failed to process symptoms. Please try again.")

    if condition is None:
        return TriageResponse(condition=None, hospitals=[])

    return TriageResponse(condition=condition, hospitals=hospitals)
