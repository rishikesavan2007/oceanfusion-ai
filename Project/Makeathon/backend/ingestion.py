import feedparser
from db import supabase

# Simple keyword-based hazard tagging for now
HAZARD_KEYWORDS = {
    "oil_spill": ["oil spill", "oil leak"],
    "cyclone": ["cyclone", "hurricane"],
    "flood": ["flood", "flooding"],
    "high_waves": ["high waves", "storm surge"],
    "debris": ["marine debris", "ocean debris"],
    "dead_fish": ["dead fish", "fish kill"],
}

def tag_hazard_type(text):
    text_lower = text.lower()
    for hazard, keywords in HAZARD_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return hazard
    return "other"


def fetch_news_rss(query="oil spill India coast"):
    feed_url = f"https://news.google.com/rss/search?q={query.replace(' ', '+')}"
    feed = feedparser.parse(feed_url)

    inserted_count = 0
    for entry in feed.entries[:10]:
        hazard_type = tag_hazard_type(entry.title)
        
        # avoid duplicate inserts by checking if this URL already exists
        existing = supabase.table("sources").select("id").eq("url", entry.link).execute().data
        if existing:
            continue

        supabase.table("sources").insert({
            "source_type": "news",
            "raw_text": entry.title,
            "url": entry.link,
            "hazard_type": hazard_type
        }).execute()
        inserted_count += 1

    return inserted_count
def seed_social_media_data():
    """
    Simulated social media posts (since live Twitter/X API access is restricted).
    Represents what real-time ingestion would look like in production.
    """
    sample_posts = [
        {
            "raw_text": "Massive oil slick spotted near Chennai coast this morning, fishermen unable to go out #OilSpill #Chennai",
            "hazard_type": "oil_spill",
            "lat": 13.0810, "long": 80.2740
        },
        {
            "raw_text": "Cyclone warning issued for Visakhapatnam coast, please stay indoors #CycloneAlert #Vizag",
            "hazard_type": "cyclone",
            "lat": 17.6850, "long": 83.2200
        },
        {
            "raw_text": "Severe flooding near Kochi backwaters, water entering homes #KochiFloods #Kerala",
            "hazard_type": "flood",
            "lat": 9.9300, "long": 76.2650
        },
        {
            "raw_text": "Loads of plastic debris washed up on Marina beach overnight, so sad to see #MarineDebris #Chennai",
            "hazard_type": "debris",
            "lat": 13.0490, "long": 80.2824
        },
        {
            "raw_text": "Hundreds of dead fish found floating near Mangalore shore, strong smell in the area #FishKill #Mangalore",
            "hazard_type": "dead_fish",
            "lat": 12.9150, "long": 74.8550
        },
        {
            "raw_text": "Waves are unusually high near Puducherry beach today, lifeguards warning tourists to stay back #HighWaves #Puducherry",
            "hazard_type": "high_waves",
            "lat": 11.9400, "long": 79.8100
        }
    ]

    inserted_count = 0
    for post in sample_posts:
        supabase.table("sources").insert({
            "source_type": "twitter",
            "raw_text": post["raw_text"],
            "hazard_type": post["hazard_type"],
            "lat": post["lat"],
            "long": post["long"]
        }).execute()
        inserted_count += 1

    return inserted_count
def seed_govt_bulletin():
    supabase.table("sources").insert({
        "source_type": "govt",
        "raw_text": "INCOIS Cyclone Warning: Severe cyclonic storm expected to make landfall near Visakhapatnam within 24 hours. Fishermen advised not to venture into sea.",
        "hazard_type": "cyclone",
        "lat": 17.6870,
        "long": 83.2190
    }).execute()
    return {"status": "govt bulletin seeded"}