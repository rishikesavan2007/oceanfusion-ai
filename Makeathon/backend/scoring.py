def calculate_trust_score(source_types, corroboration_count, has_gps_match):
    """
    source_types: list of source types contributing to this incident
                  e.g. ['govt', 'reporter', 'twitter']
    corroboration_count: how many independent sources reported this
    has_gps_match: bool, whether image GPS matches claimed location
    """
    score = 0

    source_weights = {"govt": 40, "news": 25, "reporter": 15, "twitter": 5}
    score += max(source_weights.get(s, 0) for s in source_types)

    score += min(corroboration_count * 10, 40)

    if has_gps_match:
        score += 20

    return min(score, 100)
def recommend_action(hazard_type, priority):
    actions = {
        "oil_spill": {
            "high": "Deploy containment booms immediately; alert coast guard.",
            "medium": "Monitor spread; notify local fishing communities.",
            "low": "Log for record; periodic monitoring."
        },
        "cyclone": {
            "high": "Issue evacuation advisory; alert all vessels to return to shore.",
            "medium": "Issue weather advisory; monitor storm path.",
            "low": "Routine monitoring."
        },
        "flood": {
            "high": "Alert coastal residents; coordinate with disaster response teams.",
            "medium": "Monitor water levels; issue local advisory.",
            "low": "Routine monitoring."
        },
        "debris": {
            "high": "Dispatch cleanup crew; restrict swimming/fishing in area.",
            "medium": "Schedule cleanup; notify local authorities.",
            "low": "Log for future cleanup."
        },
        "dead_fish": {
            "high": "Investigate water contamination; alert health department.",
            "medium": "Sample water quality; monitor fish population.",
            "low": "Log for record."
        },
        "high_waves": {
            "high": "Issue coastal warning; restrict fishing vessel departures.",
            "medium": "Monitor conditions; advise caution to fishermen.",
            "low": "Routine monitoring."
        },
        "tsunami": {
            "high": "Issue immediate evacuation order; activate emergency sirens.",
            "medium": "Issue tsunami watch; monitor sea level changes.",
            "low": "Routine monitoring."
        },
        "illegal_fishing": {
            "high": "Dispatch coast guard patrol; document vessel details.",
            "medium": "Flag for coast guard review; monitor area.",
            "low": "Log for record."
        },
        "water_pollution": {
            "high": "Alert environmental agency; restrict water use in area.",
            "medium": "Sample water quality; notify local authorities.",
            "low": "Log for record; periodic monitoring."
        },
    }
    return actions.get(hazard_type, {}).get(priority, "Review manually.")


def calculate_priority(hazard_type, trust_score, corroboration_count):
    severity_weights = {
        "cyclone": 5, "tsunami": 5, "oil_spill": 4,
        "flood": 4, "high_waves": 3, "debris": 2, "dead_fish": 2, "other": 1
    }
    severity = severity_weights.get(hazard_type, 1)
    priority_score = severity * 10 + trust_score * 0.5 + corroboration_count * 5

    if priority_score >= 70:
        return "high"
    elif priority_score >= 40:
        return "medium"
    else:
        return "low"