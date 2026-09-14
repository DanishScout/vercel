# ==========================================================================
# PER 90 - PIZZA.PY (RETTET ILOC) - DEL 1 AF 2
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from typing import List

router = APIRouter(prefix="/api", tags=["pizza"])

AVAILABLE_METRICS_MAP = {
    "Shooting": {
        "total goals_p90": "Goals",
        "xG_p90": "npxG",
        "total ontarget attempt_p90": "Shots On Target",
        "attempt_success_pct_p90": "On Target %",
        "CreatedOwnShot_p90": "Created Own Shot",
        "total attempt_p90": "Total Shots",
        "total attempts obox_p90": "Shots Outside Box",
        "total attempts ibox_p90": "Shots Inside Box",

    },
    "Passing": {
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
        "cross_success_pct_p90": "Cross Accuracy %",
    },
    "Possession": {
        "total won contest_p90": "Successful Dribbles",
        "total contest_p90": "Dribble Attempts",
        "dribble_success_pct_p90": "Dribble Success %",
        "Total Carries_p90": "Progressive Carries",
        "Total Carry xT_p90": "xT via Prog. Carries",
        "Total Final Third Carries_p90": "Carries Into Final ⅓",
        "total touches in opposition box_p90": "Touches In Opp. Box",
        "total was fouled_p90": "Fouls Drawn",

    },
    
    "Defending": {
        "tackle_success_pct_p90": "Tackles Won %",
        "aerial_success_pct_p90": "Aerials Won %",
        "duel_success_pct_p90": "Duels Won %",
        "total won tackle_p90": "Tackles Won",
        "total aerial won_p90": "Aerials Won",
        "total duels won_p90": "Duels Won",
        "total effective clearance_p90": "Clearances",
        "total blocked scoring att_p90": "Blocked Shots",
        "total interception_p90": "Interceptions"
    },
}

FLAT_METRICS = {k: v for cat in AVAILABLE_METRICS_MAP.values() for k, v in cat.items()}

@router.get("/pizza/players")
def get_all_players():
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty: return []
    return sorted(GLOBAL_DATASET['Player Name'].dropna().unique().tolist())

@router.get("/pizza/positions")
def get_all_positions():
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty: return []
    pos_column = 'Pos.' if 'Pos.' in GLOBAL_DATASET.columns else ('Position' if 'Position' in GLOBAL_DATASET.columns else None)
    if not pos_column: return []
    return sorted(GLOBAL_DATASET[pos_column].dropna().unique().tolist())# ==========================================================================
# PER 90 - PIZZA.PY (RETTET DATA-UDTRÆK) - DEL 2 AF 2
# ==========================================================================

@router.get("/pizza")
def get_pizza_data(
    player: str = Query(..., description="Navnet på målspilleren"),
    compare_pos: str = Query(..., description="Positionen der skal sammenlignes imod"),
    metrics: List[str] = Query(None, description="De valgte visningsnavne fra tjekboksene")
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom.")

    pos_column = 'Pos.' if 'Pos.' in GLOBAL_DATASET.columns else ('Position' if 'Position' in GLOBAL_DATASET.columns else None)
    if not pos_column:
        raise HTTPException(status_code=500, detail="Positionskolonne mangler i CSV.")

    player_row = GLOBAL_DATASET[GLOBAL_DATASET['Player Name'].str.lower() == player.lower()]
    if player_row.empty:
        raise HTTPException(status_code=404, detail=f"Spilleren '{player}' blev ikke fundet.")
    
    # KORREKT ILOC[0] FIX HER 🎯
    target_player_data = player_row.iloc[0]
    player_league = target_player_data.get('League', None)

    filter_mask = (GLOBAL_DATASET[pos_column] == compare_pos)
    if player_league is not None:
        filter_mask = filter_mask & (GLOBAL_DATASET['League'] == player_league)
        
    comparison_df = GLOBAL_DATASET[filter_mask].copy()

    if player not in comparison_df['Player Name'].values:
        comparison_df = pd.concat([comparison_df, player_row], ignore_index=True)

    labels = []
    percentiles = []

    for csv_column, display_name in FLAT_METRICS.items():
        if metrics is not None and display_name not in metrics:
            continue

        if csv_column in comparison_df.columns:
            comparison_df[f'{csv_column}_pct'] = comparison_df[csv_column].rank(pct=True, method='max') * 100.0
            player_pct_row = comparison_df[comparison_df['Player Name'].str.lower() == player.lower()]
            pct_val = player_pct_row[f'{csv_column}_pct'].iloc[0] if not player_pct_row.empty else 0.0
            if pd.isna(pct_val): pct_val = 0.0
            labels.append(display_name)
            percentiles.append(round(max(0.0, min(float(pct_val), 100.0)), 1))
        else:
            labels.append(f"{display_name} (Mangler)")
            percentiles.append(0.0)

    # TRÆKKER DATA UD FRA DIN CSV
    extracted_mins = target_player_data.get('total mins played', target_player_data.get('Mins', 0))
    if pd.isna(extracted_mins): 
        extracted_mins = 0
    else:
        extracted_mins = int(extracted_mins)

    return {
        "player_name": target_player_data['Player Name'],
        "team": target_player_data.get('Team', 'Ukendt Klub'),
        
        # Din pizza.js renderer ud fra apiResponse.league, så vi mapper klubnavnet ('Team') hertil:
        "league": target_player_data.get('League', 'Ukendt Klub'), 
        
        "player_pos": target_player_data.get(pos_column, 'Ukendt'),
        
        # Sender minutterne med over i JSON-svaret
        "mins_played": extracted_mins, 
        
        "metrics": labels,
        "percentiles": percentiles,
        "team_id": str(target_player_data.get('contestantId', 'nan'))
    }