# ==========================================================================
# PER 90 - STATS.PY (API ROUTER TIL SPÍLLER PROFIL MED VÆRDIER OG PERCENTILER)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["stats"])

# Dine 6 præcise kategorier med korrekte CSV-navne mappinger 🎯
PLAYER_STATS_METRICS = {
    "OUTPUT": [
        ("total goals_p90", "Goals"),
        ("xG_p90", "npxG"),
        ("total ontarget attempt_p90", "Shots On Target"),
        ("CreatedOwnShot_p90", "Created Own Shot"),
        ("total attempts ibox_p90", "Shots Inside Box"),
        ("total touches in opposition box_p90", "Touches In Opp. Box"),
    ],
    "PLAYMAKING": [
        ("total assists_p90", "Assists"),
        ("xA_p90", "xA"),
        ("total att assist_p90", "Key Passes"),
        ("xT_pass_p90", "xT via Live Passes"),
        ("progressive_passes_p90", "Progressive Passes"),
        ("passes_into_final_third_p90", "Passes Into Final 3rd"),
    ],
    "PASSING": [
        ("total accurate pass_p90", "Accurate Passes"),
        ("total accurate long balls_p90", "Accurate Long Balls"),
        ("total accurate cross_p90", "Accurate Crosses"),
        ("pass_success_pct_p90", "Pass Accuracy %"),
        ("long_balls_success_pct_p90", "Long Ball Accuracy %"),
        ("cross_success_pct_p90", "Cross Accuracy %"),
    ],
    "POSSESSION": [
        ("total won contest_p90", "Successful Dribbles"),
        ("total contest_p90", "Dribble Attempts"),
        ("dribble_success_pct_p90", "Dribble Success %"),
        ("Total Carries_p90", "Progressive Carries"),
        ("Total Carry xT_p90", "xT via Progressive Carries"),
        ("Total Final Third Carries_p90", "Carries Into Final ⅓"),
    ],
    "DEFENDING/DUELS": [
        ("tackle_success_pct_p90", "Tackles Won %"),
        ("aerial_success_pct_p90", "Aerials Won %"),
        ("duel_success_pct_p90", "Duels Won %"),
        ("total won tackle_p90", "Tackles Won"),
        ("total aerial won_p90", "Aerials Won"),
        ("total duels won_p90", "Duels Won"),
    ],
    "OTHER": [
        ("total interception_p90", "Interceptions"),
        ("total was fouled_p90", "Fouls Drawn"),
        ("total accurate fwd zone pass_p90", "Passes in Opp. Half"),
        ("forward_passes_p90", "Forward Passes"),
        ("total attempt_p90", "Total Shots"),
        ("attempt_success_pct_p90", "On Target %"),
    ]
}

def get_status_tag(pr_value: float) -> str:
    """Hjælpefunktion der returnerer den rigtige tekst-etiket ud fra din percentil rank."""
    if pr_value < 35.0:
        return "BELOW AVG"
    elif pr_value <= 65.0:
        return "AVERAGE"
    else:
        return "ABOVE AVG"

@router.get("/player-stats")
def get_player_detailed_stats(
    player: str = Query(..., description="Navnet på spilleren der skal analyseres")
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom eller ikke indlæst.")

    # Find spillerens række i CSV'en
    player_row = GLOBAL_DATASET[GLOBAL_DATASET['Player Name'].str.lower() == player.lower()]
    if player_row.empty:
        raise HTTPException(status_code=404, detail=f"Spilleren '{player}' blev ikke fundet.")
    
    target = player_row.iloc[0]

    # Dynamisk positionskolonne-detektering
    pos_col = 'Pos.' if 'Pos.' in GLOBAL_DATASET.columns else ('Position' if 'Position' in GLOBAL_DATASET.columns else 'Position')
    
    # Hent minutter og ryd NaN-støj
    extracted_mins = target.get('total mins played', target.get('Mins', 0))
    mins_played = int(extracted_mins) if not pd.isna(extracted_mins) else 0

    # Strukturering af datapakken opdelt efter dine 6 kategorier
    categorized_data: Dict[str, List[Dict[str, Any]]] = {}

    for category, metrics_list in PLAYER_STATS_METRICS.items():
        categorized_data[category] = []
        
        for p90_col, display_name in metrics_list:
            pr_col_name = p90_col.replace("_p90", "_p90PR")
            
            # 1. Hent den faktiske per-90 værdi (F.eks. 1.16 eller 0.05)
            raw_val = target.get(p90_col, 0.0)
            val = float(raw_val) if not pd.isna(raw_val) else 0.0
            
            # 2. Hent den præ-udregnede percentile rank (F.eks. 79.0 eller 26.0)
            raw_pr = target.get(pr_col_name, 0.0)
            pr_val = float(raw_pr) if not pd.isna(raw_pr) else 0.0
            # Sørg for at den holder sig inden for 0-100 rammen
            pr_val = max(0.0, min(pr_val, 100.0))

            # Tilføj metrik-kortet til kategorilisten
            categorized_data[category].append({
                "metric_name": display_name,
                "value": round(val, 2),
                "percentile": round(pr_val, 1),
                "status_tag": get_status_tag(pr_val)
            })

    # Hoved-JSON returneringen med alle stamdata og dine kategorier
    return {
        "player_name": target['Player Name'],
        "team": target.get('Team', 'Ukendt Klub'),
        "league": target.get('League', 'Ukendt Liga'),
        "position": target.get(pos_col, 'N/A'),
        "age": int(target.get('Age', 0)) if not pd.isna(target.get('Age')) else 0,
        "mins_played": mins_played,
        "team_id": str(target.get('contestantId', 'nan')),
        "categories": categorized_data
    }
