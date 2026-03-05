from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(triage.router, prefix="/api")
app.include_router(hospitals.router, prefix="/api")
app.include_router(referrals.router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}
