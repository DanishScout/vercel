from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pandas as pd
import os
import requests
import base64

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
        print(f"LOG: Datamotor klar! Samlet database indeholder {len(GLOBAL_DATASET)} aktive spillere.")
    else:
        print(f"KRITISK ADVARSEL: Ingen CSV-filer fundet under opstart! Tjekkede sti: {DATA_DIR}")

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

# Vi kobler dine tre fane-routers på API-strukturen bagefter
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

# MONTERING AF FRONTEND-FILER: Sørger for at browseren kan finde style.css, global.js osv.
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR), name="frontend")
else:
    print(f"ADVARSEL: Frontend-mappen blev ikke fundet på stien: {FRONTEND_DIR}")