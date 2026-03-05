from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import hospitals, referrals, triage

app = FastAPI(
    title="Care Router API",
    description="Symptom triage, hospital matching, and referral management for Care Router.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(triage.router, prefix="/api")
app.include_router(hospitals.router, prefix="/api")
app.include_router(referrals.router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}
