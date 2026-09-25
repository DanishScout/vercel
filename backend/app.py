from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pandas as pd
import os
import requests
import base64
import random

app = FastAPI(
    title="PER 90 - Analytics API Engine",
    description="Asynkron datamotor til performance-filtrering"
)

# CORS-SÆTNINGER: Gør at din frontend må tale med din backend på port 8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LOKAL DATA-STI: Kigger direkte i backend-mappen (hvor app.py ligger)
DATA_DIR = os.path.abspath(os.path.dirname(__file__))
GLOBAL_DATASET = None

@app.on_event("startup")
def startup_load_data():
    """Indlæser og cachelagrer alle liga-CSV-filer i hukommelsen med det samme ved boot"""
    global GLOBAL_DATASET
    files = ['aut1.csv', 'tur1.csv', 'sco1.csv', 'cze1.csv', 'gre1.csv', 'swi1.csv', 'ger2.csv',
             'cro1.csv', 'pol1.csv', 'ser1.csv', 'swe1.csv', 'nor1.csv', 'svk1.csv', 'fin1.csv',
             'eng1.csv', 'eng2.csv', 'ger1.csv', 'ita1.csv', 'spa1.csv', 'fra1.csv', 'por1.csv', 
             'hol1.csv', 'bel1.csv', 'den1.csv', 'den2.csv']
    combined_df = []
    
    print(f"LOG: Starter PER 90 datamotoren. Leder efter filer i: {DATA_DIR}")
    
    for f in files:
        path = os.path.join(DATA_DIR, f)
        if os.path.exists(path):
            try:
                df = pd.read_csv(path)
                combined_df.append(df)
                print(f"LOG: Indlæste succesfuldt {f} med {len(df)} spillere.")
            except Exception as e:
                print(f"ADVARSEL: Kunne ikke indlæse {f}. Fejl: {str(e)}")
                continue
             
    if combined_df:
        GLOBAL_DATASET = pd.concat(combined_df, ignore_index=True)
        
        # Opret en midlertidig ordbog til at holde alle de nye beregninger
        # Det forhindrer at datasættet fragmenteres i hukommelsen
        nye_beregninger = {}
        
        # 🛠️ 1. BEREGN NY NPXG + XA METRIC
        if 'xG_Total' in GLOBAL_DATASET.columns and 'xA_Total' in GLOBAL_DATASET.columns:
            nye_beregninger['npxG + xA_Total'] = GLOBAL_DATASET['xG_Total'] + GLOBAL_DATASET['xA_Total']
            
        if 'xG_p90' in GLOBAL_DATASET.columns and 'xA_p90' in GLOBAL_DATASET.columns:
            nye_beregninger['npxG + xA_p90'] = GLOBAL_DATASET['xG_p90'] + GLOBAL_DATASET['xA_p90']

        # 🛠️ 2. BEREGN NY G/A METRIC (Mål + Assists lagt sammen)
        if 'total goals_Total' in GLOBAL_DATASET.columns and 'total assists_Total' in GLOBAL_DATASET.columns:
            nye_beregninger['G/A_Total'] = GLOBAL_DATASET['total goals_Total'] + GLOBAL_DATASET['total assists_Total']
            
        if 'total goals_p90' in GLOBAL_DATASET.columns and 'total assists_p90' in GLOBAL_DATASET.columns:
            nye_beregninger['G/A_p90'] = GLOBAL_DATASET['total goals_p90'] + GLOBAL_DATASET['total assists_p90']

        # 🛠️ 3. BEREGN NY PROGRESSIVE ACTIONS METRIC (Progressive Passes + Carries)
        if 'progressive_passes_Total' in GLOBAL_DATASET.columns and 'Total Carries_Total' in GLOBAL_DATASET.columns:
            nye_beregninger['Progressive Actions_Total'] = GLOBAL_DATASET['progressive_passes_Total'] + GLOBAL_DATASET['Total Carries_Total']
            
        if 'progressive_passes_p90' in GLOBAL_DATASET.columns and 'Total Carries_p90' in GLOBAL_DATASET.columns:
            nye_beregninger['Progressive Actions_p90'] = GLOBAL_DATASET['progressive_passes_p90'] + GLOBAL_DATASET['Total Carries_p90']

        # 🚀 "LIM" ALLE KOLONNER PÅ ÉN GANG (axis=1 betyder kolonne-retning)
        if nye_beregninger:
            GLOBAL_DATASET = pd.concat([GLOBAL_DATASET, pd.DataFrame(nye_beregninger)], axis=1)

        print(f"LOG: Datamotor klar! Samlet database indeholder {len(GLOBAL_DATASET)} aktive spillere.")


# --- DELT CLOUDFLARE-BILLEDPROXY TIL DINE CANVAS-VISUALISERINGER ---
@app.get("/api/logo/{team_id}")
def get_team_logo_base64(team_id: str):
    """Henter klublogo bag om Cloudflare/Akamai-mure og leverer en sikker Base64-streng til dit HTML Canvas"""
    if not team_id or str(team_id) == "nan" or str(team_id) == "None":
        return {"logo_base64": ""}
    
    try:
        url = f'https://omo.akamai.opta.net/image.php?secure=true&h=omo.akamai.opta.net&sport=football&entity=team&description=badges&dimensions=150&id={team_id}'
        # Cloudflare-script logik: Vi camouflerer kaldet med en browser User-Agent, så Akamai/Cloudflare ikke blokerer os
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            img_str = base64.b64encode(response.content).decode()
            return {"logo_base64": f"data:image/png;base64,{img_str}"}
        else:
            return {"logo_base64": "", "msg": f"Cloudflare/Opta afviste med status {response.status_code}"}
    except Exception as e:
        print(f"ADVARSEL: Cloudflare proxy-fejl for hold {team_id}: {str(e)}")
        return {"logo_base64": ""}

