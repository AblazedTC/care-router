import logging
import random
from datetime import datetime, timedelta, timezone

from app.data.mock_data import DIRECT_DIAGNOSES, HOSPITALS, SYMPTOM_RULES
from app.database import get_referrals_collection
from app.models import GuestInfo, Hospital, Referral, ScoredHospital, Severity, TriageCondition
from app.services.openai_diagnosis import (
    cache_diagnosis,
    diagnose_with_openai,
    get_cached_diagnosis,
)

logger = logging.getLogger(__name__)


def triage_from_symptoms(symptoms: str) -> TriageCondition | None:
    """Analyze free-text symptoms and return the best-matching condition (rule-based fallback)."""
    text = symptoms.lower().strip()

    # 1. Check exact / direct-diagnosis keywords first
    for keyword, condition in DIRECT_DIAGNOSES.items():
        if keyword in text:
            return condition

    # 2. Score symptom rules by keyword match count
    best_score = 0
    best_condition: TriageCondition | None = None
    for rule in SYMPTOM_RULES:
        score = sum(1 for kw in rule["keywords"] if kw in text)
        if score > best_score:
            best_score = score
            best_condition = rule["condition"]

    return best_condition


async def triage_from_symptoms_ai(
    symptoms: str,
) -> tuple[TriageCondition | None, list[ScoredHospital], bool]:
    """AI-powered triage: check cache → call OpenAI → match hospitals → cache result.

    Returns (condition, scored_hospitals, from_cache).
    Falls back to the rule-based engine when OpenAI is unavailable.
    """
    # 1. Check the cache
    cached = await get_cached_diagnosis(symptoms)
    if cached is not None:
        try:
            condition = TriageCondition(**cached["condition"])
            # Re-score hospitals to include live bed/wait data
            hospitals = match_hospitals(condition)
            return condition, hospitals, True
        except Exception:
            logger.warning("Corrupt cache entry — re-diagnosing", exc_info=True)

    # 2. Try OpenAI diagnosis
    condition = await diagnose_with_openai(symptoms)

    # 3. Fall back to rule-based engine if OpenAI fails
    if condition is None:
        condition = triage_from_symptoms(symptoms)

    if condition is None:
        return None, [], False

    # 4. Match hospitals
    hospitals = match_hospitals(condition)

    # 5. Cache the diagnosis + matched hospital IDs
    try:
        hospital_ids = [hospital.id for hospital in hospitals]
        await cache_diagnosis(symptoms, condition, hospital_ids)
    except Exception:
        logger.warning("Failed to cache diagnosis", exc_info=True)

    return condition, hospitals, False


def match_hospitals(condition: TriageCondition) -> list[ScoredHospital]:
    """Score and rank hospitals for a given condition."""
    scored: list[ScoredHospital] = []

    for h in HOSPITALS:
        score = 0.0
        reasons: list[str] = []

        # Specialty overlap
        overlap = set(condition.specialty) & set(h.specialty)
        if overlap:
            score += 30 * len(overlap)
            reasons.append(f"Specializes in {', '.join(overlap)}")

        # Emergency capability for severe conditions
        if condition.severity in (Severity.HIGH, Severity.CRITICAL) and h.emergency:
            score += 20
            reasons.append("Has emergency department")

        # Distance bonus
        if h.distance <= 3:
            score += 15
            reasons.append("Very close by")
        elif h.distance <= 5:
            score += 10
            reasons.append("Nearby")
        else:
            score += 5

        # Bed availability
        if h.available_beds > 10:
            score += 10
            reasons.append("Good bed availability")
        elif h.available_beds > 5:
            score += 5

        # Rating bonus
        if h.rating >= 4.7:
            score += 8
            reasons.append("Highly rated")
        elif h.rating >= 4.5:
            score += 5

        if score > 20:
            scored.append(
                ScoredHospital(
                    **h.model_dump(by_alias=True),
                    matchScore=score,
                    matchReasons=reasons,
                )
            )

    scored.sort(key=lambda s: s.match_score, reverse=True)
    return scored


def generate_referral_token() -> str:
    """Generate a referral token in the format MR-XXXX-XXXX-XXXX."""
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    segments = [
        "".join(random.choices(chars, k=4))  # noqa: S311
        for _ in range(3)
    ]
    return f"MR-{'-'.join(segments)}"


async def create_referral(
    hospital_id: str,
    condition_name: str,
    severity: Severity,
    user_id: str | None = None,
    guest_info: GuestInfo | None = None,
) -> Referral:
    """Create and persist a new referral to MongoDB."""
    hospital = next((h for h in HOSPITALS if h.id == hospital_id), None)
    if hospital is None:
        raise ValueError(f"Hospital '{hospital_id}' not found")

    now = datetime.now(timezone.utc)
    referral = Referral(
        token=generate_referral_token(),
        hospitalName=hospital.name,
        conditionName=condition_name,
        severity=severity,
        issuedAt=now,
        expiresAt=now + timedelta(hours=72),
        userId=user_id,
        guestInfo=guest_info,
    )

    col = get_referrals_collection()
    await col.insert_one(referral.model_dump(by_alias=True))
    return referral


async def get_referrals_for_user(user_id: str) -> list[Referral]:
    """Return all referrals for a given authenticated user."""
    col = get_referrals_collection()
    docs = await col.find({"userId": user_id}).sort("issuedAt", -1).to_list(length=200)
    return [Referral(**doc) for doc in docs]


async def get_referral_by_token(token: str) -> Referral | None:
    """Look up a referral by its token."""
    col = get_referrals_collection()
    doc = await col.find_one({"token": token})
    if doc is None:
        return None
    return Referral(**doc)
