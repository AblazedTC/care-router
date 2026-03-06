import hashlib
import json
import logging
import os
import re
from datetime import datetime, timezone

from dotenv import load_dotenv
from openai import AsyncOpenAI

from app.database import get_diagnosis_cache_collection
from app.models import Severity, TriageCondition

load_dotenv()

logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        if not OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY is not set")
        _client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return _client


def _normalize_symptoms(symptoms: str) -> str:
    """Lowercase, strip, and collapse whitespace for consistent cache keys."""
    return " ".join(symptoms.lower().split())


def _hash_symptoms(normalized: str) -> str:
    """SHA-256 hash of normalized symptom text for cache lookup."""
    return hashlib.sha256(normalized.encode()).hexdigest()


SYSTEM_PROMPT = """\
You are a medical triage assistant. Given patient symptoms, provide a preliminary \
diagnosis in JSON format. You must respond ONLY with valid JSON — no markdown, \
no explanation, no extra text.

The JSON must have exactly these fields:
- "name": short condition name (e.g. "Possible Cardiac Issue")
- "severity": one of "low", "moderate", "high", "critical"
- "specialty": array of medical specialties needed (e.g. ["Cardiology", "Emergency"])
- "description": one-sentence clinical description for the patient
- "confidence": number between 0 and 1 indicating diagnostic confidence

Important:
- Use only the following "specialty" values to match hospital department names: \
General Medicine, Emergency, Cardiology, Cardiac Surgery, Vascular Medicine, Orthopedics, \
Sports Medicine, Rehabilitation, Pediatrics, Neonatal Care, Child Psychology, Neurology, \
Oncology, Research Medicine, Psychiatry, Psychology, Substance Abuse, Dermatology, \
Cosmetic Surgery, Allergy, ENT, Audiology, Trauma, General Surgery.
- Be medically responsible: if symptoms are vague, set lower confidence.
- If symptoms describe an emergency, set severity to "critical" or "high".\
"""


async def diagnose_with_openai(symptoms: str) -> TriageCondition | None:
    """Call OpenAI to analyze symptoms and return a structured diagnosis."""
    client = _get_client()

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Patient symptoms: {symptoms}"},
            ],
            temperature=0.3,
            max_tokens=300,
        )

        content = response.choices[0].message.content
        if not content:
            return None

        # Strip markdown fences if present (e.g. ```json ... ```)
        text = content.strip()
        text = re.sub(r"^```(?:\w+)?\n?|```$", "", text, flags=re.MULTILINE).strip()

        data = json.loads(text)

        severity_raw = data.get("severity", "moderate").lower()
        if severity_raw not in {s.value for s in Severity}:
            severity_raw = "moderate"

        confidence = float(data.get("confidence", 0.7))
        confidence = max(0.0, min(1.0, confidence))

        return TriageCondition(
            name=data["name"],
            severity=Severity(severity_raw),
            specialty=data.get("specialty", ["General Medicine"]),
            description=data.get("description", "AI-generated diagnosis."),
            confidence=confidence,
        )
    except Exception:
        logger.exception("OpenAI diagnosis failed")
        return None


async def get_cached_diagnosis(symptoms: str) -> dict | None:
    """Check MongoDB for a cached diagnosis matching these symptoms."""
    normalized = _normalize_symptoms(symptoms)
    symptoms_hash = _hash_symptoms(normalized)

    col = get_diagnosis_cache_collection()
    doc = await col.find_one({"symptoms_hash": symptoms_hash})
    return doc


async def cache_diagnosis(
    symptoms: str,
    condition: TriageCondition,
    hospital_ids: list[str],
) -> None:
    """Save a diagnosis and its matched hospital IDs to the cache."""
    normalized = _normalize_symptoms(symptoms)
    symptoms_hash = _hash_symptoms(normalized)

    col = get_diagnosis_cache_collection()
    await col.update_one(
        {"symptoms_hash": symptoms_hash},
        {
            "$set": {
                "symptoms_hash": symptoms_hash,
                "symptoms": normalized,
                "condition": condition.model_dump(),
                "hospital_ids": hospital_ids,
                "created_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )
