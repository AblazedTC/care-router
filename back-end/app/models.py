from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class Severity(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


# ── Hospital ──────────────────────────────────────────────────────────────────


class Hospital(BaseModel):
    id: str
    name: str
    specialty: list[str]
    distance: float
    available_beds: int = Field(alias="availableBeds")
    wait_time: str = Field(alias="waitTime")
    rating: float
    address: str
    phone: str
    emergency: bool
    image: str

    model_config = {"populate_by_name": True}


class ScoredHospital(Hospital):
    match_score: float = Field(alias="matchScore")
    match_reasons: list[str] = Field(alias="matchReasons")

    model_config = {"populate_by_name": True}


# ── Triage ────────────────────────────────────────────────────────────────────


class TriageCondition(BaseModel):
    name: str
    severity: Severity
    specialty: list[str]
    description: str
    confidence: float = Field(ge=0, le=1)


class TriageRequest(BaseModel):
    symptoms: str = Field(min_length=1, max_length=2000)


class TriageResponse(BaseModel):
    condition: TriageCondition | None = None
    hospitals: list[ScoredHospital] = []


# ── Referral ──────────────────────────────────────────────────────────────────


class GuestInfo(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=255)
    phone: str = Field(min_length=1, max_length=30)
    date_of_birth: str = Field(alias="dateOfBirth", min_length=1, max_length=20)

    model_config = {"populate_by_name": True}


class ReferralCreate(BaseModel):
    hospital_id: str = Field(alias="hospitalId")
    condition_name: str = Field(alias="conditionName")
    severity: Severity
    guest_info: GuestInfo | None = Field(default=None, alias="guestInfo")

    model_config = {"populate_by_name": True}


class Referral(BaseModel):
    token: str
    hospital_name: str = Field(alias="hospitalName")
    condition_name: str = Field(alias="conditionName")
    severity: Severity
    issued_at: datetime = Field(alias="issuedAt")
    expires_at: datetime = Field(alias="expiresAt")
    user_id: str | None = Field(default=None, alias="userId")
    guest_info: GuestInfo | None = Field(default=None, alias="guestInfo")

    model_config = {"populate_by_name": True}

    @field_validator("issued_at", "expires_at", mode="after")
    @classmethod
    def ensure_utc(cls, v: datetime) -> datetime:
        """Normalize naive datetimes from MongoDB to timezone-aware UTC."""
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v


# ── Auth ──────────────────────────────────────────────────────────────────────


class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: str | None = None
    address: str | None = None
    date_of_birth: str | None = Field(default=None, alias="dateOfBirth")

    model_config = {"populate_by_name": True}


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=30)
    address: str | None = Field(default=None, max_length=500)
    date_of_birth: str | None = Field(
        default=None, alias="dateOfBirth", max_length=20
    )

    model_config = {"populate_by_name": True}


class PasswordChange(BaseModel):
    current_password: str = Field(alias="currentPassword")
    new_password: str = Field(alias="newPassword", min_length=6, max_length=128)

    model_config = {"populate_by_name": True}


class TokenResponse(BaseModel):
    access_token: str = Field(alias="accessToken")
    token_type: str = "bearer"
    user: UserResponse
