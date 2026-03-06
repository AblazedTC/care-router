import os
from datetime import datetime
from pymongo import MongoClient
from pymongo.collection import Collection

MONGODB_URI = os.getenv("MONGODB_URI", "")
DATABASE_NAME = os.getenv("MONGODB_DATABASE", "care")
COLLECTION_NAME = os.getenv("MONGODB_COLLECTION", "Referrals")

client: MongoClient | None = None
db_collection: Collection | None = None
db_connected = False


def init_db():
    """Initialize MongoDB connection."""
    global client, db_collection, db_connected

    if not MONGODB_URI:
        db_connected = False
        print("⚠ MongoDB connection warning: MONGODB_URI is not set")
        print("  Operations will still work but data won't persist")
        return

    try:
        # Create MongoClient with TLS and short timeouts for dev responsiveness.
        client = MongoClient(
            MONGODB_URI,
            tls=True,
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
        )
        # Test connection
        client.admin.command("ping")
        db = client[DATABASE_NAME]
        db_collection = db[COLLECTION_NAME]
        db_connected = True
        print("✓ MongoDB connected successfully")
    except Exception as e:
        db_connected = False
        print(f"⚠ MongoDB connection warning: {str(e)[:100]}...")
        print("  Operations will still work but data won't persist")


def save_referral(referral_data: dict) -> dict:
    """Save a referral to MongoDB."""
    if not db_connected or db_collection is None:
        # Return data as-is if DB not connected (for testing)
        return referral_data
    
    try:
        # Ensure dates are proper datetime objects
        if isinstance(referral_data.get("issuedAt"), datetime):
            referral_data["issuedAt"] = referral_data["issuedAt"]
        if isinstance(referral_data.get("expiresAt"), datetime):
            referral_data["expiresAt"] = referral_data["expiresAt"]
        
        result = db_collection.insert_one(referral_data)
        referral_data["_id"] = result.inserted_id
    except Exception as e:
        print(f"⚠ Failed to save referral: {e}")
    
    return referral_data


def get_referral_by_token(token: str) -> dict | None:
    """Retrieve a referral by token."""
    if not db_connected or db_collection is None:
        return None
    
    try:
        return db_collection.find_one({"token": token})
    except Exception as e:
        print(f"⚠ Failed to retrieve referral: {e}")
        return None


def get_all_referrals() -> list[dict]:
    """Retrieve all referrals."""
    if not db_connected or db_collection is None:
        return []
    
    try:
        return list(db_collection.find({}, {"_id": 0}))
    except Exception as e:
        print(f"⚠ Failed to retrieve referrals: {e}")
        return []


def delete_all_referrals() -> int:
    """Delete all referrals."""
    if not db_connected or db_collection is None:
        return 0
    
    try:
        result = db_collection.delete_many({})
        return result.deleted_count
    except Exception as e:
        print(f"⚠ Failed to delete referrals: {e}")
        return 0
