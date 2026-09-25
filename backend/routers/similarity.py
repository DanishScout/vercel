# ==========================================================================
# PER 90 - SIMILARITY.PY (API ROUTER TIL SPILLER-LIGHEDSMOTOR)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import numpy as np
from typing import List, Dict, Any
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity

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

# Inverteret ordbog til at oversætte fra Custom Title tilbage til CSV-kolonne
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

    # Find målinstancen (Target Player) inden filtrering af resten af ligaen
    target_row = df[df['Player Name'].str.lower() == target_player.lower()]
    if target_row.empty:
        raise HTTPException(status_code=404, detail=f"Spilleren '{target_player}' blev ikke fundet.")
    
    target_player_data = target_row.iloc[0]

    # Dynamisk Goalkeeper-tjek fuldstændig ligesom i Streamlit (fig.py)
    pos_col = 'Pos.' if 'Pos.' in df.columns else 'Position'
    is_gk = target_player_data[pos_col] == 'GK'
    df = df[df[pos_col] == 'GK'] if is_gk else df[df[pos_col] != 'GK']

    # Globale filtre (Ligaer, Positioner, Alder, Minutter)
    if leagues and len(leagues) > 0:
        df = df[df['League'].isin(leagues)]
        
    if positions and len(positions) > 0:
        df = df[df[pos_col].isin(positions)]

    if 'Age' in df.columns:
        df = df[(df['Age'] >= min_age) & (df['Age'] <= max_age)]
    
    mins_col = 'total mins played' if 'total mins played' in df.columns else 'Mins'
    if mins_col in df.columns:
        df = df[(df[mins_col] >= min_mins) & (df[mins_col] <= max_mins)]

    # Sørg for at fjerne target_player fra listen over mulige resultater (ligesom i fig.py)
    df_filtered = df[df['Player Name'].str.lower() != target_player.lower()]

    # Oversæt valgte metrikker til _p90 kolonner
    p90_columns = []
    for metric_title in selected_metrics:
        if metric_title in REVERSE_LOOKUP:
            csv_col = REVERSE_LOOKUP[metric_title]
            if csv_col in df_filtered.columns and pd.notna(target_player_data[csv_col]):
                p90_columns.append(csv_col)

    if not p90_columns:
        raise HTTPException(status_code=400, detail="Ingen matchende eller valide metrikker fundet.")

    # Drop rækker der mangler de valgte metrikker (dropna(subset=metrics) fra fig.py)
    df_filtered = df_filtered.dropna(subset=p90_columns)

    if df_filtered.empty:
        return {
            "target_player": target_player,
            "metrics_used": selected_metrics,
            "similar_players": []
        }

    # ==========================================================================
    # 🎯 FULDSÆNDIG IDENTISK STREAMLIT-MATEMATIK (StandardScaler + Cosine Similarity)
    # ==========================================================================
    
    # Byg den kombinerede dataframe til matrix-skalering (Target øverst, derefter filtrerede spillere)
    target_series = target_player_data[p90_columns].to_frame().T
    filtered_series = df_filtered[p90_columns]
    combined_df = pd.concat([target_series, filtered_series]).astype(float)

    # 1. StandardScaler normalisering (Z-Score)
    scaler = StandardScaler()
    scaled_matrix = scaler.fit_transform(combined_df)

    # 2. Cosine Similarity beregning
    target_vector_scaled = scaled_matrix[0].reshape(1, -1)
    players_matrix_scaled = scaled_matrix[1:]
    
    sim_scores = cosine_similarity(target_vector_scaled, players_matrix_scaled).flatten()

    # Gendan scores til procentform (sim * 100 ligesom i fig.py)
    df_filtered = df_filtered.copy()
    df_filtered["Similarity"] = sim_scores * 100

    # Find de top 10 mest lignende spillere
    top_similar_df = df_filtered.nlargest(10, "Similarity").reset_index(drop=True)

    # ==========================================================================
    # 🎯 VISUEL NORMALISERING (Formel til udfyldning af diagram-barrer)
    # ==========================================================================
    def normalize_bar_score(series):
        if series.max() == series.min():
            return pd.Series([50] * len(series), index=series.index)
        return 100 * (series - series.min()) / (series.max() - series.min())

    if not top_similar_df.empty:
        top_similar_df["bar_score"] = normalize_bar_score(top_similar_df["Similarity"])
    else:
        top_similar_df["bar_score"] = 0

    # Pak resultatet pænt ind til din similarity.js frontend
    results = []
    for i, row in top_similar_df.iterrows():
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
            "similarity_score": round(float(row["Similarity"]), 1),
            "bar_score": round(float(row["bar_score"]), 1),  # Sendes med til frontend-barren
            "metrics": player_metrics
        })

    return {
        "target_player": target_player,
        "metrics_used": selected_metrics,
        "similar_players": results
    }
