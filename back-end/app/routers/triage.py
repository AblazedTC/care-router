from fastapi import APIRouter

from app.models import TriageRequest, TriageResponse
from app.services.triage_engine import triage_from_symptoms_ai

router = APIRouter(prefix="/triage", tags=["triage"])


@router.post("", response_model=TriageResponse)
async def triage_symptoms(body: TriageRequest):
    """Submit symptoms and receive an AI-powered triage condition with matched hospitals.

    Uses OpenAI for high-confidence diagnosis, with a rule-based fallback.
    Results are cached in MongoDB to avoid redundant API calls.
    """
    condition, hospitals, from_cache = await triage_from_symptoms_ai(body.symptoms)

    if condition is None:
        return TriageResponse(condition=None, hospitals=[])
    return TriageResponse(condition=condition, hospitals=hospitals)
