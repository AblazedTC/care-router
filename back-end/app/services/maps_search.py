import os
import googlemaps
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
gmaps = googlemaps.Client(key=API_KEY)

def search_hospitals(location, query, radius):
    results = gmaps.places_nearby(
        location=location,
        radius=radius,
        type="hospital",
        keyword=query
    )
    return [
        {"name": place["name"], "address": place.get("vicinity"), "rating": place["rating"]}
        for place in results.get("results", [])
    ]

