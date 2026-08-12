from sklearn.cluster import DBSCAN
import numpy as np
from db import supabase

def cluster_and_create_incidents():
    # Fetch all reports and sources that have lat/long
    reports = supabase.table("reports").select("*").execute().data
    sources = supabase.table("sources").select("*").execute().data
    sources_with_coords = [s for s in sources if s.get("lat") and s.get("long")]

    all_points = []
    for r in reports:
        all_points.append({"type": "report", "id": r["id"], "lat": r["lat"], "long": r["long"], "hazard_type": r["hazard_type"]})
    for s in sources_with_coords:
        all_points.append({"type": "source", "id": s["id"], "lat": s["lat"], "long": s["long"], "hazard_type": s["hazard_type"]})

    if not all_points:
        return {"clusters_created": 0, "message": "no geotagged data found"}

    coords = np.array([[p["lat"], p["long"]] for p in all_points])
    clustering = DBSCAN(eps=0.05, min_samples=1).fit(coords)  # ~5km radius

    clusters = {}
    for label, point in zip(clustering.labels_, all_points):
        clusters.setdefault(label, []).append(point)

    incidents_created = 0
    for label, points in clusters.items():
        avg_lat = sum(p["lat"] for p in points) / len(points)
        avg_long = sum(p["long"] for p in points) / len(points)
        hazard_type = points[0]["hazard_type"]  # simplistic: use first point's type

        incident = supabase.table("incidents").insert({
            "hazard_type": hazard_type,
            "merged_lat": avg_lat,
            "merged_long": avg_long
        }).execute().data[0]

        for p in points:
            member = {"incident_id": incident["id"]}
            if p["type"] == "report":
                member["report_id"] = p["id"]
            else:
                member["source_id"] = p["id"]
            supabase.table("incident_members").insert(member).execute()

        incidents_created += 1

    return {"clusters_created": incidents_created}