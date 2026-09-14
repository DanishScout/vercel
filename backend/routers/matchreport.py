# ==========================================================================
# PER 90 - MATCHREPORT.PY (API ROUTER TIL FOTMOB MATCH SCRAPER MOTOR)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import requests
import json
import base64
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
from io import BytesIO            # <--- TILFØJET: Til Pillow billedhåndtering
from PIL import Image, ImageDraw  # <--- TILFØJET: Til Streamlit cirkelmaskering
from typing import Dict, Any

router = APIRouter(prefix="/api", tags=["matchreport"])

@router.get("/fetch-match")
def get_match_report_data(
    url: str = Query(..., description="Indsæt FotMob kamp-URL (f.eks. https://fotmob.com...)")
):
    if not url.strip() or "fotmob.com" not in url:
        raise HTTPException(status_code=400, detail="Ugyldig URL. Indtast venligst en gyldig FotMob kamp-URL.")

    try:
        # 1. FETCH PAGE CONTENT (MED USER-AGENT FOR AT UNDGÅ BLOKERING)
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Kunne ikke hente kampsiden fra FotMob.")

        # 2. PARSE __NEXT_DATA__ JSON FRA SOUPE
        soup = BeautifulSoup(response.text, "html.parser")
        script_tag = soup.find("script", id="__NEXT_DATA__")
        if not script_tag:
            raise HTTPException(status_code=404, detail="Kunne ikke finde kampdata i mediestrømmen (__NEXT_DATA__).")
        
        json_data = json.loads(script_tag.string)
        match_data = json_data.get("props", {}).get("pageProps", {})

        # ------------------------------------------------------------------
        # DATABASE 1: MATCH INFO & COLORS
        # ------------------------------------------------------------------
        general = match_data.get("general", {})
        home_team = general.get("homeTeam", {})
        away_team = general.get("awayTeam", {})
        team_colors = general.get("teamColors", {}).get("darkMode", {})
        header = match_data.get("header", {})
        
        home_id = home_team.get("id")
        away_id = away_team.get("id")

        # Hent og konverter udelukkende de to holdlogoer til Base64 med det samme
        logo_base64_dict = {}
        for t_id in [home_id, away_id]:
            if t_id:
                try:
                    logo_url = f"https://images.fotmob.com/image_resources/logo/teamlogo/{t_id}.png"
                    logo_res = requests.get(logo_url, headers=headers, timeout=5)
                    if logo_res.status_code == 200:
                        b64_encoded = base64.b64encode(logo_res.content).decode('utf-8')
                        logo_base64_dict[t_id] = f"data:image/png;base64,{b64_encoded}"
                    else:
                        logo_base64_dict[t_id] = ""
                except Exception:
                    logo_base64_dict[t_id] = ""
        
        match_info = {
            "homeId": home_id,
            "awayId": away_id,
            "homeName": home_team.get("name"),
            "awayName": away_team.get("name"),
            "homeColor": team_colors.get("home", "#3498db"),
            "awayColor": team_colors.get("away", "#e74c3c"),
            "scoreStr": header.get("status", {}).get("scoreStr", "0 - 0"),
            "leagueName": general.get("leagueName", "Ukendt Liga"),
            "leagueRound": general.get("leagueRoundName", ""),
            "homeLogoB64": logo_base64_dict.get(home_id, ""),
            "awayLogoB64": logo_base64_dict.get(away_id, "")
        }

        # ------------------------------------------------------------------
        # DATABASE 2: SHOTMAP DATA
        # ------------------------------------------------------------------
        shotmap_entries = []
        player_stats_dict = match_data.get("content", {}).get("playerStats", {})
        
        for player_id, player_info in player_stats_dict.items():
            shotmap = player_info.get("shotmap", [])
            for shot in shotmap:
                shotmap_entries.append({
                    "id": shot.get("id"),
                    "teamId": shot.get("teamId"),
                    "playerId": player_id,
                    "playerName": player_info.get("name"),
                    "eventType": shot.get("eventType"),
                    "x": shot.get("x", 0.0),
                    "y": shot.get("y", 0.0),
                    "min": shot.get("min", 0),
                    "minAdded": shot.get("minAdded"),
                    "expectedGoals": shot.get("expectedGoals", 0.0),
                    "expectedGoalsOnTarget": shot.get("expectedGoalsOnTarget", 0.0),
                    "isOwnGoal": shot.get("isOwnGoal", False)
                })

        # ------------------------------------------------------------------
        # DATABASE 3: TEAM STATS MATRIX
        # ------------------------------------------------------------------
        stats_dict = match_data.get("content", {}).get("stats", {})
        all_period_stats = stats_dict.get("Periods", {}).get("All", {}).get("stats", [])
        
        team_stats = []
        for group in all_period_stats:
            group_title = group.get("title")
            for stat in group.get("stats", []):
                values = stat.get("stats", [])
                home_val = values[0] if len(values) > 0 else "0"
                away_val = values[1] if len(values) > 1 else "0"
                
                team_stats.append({
                    "group": group_title,
                    "title": stat.get("title"),
                    "key": stat.get("key"),
                    "home": str(home_val),
                    "away": str(away_val)
                })

                # ------------------------------------------------------------------
        # DATABASE 4: GAME STATE / MOMENTUM & ATTACKING ZONES
        # ------------------------------------------------------------------
        content_obj = match_data.get("content", {})
        match_facts_obj = content_obj.get("matchFacts", {})
        
        # 1. Hent momentum (som virker i forvejen)
        momentum_data = match_facts_obj.get("momentum", {}).get("main", {}).get("data", [])
        if not momentum_data:
            # Fallback hvis momentum ligger et andet sted
            momentum_data = content_obj.get("momentum", {}).get("main", {}).get("data", [])

        momentum_list = []
        for m in momentum_data:
            momentum_list.append({
                "minute": m.get("minute", 0),
                "value": m.get("value", 0.0)
            })

        # 2. ROBUST ZONE-DETEKTION: Vi tjekker alle tænkelige steder efter 'attackingZones'
        zones_raw = None
        
        # Tjek 1: Inde i matchFacts (hvor den plejer at ligge)
        if isinstance(match_facts_obj, dict) and "attackingZones" in match_facts_obj:
            zones_raw = match_facts_obj.get("attackingZones")
        
        # Tjek 2: Direkte under content
        if not zones_raw and isinstance(content_obj, dict) and "attackingZones" in content_obj:
            zones_raw = content_obj.get("attackingZones")
            
        # Tjek 3: Direkte på rod-niveau (pageProps)
        if not zones_raw and isinstance(match_data, dict) and "attackingZones" in match_data:
            zones_raw = match_data.get("attackingZones")

        # Hvis vi overhovedet ikke fandt noget, laver vi en sikker tom struktur
        if not zones_raw:
            zones_raw = {}
        
        attacking_zones = {
            "home": zones_raw.get("home", {
                "total": {"left": 0, "center": 0, "right": 0},
                "firstHalf": {"left": 0, "center": 0, "right": 0},
                "secondHalf": {"left": 0, "center": 0, "right": 0}
            }),
            "away": zones_raw.get("away", {
                "total": {"left": 0, "center": 0, "right": 0},
                "firstHalf": {"left": 0, "center": 0, "right": 0},
                "secondHalf": {"left": 0, "center": 0, "right": 0}
            })
        }



        # ------------------------------------------------------------------
        # DATABASE 5: PLAYER PERFORMANCE RECORDS (Forbliver ultra-let)
        # ------------------------------------------------------------------
        players_list = []
        for player_id, player_info in player_stats_dict.items():
            metrics = {}
            for stat_group in player_info.get("stats", []):
                for m_title, m_info in stat_group.get("stats", {}).items():
                    metrics[m_title] = m_info.get("stat", {}).get("value", 0.0)
            
            players_list.append({
                "playerId": int(player_id),
                "playerName": player_info.get("name"),
                "teamId": player_info.get("teamId"),
                "teamName": player_info.get("teamName"),
                "stats": metrics
            })

        
        return {
            "status": "SUCCESS",
            "match_info": match_info,
            "shotmap": shotmap_entries,
            "team_stats": team_stats,
            "momentum": momentum_list,
            "attacking_zones": attacking_zones,  # <--- TILFØJET HER!
            "players": players_list
        }


    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fejl under generering af kamprapport-feed: {str(e)}")

