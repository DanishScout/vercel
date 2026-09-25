# ==========================================================================
# PER 90 - TABLE.PY (OPTIMERET API ROUTER TIL DATATABEL)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["table"])

@router.get("/table-data")
def get_scouting_table_data(
    stat_type: str = Query("Per 90", description="Vælg mellem 'Per 90' eller 'Total'")
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom eller ikke indlæst.")

    suffix = "_p90" if stat_type == "Per 90" else "_Total"
    
    custom_titles = {
        # shot
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

        # pass
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

        # poss
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

    try:
        # Arbejd på en kopi for at beskytte master-data
        df = GLOBAL_DATASET.copy()

        # 1. VEKTORISERET RENSNING (Sker lynhurtigt i hukommelsen for HELE kolonnen)
        pos_col = 'Pos.' if 'Pos.' in df.columns else ('Position' if 'Position' in df.columns else 'Position')
        min_col = 'total mins played' if 'total mins played' in df.columns else ('Mins' if 'Mins' in df.columns else None)
        
        # Konverter kernemetadata på forhånd, så vi undgår pd.isna() og str() i loopet
        df['clean_player_name'] = df['Player Name'].fillna("").astype(str)
        df['clean_team'] = df['Team'].fillna("Ukendt Klub").astype(str)
        df['clean_league'] = df['League'].fillna("Ukendt Liga").astype(str)
        df['clean_pos'] = df[pos_col].fillna("N/A").astype(str)
        df['clean_nat'] = df['Nationality'].fillna("N/A").astype(str)
        df['clean_age'] = df['Age'].fillna(0).astype(int)
        df['clean_mins'] = df[min_col].fillna(0).astype(int) if min_col else 0
        df['clean_team_id'] = df['contestantId'].fillna("nan").astype(str)

        # Find de metrik-kolonner der rent faktisk eksisterer i CSV-filen, og rens dem i én arbejdsgang
        existing_csv_cols = [col for col in custom_titles.keys() if col in df.columns]
        df[existing_csv_cols] = df[existing_csv_cols].fillna(0.0).astype(float)

        # Skab lister over keys til lynhurtigt opslag under loopet
        metric_mapping = [(csv_col, pretty_name) for csv_col, pretty_name in custom_titles.items() if csv_col in df.columns]
        missing_metrics = [pretty_name for csv_col, pretty_name in custom_titles.items() if csv_col not in df.columns]

        rows_list = []
        
        # 2. STRØMLINET LOOP (Ingen if-tjek eller datatype-konverteringer herinde)
        for _, row in df.iterrows():
            p_name = row['clean_player_name']
            if not p_name:  # Springer tomme spillernavne over
                continue

            # Byg metrik-dictionary lynhurtigt ud fra præ-rensede værdier
            player_metrics = {pretty_name: row[csv_col] for csv_col, pretty_name in metric_mapping}
            for pretty_name in missing_metrics:
                player_metrics[pretty_name] = 0.0

            rows_list.append({
                "player_name": p_name,
                "team": row['clean_team'],
                "league": row['clean_league'],
                "position": row['clean_pos'],
                "nationality": row['clean_nat'],
                "age": int(row['clean_age']),
                "mins_played": int(row['clean_mins']),
                "team_id": row['clean_team_id'],
                "metrics": player_metrics
            })

        return {
            "stat_type": stat_type,
            "suffix_used": suffix,
            "table_headers": ["Player Name", "Team", "League", "Pos.", "Nationality", "Age", "Mins"] + list(custom_titles.values()),
            "players": rows_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fejl under generering af tabel-feed: {str(e)}")