# --- UPGRADERET ENDPOINT: LIGA-FOKUSERET LIVE KARRUSEL DATA ---
@app.get("/api/carousel")
def get_carousel_data():
    """Returnerer top 3 spillere fra en tilfældig liga for en tilfældig metric"""
    global GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        return {"error": "Databasen er tom eller ikke indlæst"}

    metrics_map = {
        "total goals": "Goals",
        "xG": "npxG",
        "total attempt": "Shots",
        "total assists": "Assists",
        "xA": "xA",
        "total att assist": "Key Passes",
        "total won tackle": "Tackles Won",
        "total aerial won": "Aerials Won",
        "total duels won": "Duels Won"
    }

    # Find ud af hvad ligakolonnen hedder i dit datasæt
    league_col = 'League' if 'League' in GLOBAL_DATASET.columns else 'league'
    if league_col not in GLOBAL_DATASET.columns:
        return {"error": "Kolonnen 'League' blev ikke fundet i datasættet"}

    unique_leagues = GLOBAL_DATASET[league_col].dropna().unique().tolist()
    if not unique_leagues:
        return {"error": "Ingen ligaer fundet i datasættet"}

    # Vælg en tilfældig liga til dette specifikke slide
    random_league = random.choice(unique_leagues)

    # Filtrer datasættet til KUN at matche den valgte liga
    df_league = GLOBAL_DATASET[GLOBAL_DATASET[league_col] == random_league].copy()

    # Sorter outliers fra baseret på dit krav om minimum 200 minutter
    if 'total mins played' in df_league.columns:
        df_league = df_league[df_league['total mins played'] >= 200]

    if df_league.empty:
        return {"metric_name": "Ingen data", "suffix_type": "", "league_name": str(random_league), "players": []}

    # Vælg en tilfældig metric og et tilfældigt suffix
    raw_metric = random.choice(list(metrics_map.keys()))
    suffix = random.choice(["_p90", "_Total"])
    actual_column = f"{raw_metric}{suffix}"

    display_metric = metrics_map[raw_metric]
    display_suffix = "Per 90" if suffix == "_p90" else "Total"

    if actual_column not in df_league.columns:
        return {"metric_name": display_metric, "suffix_type": display_suffix, "league_name": str(random_league), "players": []}

    # Sorter og nap de 3 bedste spillere i denne liga
    top_3 = df_league.sort_values(by=actual_column, ascending=False).head(3)

    players_list = []
    for _, row in top_3.iterrows():
        players_list.append({
            "player_name": row.get("Player Name", row.get("Player", "Ukendt Spiller")),
            "team_name": row.get("Team", "Ukendt Hold"),
            "team_id": str(row.get("contestantId", "")),
            "value": round(float(row[actual_column]), 2)
        })

    return {
        "metric_name": display_metric,
        "suffix_type": display_suffix,
        "league_name": str(random_league),
        "players": players_list
    }

@app.get("/api/stats-summary")
def get_stats_summary():
    """Returnerer live-optællinger af datasættet (ligaer, spillere og metrics)"""
    global GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        return {
            "leagues": 25,
            "players": 0,
            "metrics": 0
        }

    # 1. Antal spillere er lig med det samlede antal rækker i din samlede dataframe
    total_players = len(GLOBAL_DATASET)

    # 2. Find antal unikke metrics, der slutter på '_Total' i filerne
    total_metrics = len([col for col in GLOBAL_DATASET.columns if col.endswith('_Total')])

    # Hvis der af en eller anden grund ikke er indlæst kolonner endnu, laver vi en fallback 
    # baseret på dine 9 grundlæggende metrics fra karrusellen.
    if total_metrics == 0:
        total_metrics = 9

    return {
        "leagues": 25,  # Statisk sat til 25 som ønsket
        "players": total_players,
        "metrics": total_metrics
    }


# Vi kobler dine fane-routers på API-strukturen bagefter
from routers.pizza import router as pizza_router
from routers.stats import router as stats_router
from routers.radar import router as radar_router
from routers.scatter import router as scatter_router
from routers.table import router as table_router
from routers.filters import router as filters_router
from routers.similarity import router as similarity_router
from routers.ranking import router as ranking_router
from routers.matchreport import router as matchreport_router
from routers.eventdata import router as eventdata_router

app.include_router(pizza_router)
app.include_router(stats_router)
app.include_router(radar_router)
app.include_router(scatter_router)
app.include_router(table_router)
app.include_router(filters_router)
app.include_router(similarity_router)
app.include_router(ranking_router)
app.include_router(matchreport_router)
app.include_router(eventdata_router)

# FRONTEND-STI: Går ét niveau op fra 'backend' og ind i 'frontend'
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

@app.get("/")
def read_root():
    """Serverer din rigtige index.html direkte når du besøger http://127.0.0.1:8000"""
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"status": "ONLINE", "msg": f"FastAPI kører, men kunne ikke finde index.html i: {FRONTEND_DIR}"}

# MONTERING AF STATISKE FILER (Billeder, logoer osv. fra backend/static)
STATIC_DIR = os.path.join(DATA_DIR, "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
else:
    print(f"ADVARSEL: Static-mappen blev ikke fundet på stien: {STATIC_DIR}")

# MONTERING AF FRONTEND-FILER: Sørger for at browseren kan finde style.css, global.js osv.
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR), name="frontend")
else:
    print(f"ADVARSEL: Frontend-mappen blev ikke fundet på stien: {FRONTEND_DIR}")

# HER INDSÆTTER DU KODEN:
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)
