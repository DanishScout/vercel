# ==========================================================================
# PER 90 - SIMILARITY.PY (API ROUTER TIL SPILLER-LIGHEDSMOTOR)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import numpy as np
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["similarity"])

# 🎯 1:1 KATEGORISERET MAPPING FRA DINE OFFICIELLE APPMETRIKKER (LÅST TIL _p90)
METRIC_CONFIG = {
    "Shooting": {
        "total goals_p90": "Goals",
        "xG_p90": "npxG",
        "total ontarget attempt_p90": "Shots On Target",
        "attempt_success_pct_p90": "On Target %",
        "CreatedOwnShot_p90": "Created Own Shot",
        "total attempt_p90": "Total Shots",
        "total attempts obox_p90": "Shots Outside Box",
        "total attempts ibox_p90": "Shots Inside Box"
    },
    "Passing / Playmaking": {
        "total assists_p90": "Assists",
        "xA_p90": "xA",
        "total att assist_p90": "Key Passes",
        "xT_pass_p90": "xT via Live Passes",
        "progressive_passes_p90": "Progressive Passes",   
        "passes_into_final_third_p90": "Passes Into Final 3rd",
        "forward_passes_p90": "Forward Passes",
        "total accurate fwd zone pass_p90": "Passes in Opp. Half",
        "total accurate back zone pass_p90": "Passes in Own Half",
        "total accurate pass_p90": "Accurate Passes",
        "total accurate long balls_p90": "Accurate Long Balls",
        "total accurate cross_p90": "Accurate Crosses",
        "pass_success_pct_p90": "Pass Accuracy %",
        "long_balls_success_pct_p90": "Long Ball Accuracy %",
        "cross_success_pct_p90": "Cross Accuracy %"
    },
    "Possession": {
        "total won contest_p90": "Successful Dribbles",
        "total contest_p90": "Dribble Attempts",
        "dribble_success_pct_p90": "Dribble Success %",
        "Total Carries_p90": "Progressive Carries",
        "Total Carry xT_p90": "xT via Prog. Carries",
        "Total Final Third Carries_p90": "Carries Into Final ⅓",
        "total touches in opposition box_p90": "Touches In Opp. Box",
        "total was fouled_p90": "Fouls Drawn"
    },
    "Defending / Duels": {
        "tackle_success_pct_p90": "Tackles Won %",
        "aerial_success_pct_p90": "Aerials Won %",
        "duel_success_pct_p90": "Duels Won %",
        "total won tackle_p90": "Tackles Won",
        "total aerial won_p90": "Aerials Won",
        "total duels won_p90": "Duels Won",
        "total effective clearance_p90": "Clearances",
        "total blocked scoring att_p90": "Blocked Shots",
        "total interception_p90": "Interceptions"
    }
}


# Flad ordbog til hurtigt opslag på tværs af kategorier
CUSTOM_TITLES_P90 = {}
for category, metrics in METRIC_CONFIG.items():
    CUSTOM_TITLES_P90.update(metrics)

# Inverteret ordbog til at oversætte fra Custom Title (f.eks. "npxG") tilbage til CSV-kolonne (f.eks. "xG_p90")
REVERSE_LOOKUP = {v: k for k, v in CUSTOM_TITLES_P90.items()}


@router.get("/similarity-config")
def get_similarity_config():
    """Returnerer metrikkerne opdelt i kategorier, så similarity.js nemt kan bygge tjekbokse i grupper"""
    return {
        "categories": {cat: list(metrics.values()) for cat, metrics in METRIC_CONFIG.items()}
    }


