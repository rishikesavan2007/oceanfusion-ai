from flask import Flask, jsonify, request
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os
from chatbot import ask_chatbot, clear_chat
from ingestion import fetch_news_rss, seed_social_media_data, seed_govt_bulletin
from db import supabase
from clustering import cluster_and_create_incidents
from scoring import calculate_trust_score, calculate_priority, recommend_action
HAZARD_SEVERITY = {
    "cyclone": 5, "tsunami": 5, "oil_spill": 4, "flood": 4,
    "high_waves": 3, "water_pollution": 3, "illegal_fishing": 2,
    "debris": 2, "dead_fish": 2, "other": 1
}

app = Flask(__name__)
CORS(app)
model = load_model("model/ocean_model.keras")

CLASS_NAMES = [
    "cyclone",
    "flood",
    "oil spill",
    "wave"
]

@app.route("/")
def health_check():
    return jsonify({"status": "backend running"})

@app.route("/test-db")
def test_db():
    response = supabase.table("reports").select("*").execute()
    return jsonify(response.data)

@app.route("/score-incident/<incident_id>", methods=["GET", "POST"])
def score_incident(incident_id):
    members = supabase.table("incident_members").select("*").eq("incident_id", incident_id).execute().data
    if not members:
        return jsonify({"error": "no members found for this incident"}), 404
    source_types = []
    for m in members:
        if m.get("report_id"):
            source_types.append("reporter")
        if m.get("source_id"):
            src = supabase.table("sources").select("source_type").eq("id", m["source_id"]).execute().data
            if src:
                source_types.append(src[0]["source_type"])
    corroboration_count = len(members)
    has_gps_match = "reporter" in source_types
    trust_score = calculate_trust_score(source_types, corroboration_count, has_gps_match)
    incident = supabase.table("incidents").select("hazard_type").eq("id", incident_id).execute().data[0]
    priority = calculate_priority(incident["hazard_type"], trust_score, corroboration_count)
    supabase.table("incidents").update({"trust_score": trust_score, "priority": priority}).eq("id", incident_id).execute()
    return jsonify({
        "incident_id": incident_id,
        "hazard_type": incident["hazard_type"],
        "trust_score": trust_score,
        "priority": priority,
        "corroboration_count": corroboration_count,
        "contributing_sources": source_types
    })

@app.route("/score-all-incidents", methods=["GET", "POST"])
def score_all_incidents():
    incidents = supabase.table("incidents").select("*").execute().data
    results = []
    for incident in incidents:
        incident_id = incident["id"]
        members = supabase.table("incident_members").select("*").eq("incident_id", incident_id).execute().data
        source_types = []
        for m in members:
            if m.get("report_id"):
                source_types.append("reporter")
            if m.get("source_id"):
                src = supabase.table("sources").select("source_type").eq("id", m["source_id"]).execute().data
                if src:
                    source_types.append(src[0]["source_type"])
        corroboration_count = len(members)
        has_gps_match = "reporter" in source_types
        trust_score = calculate_trust_score(source_types, corroboration_count, has_gps_match)
        priority = calculate_priority(incident["hazard_type"], trust_score, corroboration_count)
        supabase.table("incidents").update({"trust_score": trust_score, "priority": priority}).eq("id", incident_id).execute()
        results.append({
            "incident_id": incident_id,
            "hazard_type": incident["hazard_type"],
            "trust_score": trust_score,
            "priority": priority,
            "corroboration_count": corroboration_count
        })
    return jsonify(results)

@app.route("/ingest/news", methods=["GET", "POST"])
def ingest_news():
    count = fetch_news_rss()
    return jsonify({"status": "ingested", "new_items": count})

@app.route("/ingest/social-media", methods=["GET", "POST"])
def ingest_social_media():
    count = seed_social_media_data()
    return jsonify({"status": "seeded", "new_items": count})

@app.route("/ingest/govt", methods=["GET", "POST"])
def ingest_govt():
    result = seed_govt_bulletin()
    return jsonify(result)

@app.route("/cluster-incidents", methods=["GET", "POST"])
def cluster_incidents():
    result = cluster_and_create_incidents()
    return jsonify(result)

@app.route("/incidents")
def get_all_incidents():
    incidents = supabase.table("incidents").select("*").execute().data
    for inc in incidents:
        inc["action"] = recommend_action(inc.get("hazard_type"), inc.get("priority"))
    return jsonify(incidents)

@app.route("/report", methods=["POST"])
def submit_report():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body received"}), 400
    required = ["hazard_type", "lat", "long"]
    missing = [f for f in required if data.get(f) in (None, "")]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
    HAZARD_TYPE_MAP = {
        "Oil Spill": "oil_spill", "High Waves": "high_waves", "Cyclone": "cyclone",
        "Tsunami": "tsunami", "Illegal Fishing": "illegal_fishing",
        "Water Pollution": "water_pollution", "Marine Animal Distress": "dead_fish", "Other": "other",
    }
    raw_hazard_type = data.get("hazard_type")
    hazard_type = HAZARD_TYPE_MAP.get(raw_hazard_type, raw_hazard_type)
    report_row = {
        "user_id": data.get("user_id"), "hazard_type": hazard_type, "description": data.get("description"),
        "lat": data.get("lat"), "long": data.get("long"), "image_url": data.get("image_url"),
        "sync_status": "synced"
    }
    try:
        response = supabase.table("reports").insert(report_row).execute()
    except Exception as e:
        return jsonify({"error": f"Database rejected the report: {str(e)}"}), 400
    if not response.data:
        return jsonify({"error": "Failed to insert report"}), 500
    return jsonify({"status": "success", "report": response.data[0]}), 201

HAZARD_SEVERITY = {
    "cyclone": 5, "tsunami": 5, "oil_spill": 4, "flood": 4,
    "high_waves": 3, "water_pollution": 3, "illegal_fishing": 2,
    "debris": 2, "dead_fish": 2, "other": 1
}

@app.route("/reports", methods=["GET"])
def get_reports():
    try:
        response = (
            supabase.table("reports")
            .select("*, profiles(full_name)")
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    reports = response.data
    for r in reports:
        r["severity"] = HAZARD_SEVERITY.get(r.get("hazard_type"), 1)
        r["reporter_name"] = (r.get("profiles") or {}).get("full_name") or "Anonymous Reporter"

    # Priority queue: highest severity first, most recent within each severity level
    reports.sort(key=lambda r: -r["severity"])

    return jsonify({"reports": reports})
@app.route("/get", methods=["POST"])
def chatbot_get():
    data = request.get_json()
    message = data.get("message", "")
    reply = ask_chatbot(message)
    return jsonify({"reply": reply})

@app.route("/clear", methods=["POST"])
def chatbot_clear():
    clear_chat()
    return jsonify({"status": "cleared"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)