# ==========================================================================
# NYT ENDPOINT: HENTER OG CIRKELMASKERER ÉT ENKELT SPILLERBILLEDE ON-DEMAND
# ==========================================================================
@router.get("/player-image")
def get_player_image_b64(
    player_id: int = Query(..., description="ID på spilleren, der skal hentes")
):
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        url = f"https://images.fotmob.com/image_resources/playerimages/{player_id}.png"
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code != 200:
            return {"player_img_b64": ""}
            
        # --- DIN PRÆCISE STREAMLIT-LOGIK: Pillow-behandling og Base64-konvertering ---
        im = Image.open(BytesIO(response.content)).convert("RGBA")
        im = im.resize((300, 300), Image.Resampling.LANCZOS)
        
        # Opretter den grå baggrund (70, 70, 70, 255)
        bg = Image.new('RGBA', im.size, (70, 70, 70, 255))
        bg.paste(im, (0, 0), im)
        
        # Opretter den cirkulære maske
        mask = Image.new('L', im.size, 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, im.size[0], im.size[1]), fill=255)
        bg.putalpha(mask)
        
        # Save til Base64 string
        buffered_p = BytesIO()
        bg.save(buffered_p, format="PNG")
        player_img_b64 = f"data:image/png;base64,{base64.b64encode(buffered_p.getvalue()).decode('utf-8')}"
        
        return {"player_img_b64": player_img_b64}
        
    except Exception:
        return {"player_img_b64": ""}