@router.get("/similarity-search")
def search_similar_players(
    target_player: str = Query(..., description="Navnet på spilleren der skal sammenlignes med"),
    selected_metrics: List[str] = Query(..., description="De valgte metrikker sendt som pæne navne"),
    # 🎯 RETTELSE: Defineres explicit som List[str], så FastAPI tillader multivalg i URL'en
    leagues: List[str] = Query(None, description="Filtrer på specifikke ligaer"),
    positions: List[str] = Query(None, description="Filtrer på specifikke positioner"),
    min_age: int = Query(0),
    max_age: int = Query(100),
    min_mins: int = Query(0),
    max_mins: int = Query(99999)
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom eller ikke indlæst.")

    df = GLOBAL_DATASET.copy()

    # Find målinstansen (Target Player) inden filtrering af resten af ligaen
    target_row = df[df['Player Name'].str.lower() == target_player.lower()]
    if target_row.empty:
        raise HTTPException(status_code=404, detail=f"Spilleren '{target_player}' blev ikke fundet.")
    
    target_player_data = target_row.iloc[0]

    if leagues and len(leagues) > 0:
        df = df[df['League'].isin(leagues)]
        
    if positions and len(positions) > 0:
        # Præcis samme positions-kolonnetjek som i din table.py!
        pos_col = 'Pos.' if 'Pos.' in df.columns else ('Position' if 'Position' in df.columns else 'Position')
        df = df[df[pos_col].isin(positions)]

        
    # Alder- og minutfiltrering kører videre som før
    if 'Age' in df.columns:
        df = df[(df['Age'] >= min_age) & (df['Age'] <= max_age)]
    
    mins_col = 'total mins played' if 'total mins played' in df.columns else 'Mins'
    if mins_col in df.columns:
        df = df[(df[mins_col] >= min_mins) & (df[mins_col] <= max_mins)]

    # ... RESTEN AF DIN METRIC-NORMALISERING OG EUKLIDISKE BEREGNING ER UÆNDRET HERFRA ...


    # Sørg for at target_player altid overlever filtreringen midlertidigt hvis nødvendigt,
    # eller blot tilføjes som vektor-reference.

    # Oversæt valgte metrikker til _p90 kolonner
    p90_columns = []
    for metric_title in selected_metrics:
        if metric_title in REVERSE_LOOKUP:
            csv_col = REVERSE_LOOKUP[metric_title]
            if csv_col in df.columns:
                p90_columns.append(csv_col)

    if not p90_columns:
        raise HTTPException(status_code=400, detail="Ingen matchende metrikker.")

    target_vector = np.array([
        float(target_player_data[col]) if not pd.isna(target_player_data.get(col)) else 0.0 
        for col in p90_columns
    ])

    # Min-Max normalisering (baseret på det nu filtrerede/relevante datasæt)
    min_max_dict = {}
    for col in p90_columns:
        max_val = float(df[col].max()) if not df[col].empty else 1.0
        min_val = float(df[col].min()) if not df[col].empty else 0.0
        if max_val == min_val:
            max_val += 0.001
        min_max_dict[col] = {"min": min_val, "max": max_val}

    results = []
    pos_col = 'Pos.' if 'Pos.' in df.columns else 'Position'

    for _, row in df.iterrows():
        if pd.isna(row.get('Player Name')) or str(row['Player Name']).lower() == target_player.lower():
            continue

        try:
            current_vector = []
            target_vector_norm = []
            
            for idx, col in enumerate(p90_columns):
                val = float(row[col]) if not pd.isna(row[col]) else 0.0
                t_val = target_vector[idx]
                
                mn = min_max_dict[col]["min"]
                mx = min_max_dict[col]["max"]
                
                norm_val = (val - mn) / (mx - mn)
                norm_t_val = (t_val - mn) / (mx - mn)
                
                current_vector.append(norm_val)
                target_vector_norm.append(norm_t_val)

            current_vector = np.array(current_vector)
            target_vector_norm = np.array(target_vector_norm)

            distance = np.linalg.norm(target_vector_norm - current_vector)
            max_possible_dist = np.sqrt(len(p90_columns))
            similarity_pct = max(0.0, min(100.0, (1.0 - (distance / max_possible_dist)) * 100.0))
        except Exception:
            continue

        extracted_mins = row.get('total mins played', row.get('Mins', 0))
        mins_played = int(extracted_mins) if not pd.isna(extracted_mins) else 0

        player_metrics = {CUSTOM_TITLES_P90[col]: float(row[col]) if not pd.isna(row[col]) else 0.0 for col in p90_columns}

        results.append({
            "player_name": str(row['Player Name']),
            "team": str(row.get('Team', 'Ukendt Klub')),
            "league": str(row.get('League', 'Ukendt Liga')),
            "position": str(row.get(pos_col, 'N/A')),
            "nationality": str(row.get('Nationality', 'N/A')),
            "age": int(row.get('Age', 0)) if not pd.isna(row.get('Age')) else 0,
            "mins_played": mins_played,
            "team_id": str(row.get('contestantId', 'nan')),
            "similarity_score": round(similarity_pct, 1),
            "metrics": player_metrics
        })

    # Sorter og returner de ægte top 10 efter filtrering
    top_similar = sorted(results, key=lambda x: x['similarity_score'], reverse=True)[:10]

    return {
        "target_player": target_player,
        "metrics_used": selected_metrics,
        "similar_players": top_similar
    }
