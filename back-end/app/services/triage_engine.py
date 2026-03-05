import random
import string
from datetime import datetime, timedelta, timezone

from app.data.mock_data import DIRECT_DIAGNOSES, HOSPITALS, SYMPTOM_RULES
from app.models import Hospital, Referral, ScoredHospital, Severity, TriageCondition

# In-memory referral store (replace with a database later)
_referrals: list[Referral] = []


def triage_from_symptoms(symptoms: str) -> TriageCondition | None:
    """Analyze free-text symptoms and return the best-matching condition."""
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


def create_referral(hospital_id: str, condition_name: str, severity: Severity) -> Referral:
    """Create and store a new referral."""
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
    )
    _referrals.append(referral)
    return referral


def get_referrals() -> list[Referral]:
    return list(_referrals)


def get_referral_by_token(token: str) -> Referral | None:
    return next((r for r in _referrals if r.token == token), None)


def clear_referrals() -> None:
    _referrals.clear()
