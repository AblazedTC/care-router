from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.maps_search import search_hospitals
from pydantic import BaseModel

from app.routers import hospitals, referrals, triage

class HospitalSearch(BaseModel):
    location: tuple
    query: str

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

@app.get("/hospitals")
def find_hospital(data: HospitalSearch):
    return search_hospitals((15.4155, 28.2773), data.query, 5000)