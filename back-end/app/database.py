import logging
import os

import certifi
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv("MONGODB_URI", "")

client: AsyncIOMotorClient = None  # type: ignore[assignment]
db = None


async def connect_db():
    global client, db
    if not MONGODB_URI:
        logger.warning("MONGODB_URI is not set — database features disabled")
        return
    try:
        client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
        db = client.get_default_database("care")
        # Verify the connection works
        await client.admin.command("ping")
        logger.info("Connected to MongoDB")
    except Exception:
        logger.warning("Failed to connect to MongoDB — caching disabled", exc_info=True)
        client = None
        db = None


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db


def get_referrals_collection():
    d = get_db()
    return d["Referrals"] if d is not None else None


def get_diagnosis_cache_collection():
    d = get_db()
    return d["DiagnosisCache"] if d is not None else None


def get_hospitals_collection():
    d = get_db()
    return d["Hospitals"] if d is not None else None
