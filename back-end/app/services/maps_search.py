import os

import googlemaps
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

_client: googlemaps.Client | None = None


def _get_client() -> googlemaps.Client:
    global _client
    if _client is None:
        if not API_KEY:
            raise RuntimeError("GOOGLE_MAPS_API_KEY is not set")
        _client = googlemaps.Client(key=API_KEY)
    return _client


def search_hospitals(location: tuple, query: str, radius: int) -> list[dict]:
    gmaps = _get_client()
    results = gmaps.places_nearby(
        location=location,
        radius=radius,
        type="hospital",
        keyword=query,
    )
    return [
        {"name": place["name"], "address": place.get("vicinity"), "rating": place.get("rating")}
        for place in results.get("results", [])
    ]

