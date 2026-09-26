from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import requests
import base64
from io import BytesIO
from PIL import Image
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor

router = APIRouter(prefix="/api", tags=["table"])

# Lynhurtig logo-fetcher fra din Streamlit-logik
def fetch_logo_base64(team_id: str) -> str:
    if not team_id or team_id in ["nan", "None", ""]:
        return ""
    try:
        url = f"https://opta.net{team_id}"
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(url, headers=headers, timeout=3)
        r.raise_for_status()
        
        img = Image.open(BytesIO(r.content)).convert("RGBA")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        return "data:image/png;base64 scroll," + base64.b64encode(buffer.getvalue()).decode()
    except:
        return ""

@router.get("/table-data")
def get_scouting_table_data(
    stat_type: str = Query("Per 90", description="Per 90 eller Total"),
    metric: str = Query("Goals", description="Den primære metrik"),
    secondary_metric: str = Query("None", description="Valgfri sekundær metrik"),
    leagues: Optional[List[str]] = Query(None),
    nationalities: Optional[List[str]] = Query(None),
    positions: Optional[List[str]] = Query(None),
    min_age: int = Query(0),
    max_age: int = Query(100),
    min_mins: int = Query(0),
    max_mins: int = Query(99999)
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom.")

    suffix = "_p90" if stat_type == "Per 90" else "_Total"
    df = GLOBAL_DATASET.copy()

    try:
        # 1. Beregn de dynamiske formel-kolonner (Fra din Streamlit version)
        df[f'G/A{suffix}'] = df.get(f'total goals{suffix}', 0) + df.get(f'total assists{suffix}', 0)
        df[f'Progressive Actions{suffix}'] = df.get(f'progressive_passes{suffix}', 0) + df.get(f'Total Carries{suffix}', 0)
        df[f'npxG+xA{suffix}'] = df.get(f'xG{suffix}', 0) + df.get(f'xA{suffix}', 0)

        # Metrik mapping ordbog
        custom_titles = {
            f"total goals{suffix}": "Goals",
            f"G/A{suffix}": "G/A",
            f"xG{suffix}": "npxG",
            f"npxG+xA{suffix}": "npxG+xA",
            f"total ontarget attempt{suffix}": "Shots On Target",
            f"attempt_success_pct{suffix}": "On Target %",
            f"CreatedOwnShot{suffix}": "Created Own Shot",
            f"total attempt{suffix}": "Total Shots",
            f"total attempts obox{suffix}": "Shots Outside Box",
            f"total attempts ibox{suffix}": "Shots Inside Box",
            f"total assists{suffix}": "Assists",
            f"xA{suffix}": "xA",
            f"total att assist{suffix}": "Key Passes",
            f"xT_pass{suffix}": "xT via Live Passes",
            f"progressive_passes{suffix}": "Progressive Passes",
            f"Progressive Actions{suffix}": "Progressive Actions",
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
            f"total won contest{suffix}": "Successful Dribbles",
            f"total contest{suffix}": "Dribble Attempts",
            f"dribble_success_pct{suffix}": "Dribble Success %",
            f"Total Carries{suffix}": "Progressive Carries",
            f"Total Carry xT{suffix}": "xT via Prog. Carries",
            f"Total Final Third Carries{suffix}": "Carries Into Final ⅓",
            f"total touches in opposition box{suffix}": "Touches In Opp. Box",
            f"total was fouled{suffix}": "Fouls Drawn",
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

        # Omdøb CSV kolonner til pæne navne for nemmere filtrering
        columns_to_rename = {k: v for k, v in custom_titles.items() if k in df.columns}
        df = df.rename(columns=columns_to_rename)

        pos_col = 'Pos.' if 'Pos.' in df.columns else 'Position'
        
        # 2. SERVER-SIDE FILTRERING (Lynhurtigt i RAM)
        if leagues:
            df = df[df['League'].isin(leagues)]
        if nationalities:
            df = df[df['Nationality'].isin(nationalities)]
        if positions:
            df = df[df[pos_col].isin(positions)]

        # Alder og minutter
        df = df[(df['Age'] >= min_age) & (df['Age'] <= max_age)]
        mins_key = 'total mins played' if 'total mins played' in df.columns else 'Mins'
        df = df[(df[mins_key] >= min_mins) & (df[mins_key] <= max_max_mins)]

        if df.empty:
            return {"stat_type": stat_type, "table_headers": list(custom_titles.values()), "players": []}

        # 3. SORTERING & TOP 10
        primary_col = metric
        if primary_col not in df.columns:
            primary_col = "Goals"

        top10_df = df.sort_values(by=primary_col, ascending=False).head(10)

        # 4. TRÅDET LOGO-FETCH FOR KUN DE 10 SPILLERE
        team_ids = top10_df['contestantId'].astype(str).tolist()
        with ThreadPoolExecutor(max_workers=10) as executor:
            base64_logos = list(executor.map(fetch_logo_base64, team_ids))

        # 5. PAK ROW DATA
        rows_list = []
        for idx, (_, row) in enumerate(top10_df.iterrows()):
            player_metrics = {}
            for pretty_name in custom_titles.values():
                val = row.get(pretty_name, 0.0)
                player_metrics[pretty_name] = float(val) if not pd.isna(val) else 0.0

            rows_list.append({
                "player_name": str(row['Player Name']),
                "team": str(row.get('Team', 'Ukendt Klub')),
                "league": str(row.get('League', 'Ukendt Liga')),
                "position": str(row.get(pos_col, 'N/A')),
                "nationality": str(row.get('Nationality', 'N/A')),
                "age": int(row.get('Age', 0)) if not pd.isna(row.get('Age')) else 0,
                "mins_played": int(row.get(mins_key, 0)) if not pd.isna(row.get(mins_key)) else 0,
                "logo_base64": base64_logos[idx],
                "metrics": player_metrics
            })

        return {
            "stat_type": stat_type,
            "table_headers": ["Player Name", "Team", "League", "Pos.", "Nationality", "Age", "Mins"] + list(custom_titles.values()),
            "players": rows_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fejl: {str(e)}")
