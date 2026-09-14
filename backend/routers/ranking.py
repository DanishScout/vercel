# ==========================================================================
# PER 90 - RANKING.PY (API ROUTER TIL AUTOMATISK INDLÆSNING AF ROLES.CSV)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import numpy as np
import os
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["ranking"])

# 1. 🎯 POSITION GROUPS MAPPING FRA DIN STREAMLIT LOGIK
POSITION_MAP = {
    "CBs": ["CB"],
    "FB/Wide CBs": ["LB/LCB", "RB/RCB"],
    "DM/CMs": ["DM/CM"],
    "AM/Wide Midfielders": ["CM/AM", "LM/LCM", "RM/RCM"],
    "Wingers": ["LW", "RW"],
    "Strikers": ["ST"]
}

POSITION_TO_ROLES = {
    "CBs": ["Quarterback", "All-rounder", "No-nonsense CB"],
    "FB/Wide CBs": ["Chance Creator", "Circulator", "Lockdown Defender"],
    "DM/CMs": ["Playmaker", "Connector", "Box-crasher", "Anchor"],
    "AM/Wide Midfielders": ["Goalscoring threat", "Playmaker", "Connector"],
    "Wingers": ["Playmaker", "Inside Forward", "Direct Winger"],
    "Strikers": ["Poacher", "Target Man", "False 9"]
}

def get_position_group(pos: str) -> str:
    for group, pos_list in POSITION_MAP.items():
        if pos in pos_list:
            return group
    return "Other"

# 2. 📂 DYNAMISK MATRIX: Vi indlæser roles.csv direkte ind i hukommelsen
ROLES_DB = {}
DATA_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
roles_path = os.path.join(DATA_DIR, "roles.csv")

if os.path.exists(roles_path):
    try:
        # Vi læser din separator som tab (\t) eller semikolon/komma alt efter dit Excel-ark
        roles_df = pd.read_csv(roles_path)
        for _, row in roles_df.iterrows():
            role_name = str(row["Role"]).strip()
            
            # Træk de 6 metrics ud
            metrics_list = [row[f"Metric{i}"] for i in range(1, 7) if f"Metric{i}" in row and pd.notna(row[f"Metric{i}"])]
            
            # Træk dine weights ud (hvis Weight4-6 mangler i arket, falder vi tilbage på en harmonisk vægt)
            weights_list = []
            for i in range(1, 7):
                w_key = f"Weight{i}"
                if w_key in row and pd.notna(row[w_key]):
                    weights_list.append(float(row[w_key]))
                else:
                    weights_list.append(0.15) # Neutral standardvægt for manglende kolonner
            
            ROLES_DB[role_name] = {
                "metrics": metrics_list,
                "weights": weights_list[:len(metrics_list)] # Sørg for at array-længden matcher præcist
            }
        print(f"LOG: Succesfuldt indlæst {len(ROLES_DB)} taktiske roller fra roles.csv.")
    except Exception as e:
        print(f"KRITISK FEJL ved indlæsning af roles.csv: {str(e)}")
else:
    print(f"ADVARSEL: roles.csv blev ikke fundet på stien: {roles_path}")


@router.get("/ranking-config")
def get_ranking_config():
    """Sender opsætningen direkte videre til ranking.js, så frontenden automatisk tilpasser sig din CSV!"""
    return {
        "position_groups": list(POSITION_MAP.keys()),
        "position_to_roles": POSITION_TO_ROLES
    }


@router.get("/ranking-data")
def get_performance_ranking(
    position_group: str = Query("CBs"),
    role_name: str = Query("Quarterback"),
    leagues: List[str] = Query(None), # Ændret til valfri liste
    min_age: int = Query(0),
    max_age: int = Query(100),
    min_mins: int = Query(0),
    max_mins: int = Query(99999)
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom eller ikke indlæst.")

    if role_name not in ROLES_DB:
        raise HTTPException(status_code=404, detail=f"Rollen '{role_name}' blev ikke fundet i roles.csv.")

    df = GLOBAL_DATASET.copy()
    pos_col = 'Pos.' if 'Pos.' in df.columns else ('Position' if 'Position' in df.columns else 'Position')
    df["PositionGroup"] = df[pos_col].apply(get_position_group)

    # 🎯 1. FILTRERING: Lås til positionsgruppen med det samme
    df = df[df["PositionGroup"] == position_group].reset_index(drop=True)
    if df.empty:
        return {"role_name": role_name, "players": []}

    # 🎯 2. FILTRERING: Ligaer (Håndterer multivalg og skipper hvis "All" eller tom)
    if leagues and "All" not in leagues:
        df = df[df["League"].isin(leagues)]

    # 🎯 3. FILTRERING: Alder og Minutter Spillet på det FULDE datasæt
    extracted_mins_col = 'total mins played' if 'total mins played' in df.columns else 'Mins'
    if "Age" in df.columns:
        df = df[(df["Age"] >= min_age) & (df["Age"] <= max_age)]
    if extracted_mins_col in df.columns:
        df = df[(df[extracted_mins_col] >= min_mins) & (df[extracted_mins_col] <= max_mins)]

    if df.empty:
        return {"position_group": position_group, "role_name": role_name, "metrics_used": ROLES_DB[role_name]["metrics"], "players": []}

    # 🎯 4. BEREGNING: Min-Max normalisering sker NU kun på de spillere, der klarede filteret!
    role_metrics = ROLES_DB[role_name]["metrics"]
    role_weights = np.array(ROLES_DB[role_name]["weights"], dtype=float)

    for m in role_metrics:
        if m not in df.columns:
            df[m] = 0.0

    score_columns = []
    for metric in role_metrics:
        max_val = df[metric].max()
        min_val = df[metric].min()
        score_col = f"{metric}_score"
        score_columns.append(score_col)

        if max_val != min_val:
            df[score_col] = (df[metric] - min_val) / (max_val - min_val) * 100
        else:
            df[score_col] = 50.0

    weights_sum = role_weights.sum() if role_weights.sum() > 0 else 1.0
    df["role_score"] = df[score_columns].dot(role_weights) / weights_sum

    # Sorter efter højeste score og tag de sande top 9 (eller top 10 til API-pakken)
    df_sorted = df.sort_values("role_score", ascending=False).reset_index(drop=True)
    top_10 = df_sorted.head(10)

    rows_list = []
    for idx, row in top_10.iterrows():
        nationality = str(row.get('Nationality', 'N/A')) if not pd.isna(row.get('Nationality')) else 'N/A'
        mins_played = int(row[extracted_mins_col]) if not pd.isna(row[extracted_mins_col]) else 0

        individual_scores = {}
        for m in role_metrics:
            individual_scores[m] = round(float(row[f"{m}_score"]), 1)

        rows_list.append({
            "rank": idx + 1,
            "player_name": str(row['Player Name']),
            "team": str(row.get('Team', 'Ukendt Klub')),
            "league": str(row.get('League', 'Ukendt Liga')),
            "position": str(row[pos_col]),
            "nationality": nationality,
            "age": int(row.get('Age', 0)) if not pd.isna(row.get('Age')) else 0,
            "mins_played": mins_played,
            "team_id": str(row.get('contestantId', 'nan')),
            "role_score": round(float(row["role_score"]), 1),
            "metric_scores": individual_scores
        })

    return {
        "position_group": position_group,
        "role_name": role_name,
        "metrics_used": role_metrics,
        "players": rows_list
    }

