# ==========================================================================
# PER 90 - EVENTDATA.PY (ULTRA-SIKKER SCRAPERAPI MOTOR PÅ GOOGLE CLOUD)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import requests
import json
import re
import base64
from io import BytesIO
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["eventdata"])

XT_MATRIX = [
    [0.00638303,0.00779616,0.00844854,0.00977659,0.01126267,0.01248344,0.01473596,0.0174506,0.02122129,0.02756312,0.03485072,0.0379259],
    [0.00750072,0.00878589,0.00942382,0.0105949,0.01214719,0.0138454,0.01611813,0.01870347,0.02401521,0.02953272,0.04066992,0.04647721],
    [0.0088799, 0.00977745,0.01001304,0.01110462,0.01269174,0.01429128,0.01685596,0.01935132,0.0241224, 0.02855202,0.05491138,0.06442595],
    [0.00941056,0.01082722,0.01016549,0.01132376,0.01262646,0.01484598,0.01689528,0.0199707,0.02385149,0.03511326,0.10805102,0.25745362],
    [0.00941056,0.01082722,0.01016549,0.01132376,0.01262646,0.01484598,0.01689528,0.0199707,0.02385149,0.03511326,0.10805102,0.25745362],
    [0.0088799, 0.00977745,0.01001304,0.01110462,0.01269174,0.01429128,0.01685596,0.01935132,0.0241224, 0.02855202,0.05491138,0.06442595],
    [0.00750072,0.00878589,0.00942382,0.0105949,0.01214719,0.0138454,0.01611813,0.01870347,0.02401521,0.02953272,0.04066992,0.04647721],
    [0.00638303,0.00779616,0.00844854,0.00977659,0.01126267,0.01248344,0.01473596,0.0174506,0.02122129,0.02756312,0.03485072,0.0379259]
]

def lookup_xt(x: float, y: float) -> float:
    row_idx = int((y / 100) * 8) if y < 100 else 7
    col_idx = int((x / 100) * 12) if x < 100 else 11
    return XT_MATRIX[max(0, min(7, row_idx))][max(0, min(11, col_idx))]

def get_team_logo_base64(team_id: int) -> str:
    url = f"https://cloudfront.net{team_id}.png"
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code == 200:
            encoded = base64.b64encode(res.content).decode("utf-8")
            return f"data:image/png;base64,{encoded}"
    except Exception:
        pass
    return url

@router.get("/fetch-events")
def get_whoscored_event_data(url: str = Query(...)):
    if not url.strip() or "whoscored.com" not in url:
        raise HTTPException(status_code=400, detail="Ugyldig URL. Indtast venligst en gyldig WhoScored URL.")

    try:
        # 🔑 Din personlige ScraperAPI-nøgle, som snyder WhoScoreds Cloudflare-mur lynhurtigt
        API_KEY = "17cda6871c9f06a403e1cf058d2a591e"
        
        # 🌐 Vi tvinger ScraperAPI til at køre fuld JavaScript-rendering (&render=true) på deres private IP-netværk
        proxy_url = f"http://scraperapi.com?api_key={API_KEY}&url={url}&render=true"
        
        # ⏱️ Da ScraperAPI skal åbne siden og lade JavaScript indlæse udefra, sætter vi timeout højt (40 sekunder)
        response = requests.get(proxy_url, timeout=40)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"ScraperAPI fejlede med status: {response.status_code}")

        html_text = response.text

        # Din originale og ufejlbarlige Regex-logik og databehandling fortsætter herfra (100% uændret):
        match_data_match = re.search(r'matchCentreData\s*:\s*({.+?})\s*,\s*\n', html_text)
        if not match_data_match:
            match_data_match = re.search(r'var\s+matchCentreData\s*=\s*({.+?});', html_text)
        if not match_data_match:
            raise HTTPException(status_code=404, detail="Kunne ikke lokalisere kampdata (matchCentreData) i den hentede HTML.")

        match_centre_data = json.loads(match_data_match.group(1))

        # Metadata extraction
        home = match_centre_data.get("home", {})
        away = match_centre_data.get("away", {})
        home_id = home.get("teamId")
        away_id = away.get("teamId")

        home_logo_data = get_team_logo_base64(home_id)
        away_logo_data = get_team_logo_base64(away_id)

        match_info = {
            "homeId": home_id,
            "awayId": away_id,
            "homeName": home.get("name"),
            "awayName": away.get("name"),
            "homeColor": "#00F0FF",
            "awayColor": "#FF0055",
            "homeLogo": home_logo_data,   
            "awayLogo": away_logo_data,   
            "scoreStr": f"{home.get('scores', {}).get('fullTime', 0)} - {away.get('scores', {}).get('fullTime', 0)}"
        }

        raw_events = match_centre_data.get("events", [])
        sub_home_min = 90
        sub_away_min = 90

        for ev in raw_events:
            if ev.get("type", {}).get("displayName") == "SubstitutionOff":
                m = ev.get("minute", 90)
                if ev.get("teamId") == home_id:
                    sub_home_min = min(sub_home_min, m)
                else:
                    sub_away_min = min(sub_away_min, m)

        match_info["homeFirstSubMin"] = sub_home_min
        match_info["awayFirstSubMin"] = sub_away_min

        players_map = {}
        for team in ["home", "away"]:
            for p in match_centre_data.get(team, {}).get("players", []):
                players_map[str(p.get("playerId"))] = {
                    "name": p.get("name"),
                    "shirtNo": p.get("shirtNo"),
                    "position": p.get("position", "Sub"),
                    "isFirstEleven": bool(p.get("isFirstEleven", False))
                }

        processed_events = []
        for ev in raw_events:
            if "x" not in ev or "y" not in ev:
                continue

            ev_type = ev.get("type", {}).get("displayName", "Unknown")
            is_success = bool(ev.get("outcomeType", {}).get("value", 1) == 1)
            is_touch = bool(ev.get("isTouch", False))

            end_x, end_y = None, None
            is_set_piece = False
            for q in ev.get("qualifiers", []):
                q_name = q.get("type", {}).get("displayName")
                if q_name == "PassEndX": end_x = float(q.get("value", 0.0))
                elif q_name == "PassEndY": end_y = float(q.get("value", 0.0))
                elif q_name in ['CornerTaken', 'FreekickTaken', 'ThrowIn', 'GoalKick']:
                    is_set_piece = True

            xt_diff = 0.0
            if ev_type == "Pass" and is_success and not is_set_piece and end_x is not None and end_y is not None:
                start_xt = lookup_xt(ev.get("x"), ev.get("y"))
                end_xt = lookup_xt(end_x, end_y)
                xt_diff = max(0.0, end_xt - start_xt)

            processed_events.append({
                "minute": ev.get("minute", 0),
                "teamId": ev.get("teamId"),
                "playerId": str(ev.get("playerId", "")),
                "type": ev_type,
                "success": is_success,
                "isTouch": is_touch,
                "x": float(ev.get("x", 0.0)),
                "y": float(ev.get("y", 0.0)),
                "endX": end_x,
                "endY": end_y,
                "isSetPiece": is_set_piece,
                "xtDiff": xt_diff
            })

        return {
            "status": "SUCCESS",
            "match_info": match_info,
            "players_map": players_map,
            "events": processed_events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fejl under indlæsning: {str(e)}")
