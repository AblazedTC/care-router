import os

import certifi
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")

client: AsyncIOMotorClient = None  # type: ignore[assignment]
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
    db = client.get_default_database("care")


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db


def get_referrals_collection():
    return get_db()["Referrals"]


def get_diagnosis_cache_collection():
    return get_db()["DiagnosisCache"]
