import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

# Load .env early, before any app imports that read env vars
load_dotenv(Path(__file__).resolve().parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()  # Load .env file

from app.database import close_db, connect_db
from app.routers import auth, hospitals, referrals, triage


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Care Router API",
    description="Symptom triage, hospital matching, and referral management for Care Router.",
    version="0.1.0",
    lifespan=lifespan,
)

allowed_origins = [
    "http://localhost:3000",
]
frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(triage.router, prefix="/api")
app.include_router(hospitals.router, prefix="/api")
app.include_router(referrals.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "service": "care-router"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
