import json
import os
import random
from datetime import datetime, timedelta, timezone

from openai import OpenAI

from app.data.mock_data import DIRECT_DIAGNOSES, HOSPITALS, SYMPTOM_RULES
from app.database import get_referrals_collection
from app.models import GuestInfo, Hospital, Referral, ScoredHospital, Severity, TriageCondition

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def triage_from_symptoms_ai(symptoms: str) -> TriageCondition | None:
    """Use OpenAI to analyze symptoms and return a triage condition."""
    if not os.getenv("OPENAI_API_KEY"):
        print("OpenAI API key not found go back to keyword matching")
        return None
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "TriageOutput",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "condition_name": {
                                "type": "string",
                                "description": "Medical condition name",
                            },
                            "severity": {
                                "type": "string",
                                "enum": ["low", "moderate", "high", "critical"],
                            },
                            "specialty": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Medical specialties needed",
                            },
                            "description": {"type": "string"},
                            "confidence": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                            },
                        },
                        "required": [
                            "condition_name",
                            "severity",
                            "specialty",
                            "description",
                            "confidence",
                        ],
                    },
                },
            },
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical triage assistant. Analyze patient symptoms and return structured triage data.",
                },
                {"role": "user", "content": f"Analyze these symptoms and provide triage: {symptoms}"},
            ],
            temperature=0.3,
        )

        data = json.loads(response.choices[0].message.content)
        print(f"OpenAI triage successful: {data['condition_name']}")
        return TriageCondition(
            name=data["condition_name"],
            severity=Severity(data["severity"]),
            specialty=data["specialty"],
            description=data["description"],
            confidence=data["confidence"],
        )
    except Exception as e:
        print(f"OpenAI triage failed: {e}")
        return None


def get_default_condition(symptoms: str) -> TriageCondition:
    """Return a safe default condition for any symptoms."""
    return TriageCondition(
        name="General Health Concern",
        severity=Severity.MODERATE,
        specialty=["General Medicine"],
        description=f"We've received your symptoms: '{symptoms[:100]}'. A general medical evaluation is recommended for proper diagnosis and treatment.",
        confidence=0.50,
    )


def triage_from_symptoms(symptoms: str) -> TriageCondition:
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

    # 3. Return default if nothing matched
    if best_condition is None:
        return get_default_condition(symptoms)
    
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
