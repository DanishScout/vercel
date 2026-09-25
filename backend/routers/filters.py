# ==========================================================================
# PER 90 - FILTERS.PY (API ROUTER TIL AVANCERET METRIK-FILTRERING)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["filters"])

@router.get("/filters-data")
def get_advanced_filters_data(
    stat_type: str = Query("Per 90", description="Vælg mellem 'Per 90' eller 'Total'")
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom eller ikke indlæst.")

    # 1. 🎯 SUFFIX LOGIK EN-TIL-EN FRA PIZZA & TABLE
    suffix = "_p90" if stat_type == "Per 90" else "_Total"
    
    # Lokalt udtræk for at beskytte master-datasættet
    df = GLOBAL_DATASET.copy()

    try:

        custom_titles = {
            #shot
            f"G/A{suffix}": "G+A",
            f"npxG + xA{suffix}": "npxG + xA",
            f"total goals{suffix}": "Goals",
            f"xG{suffix}": "npxG",
            f"total ontarget attempt{suffix}": "Shots On Target",
            f"attempt_success_pct{suffix}": "On Target %",
            f"CreatedOwnShot{suffix}": "Created Own Shot",
            f"total attempt{suffix}": "Total Shots",
            f"total attempts obox{suffix}": "Shots Outside Box",
            f"total attempts ibox{suffix}": "Shots Inside Box",
    
            #pass
            f"total assists{suffix}": "Assists",
            f"xA{suffix}": "xA",
            f"total att assist{suffix}": "Key Passes",
            f"xT_pass{suffix}": "xT via Live Passes",
            f"progressive_passes{suffix}": "Progressive Passes",     
            f"passes_into_final_third{suffix}": "Passes Into Final 3rd",
            f"forward_passes{suffix}": "Forward Passes",
            f"total accurate fwd zone pass{suffix}": "Passes in Opp. Half",
            f"total accurate back zone pass{suffix}": "Passes in Own Half",
            f"total accurate pass{suffix}": "Accurate Passes",
            f"total accurate long balls{suffix}": "Accurate Long Balls",
            f"total accurate cross{suffix}": "Accurate Crosses",
            f"pass_success_pct{suffix}": "Pass Accuracy %",
            f"long_balls_success_pct{suffix}": "Long Ball Accuracy %",
            f"cross_success_pct{suffix}": "Cross Accuracy %",
    
            #poss
            f"Progressive Actions{suffix}": "Progressive Actions",
            f"total won contest{suffix}": "Successful Dribbles",
            f"total contest{suffix}": "Dribble Attempts",
            f"dribble_success_pct{suffix}": "Dribble Success %",
            f"Total Carries{suffix}": "Progressive Carries",
            f"Total Carry xT{suffix}": "xT via Prog. Carries",
            f"Total Final Third Carries{suffix}": "Carries Into Final ⅓",
            f"total touches in opposition box{suffix}": "Touches In Opp. Box",
            f"total was fouled{suffix}": "Fouls Drawn",
        
            # Defending metrics
            f"tackle_success_pct{suffix}": "Tackles Won %",
            f"aerial_success_pct{suffix}": "Aerials Won %",
            f"duel_success_pct{suffix}": "Duels Won %",
            f"total won tackle{suffix}": "Tackles Won",
            f"total aerial won{suffix}": "Aerials Won",
            f"total duels won{suffix}": "Duels Won",
            f"total effective clearance{suffix}": "Clearances",
            f"total blocked scoring att{suffix}": "Blocked Shots",
            f"total interception{suffix}": "Interceptions",
            f"Ball Recoveries{suffix}": "Ball Recoveries"
    
        }

        # Dynamisk opspuring af positionskolonnen i dit CSV-ark
        pos_col = 'Pos.' if 'Pos.' in df.columns else ('Position' if 'Position' in df.columns else 'Position')

        # 3. LOOP IGENNEM CSV-ARKET OG GENERER ROW-DATA TIL FILTER-MOTOREN
        rows_list = []
        for _, row in df.iterrows():
            if pd.isna(row.get('Player Name')):
                continue

            # Vi pakker metrikkerne ud med de pæne, læsbare navne til frontenden
            player_metrics = {}
            for csv_col, pretty_name in custom_titles.items():
                if csv_col in df.columns:
                    val = row[csv_col]
                    player_metrics[pretty_name] = float(val) if not pd.isna(val) else 0.0
                else:
                    player_metrics[pretty_name] = 0.0

            # Uddrag og rens spilletid (Minutter)
            extracted_mins = row.get('total mins played', row.get('Mins', 0))
            mins_played = int(extracted_mins) if not pd.isna(extracted_mins) else 0

            # Uddrag og rens nationalitet
            nationality = str(row.get('Nationality', 'N/A')) if not pd.isna(row.get('Nationality')) else 'N/A'

            # Tilføj spilleren i det genkendelige PER 90 format
            rows_list.append({
                "player_name": str(row['Player Name']),
                "team": str(row.get('Team', 'Ukendt Klub')),
                "league": str(row.get('League', 'Ukendt Liga')),
                "position": str(row.get(pos_col, 'N/A')),
                "nationality": nationality,
                "age": int(row.get('Age', 0)) if not pd.isna(row.get('Age')) else 0,
                "mins_played": mins_played,
                "team_id": str(row.get('contestantId', 'nan')),
                "metrics": player_metrics
            })

        # Returner den færdige datapakke
        return {
            "stat_type": stat_type,
            "suffix_used": suffix,
            "filter_metrics": list(custom_titles.values()),
            "players": rows_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fejl under generering af filter-feed: {str(e)}")
