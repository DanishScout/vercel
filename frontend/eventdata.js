// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 1 AF 7 (MASTER STATES & INTEGRERET SCALE-CSS)
// ==========================================================================

let EV_GLOBAL_DATA = null;       // Indeholder det rå JSON-objekt fra eventdata.py
let EV_ACTIVE_TAB = "passmap";   // Aktive diagramfane: 'passmap', 'player', 'team', 'xt', 'zonal'
let EV_SELECTED_PLAYER = "";     // Den valgte spiller under Player Events
let EV_SELECTED_TEAM = "";       // Det valgte hold under Team/xT/Zonal visninger

// Mappings-ordbog til filter-tjekbokse i dine hændelsestabs
const EV_METRIC_CONFIG = ["Touch", "Opp. Box Touch", "Goal", "Shot", "Assist", "Shot Assist", "Regular Pass", "Pass into Final ⅓", "Cross", "Long Pass", "Won Take-on", "Defensive Action"];
let EV_SELECTED_METRICS = ["Touch"]; // Standardvalg

// 🎯 UNIK ISOLERET SELEKTOR: Forhindrer sammenstød i det globale navnerum
const getEvEl = id => document.getElementById(id);

// ==========================================================================
// KOPIERET 1:1 FRA MATCHREPORT: UFEJLBARLIG SCALE CSS & AUTOMATISK AUTOFIT MOTOR
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('ev-core-styles')) return;
    const style = document.createElement('style');
    style.id = 'ev-core-styles';
    style.innerHTML = `
        .ev-main-container { width: 100%; max-width: 820px; margin: 0 auto; padding: 0 15px; box-sizing: border-box; font-family: 'Gabarito', sans-serif; color: #e5e7eb; }
        
        /* 🔥 1:1 HENTET FRA MATCHREPORT: Forhindrer kortet i at skubbe sig ud af skærmen eller blive cuttet */
        .ev-scale-viewport { width: 100%; overflow: hidden; position: relative; display: block; }
        
        .mr-search-box { background: linear-gradient(180deg, #0f172a 0%, #020617 100%); border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; padding: 20px; margin-bottom: 20px; display: flex; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); box-sizing: border-box; }
        .mr-input-field { flex-grow: 1; background: #07030c; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px 16px; color: #fff; font-size: 14px; outline: none; }
        .mr-btn { background: #a855f7; color: #000000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        .mr-tabs-nav { display: flex; overflow-x: auto; gap: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 10px; padding: 4px; margin-bottom: 25px; }
        .mr-tab-item { padding: 10px 18px; font-size: 12.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; border-radius: 7px; cursor: pointer; border: none; background: transparent; transition: all 0.15s; }
        .mr-tab-item.active { color: #fff; background: #1e293b; }
        
        /* 🔥 FAST 1:1 LOOK: Kortet er ALTID præcis 680px under motorhjelmen. transform-origin sættes til top left */
        .ev-capture-card { position: relative; width: 680px; min-width: 680px; max-width: 680px; padding: 35px 25px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); background: radial-gradient(circle at top, #111A2E 0%, #070A13 100%); display: flex; flex-direction: column; align-items: center; box-shadow: 0 25px 60px rgba(0,0,0,0.4); box-sizing: border-box; transform-origin: top left; margin: 0; }
        
        /* Justerede baneproportioner baseret på din originale pitch-box */
        .ev-pitch-box { width: 100%; max-width: 620px; aspect-ratio: 105 / 68; position: relative; overflow: visible; background: transparent; margin: 0 auto; }
        .ev-pitch-box svg { width: 100%; height: 100%; overflow: visible; display: block; }
        .ev-pitch-line { stroke: rgba(255, 255, 255, 0.22); stroke-width: 1.5; fill: none; }
        .ev-markers-layer { position: absolute; inset: 0; pointer-events: none; z-index: 10; }
        
        /* Legend styling */
        .ev-legend-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 20px; width: 100%; margin-top: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #fff; }
        .ev-legend-item { display: flex; align-items: center; gap: 6px; }
        .ev-legend-marker { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
        
        @media (max-width: 600px) {
            .mr-search-box { flex-direction: column; padding: 15px; gap: 10px; }
            .mr-btn { width: 100%; justify-content: center; }
        }
    `;
    document.head.appendChild(style);

    // 🔥 AUTOMATISK JAVASCRIPT AUTOFIT MOTOR:
    // Måler den reelle skærmplads og krymper både kortet og containerens højde/bredde proportionalt live!
    const applyEventDataScale = () => {
        const cards = document.querySelectorAll('.ev-capture-card');
        cards.forEach(card => {
            const container = card.parentElement;
            if (!container) return;
            
            // Hvis kortet ikke ligger i en viewport wrapper, opretter vi den automatisk live
            if (!container.classList.contains('ev-scale-viewport')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'ev-scale-viewport';
                container.insertBefore(wrapper, card);
                wrapper.appendChild(card);
                return;
            }
            
            const viewportWidth = container.getBoundingClientRect().width;
            const targetWidth = 680; // Matcher kortets faste bredde
            
            if (viewportWidth < targetWidth && viewportWidth > 0) {
                const scaleFactor = viewportWidth / targetWidth;
                
                // Udregner og tvinger det perfekte pc-look ned i præcis mobil-bredde
                card.style.transform = `scale(${scaleFactor})`;
                
                // Korrigerer containerens højde, så der ikke opstår et enormt tomt felt under kortet
                const calculatedHeight = card.offsetHeight * scaleFactor;
                container.style.height = `${calculatedHeight}px`;
            } else {
                card.style.transform = 'none';
                container.style.height = 'auto';
            }
        });
    };

    // Trigger skaleringen ved resize, dom-ændringer og ved load
    window.addEventListener('resize', applyEventDataScale);
    const observer = new MutationObserver(applyEventDataScale);
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(applyEventDataScale, 150);
});
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 2 AF 7 (HTML-SKAL, DOWNLOAD-SANDBOX & FILTERPANEL)
// ==========================================================================

function initEventDataView(container) {
    container.innerHTML = `
        <div class="ev-main-container" style="padding-top: 10px;">
            <!-- SEKTIONS-HEADER DER MATCHER MATCHREPORT -->
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-location-crosshairs" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Event Data</span>
            </div>

            <!-- URL INPUT -->
            <div class="mr-search-box">
                <input type="text" id="ev-url-input" class="mr-input-field" placeholder="Indsæt WhoScored kamp-URL (f.eks. https://whoscored.com...)" value="https://www.whoscored.com/matches/2029109/live/europe-champions-league-2026-2027-bayern-munich-bodoe-glimt">
                <button class="mr-btn" onclick="fetchWhoScoredEventFeed()">
                    Load Data <i class="fa-solid fa-circle-notch fa-spin" id="ev-spinner" style="display:none; margin-left: 6px;"></i>
                </button>
            </div>

            <!-- FANE BJÆLKE -->
            <div class="mr-tabs-nav" id="ev-tabs-bar" style="display:none;">
                <button class="mr-tab-item active" id="ev-tab-passmap" onclick="switchEventTab('passmap')">Passmap</button>
                <button class="mr-tab-item" id="ev-tab-player" onclick="switchEventTab('player')">Player Events</button>
                <button class="mr-tab-item" id="ev-tab-team" onclick="switchEventTab('team')">Team Events</button>
                <button class="mr-tab-item" id="ev-tab-xt" onclick="switchEventTab('xt')">xT via Passes</button>
                <button class="mr-tab-item" id="ev-tab-zonal" onclick="switchEventTab('zonal')">Zonal Control</button>
            </div>

            <!-- FILTER PANEL TIL METRIKKER -->
            <div id="ev-metric-filter-panel" style="display:none; flex-wrap:wrap; gap:10px; margin-bottom:25px; justify-content:center;"></div>

            <!-- CENTRAL TEGNE-FLADE MED SCALE VIEWPORT INTEGRATION -->
            <div class="ev-scale-viewport" id="ev-display-viewport" style="display:none;">
                <div class="ev-capture-card" id="ev-capture-target-area"></div>
            </div>
        </div>
    `;
    buildWhoScoredMetricFiltersHTML();
}

function buildWhoScoredMetricFiltersHTML() {
    const p = getEvEl("ev-metric-filter-panel"); if (!p) return;
    p.innerHTML = EV_METRIC_CONFIG.map(m => {
        const checked = EV_SELECTED_METRICS.includes(m);
        return `<label class="table-drawer-checkbox-label" style="opacity:${checked?1:0.4}; background:#0f172a; padding:6px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05); cursor:pointer; font-size:12px; font-weight:700;"><input type="checkbox" value="${m}" ${checked?"checked":""} onchange="handleEvMetricToggle(this)" style="accent-color:#00F0FF; margin-right:6px;">${m}</label>`;
    }).join('');
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 2: UNIVERSAL DOWNLOAD-SANDBOX (RETTET TIL ALLE FANER)
// ==========================================================================
function triggerEventDataDownload(filename, elementId) {
    const originalEl = getEvEl(elementId);
    if (!originalEl) return;

    const hiddenContainer = document.createElement("div");
    Object.assign(hiddenContainer.style, {
        position: "absolute", left: "-9999px", top: "-9999px",
        width: "820px", minWidth: "820px", maxWidth: "820px",
        height: "auto", overflow: "visible", boxSizing: "border-box"
    });

    const clone = originalEl.cloneNode(true);
    clone.id = `${elementId}-download-clone`;
    
    Object.assign(clone.style, {
        width: "820px", minWidth: "820px", maxWidth: "820px",
        height: "auto", minHeight: "auto", maxHeight: "none",
        background: "#0B1220", boxSizing: "border-box",
        display: "flex", opacity: "1", transform: "none"
    });

    // 🎯 SMART FILTER-MOTOR: Finder og fjerner interaktive elementer baseret på fanen
    
    // 1) Fjern spiller-dropdown (Figur 2)
    const dropdown = clone.querySelector(".ev-interactive-select");
    if (dropdown) {
        dropdown.remove(); 
    }
    
    // 2) Fjern hold-vælger knapper (Figur 3 og Figur 4) hvis de ligger øverst inde i kortet
    // Vi leder efter en .ev-interactive-buttons som IKKE indeholder download-knappen
    const topTeamButtons = clone.querySelector(".ev-interactive-buttons:not(:last-child)");
    if (topTeamButtons) {
        topTeamButtons.remove();
    }

    // 3) Fjern den reelle download-knap i bunden (Figur 2, 3, 4 og 5)
    // Vi finder den absolut sidste knap-container og fjerner den, så billedet bliver helt rent
    const allButtonContainers = clone.querySelectorAll(".ev-interactive-buttons");
    if (allButtonContainers.length > 0) {
        const downloadButtonContainer = allButtonContainers[allButtonContainers.length - 1];
        if (downloadButtonContainer) {
            downloadButtonContainer.remove();
        }
    }


    const downloadFooter = clone.querySelector("div[style*='justify-content:space-between']");
    if (downloadFooter) {
        downloadFooter.style.maxWidth = "620px";
        downloadFooter.style.margin = "20px auto 0 auto";
    }

    hiddenContainer.appendChild(clone);
    document.body.appendChild(hiddenContainer);

    html2canvas(clone, { 
        scale: 3, 
        backgroundColor: "#0B1220", 
        useCORS: true,
        logging: false
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        document.body.removeChild(hiddenContainer);
    }).catch(err => {
        console.error("Download fejlede:", err);
        if (document.body.contains(hiddenContainer)) document.body.removeChild(hiddenContainer);
    });
}


// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 3 AF 7 (API-INTEGRATION & GENEREL VISUEL HEADER)
// ==========================================================================

async function fetchWhoScoredEventFeed() {
    const urlInput = getEvEl("ev-url-input"); const spinner = getEvEl("ev-spinner");
    if (!urlInput || !urlInput.value.trim()) return;

    spinner.style.display = "inline-block";
    try {
        const res = await fetch(`${API_BASE_URL}/api/fetch-events?url=${encodeURIComponent(urlInput.value.trim())}`);
        if (res.ok) {
            EV_GLOBAL_DATA = await res.json();
            EV_SELECTED_TEAM = EV_GLOBAL_DATA.match_info.homeId;
            
            const firstPId = Object.keys(EV_GLOBAL_DATA.players_map)[0];
            EV_SELECTED_PLAYER = firstPId || "";

            getEvEl("ev-tabs-bar").style.display = "flex";
            getEvEl("ev-display-viewport").style.display = "block";
            switchEventTab(EV_ACTIVE_TAB);
        } else {
            const err = await res.json(); alert(`Fejl: ${err.detail}`);
        }
    } catch (e) { console.error(e); alert("Fejl under indlæsning af WhoScored hændelser."); }
    finally { spinner.style.display = "none"; }
}

function switchEventTab(tabId) {
    EV_ACTIVE_TAB = tabId;
    document.querySelectorAll('.mr-tab-item').forEach(b => b.classList.remove('active'));
    getEvEl(`ev-tab-${tabId}`).classList.add('active');

    getEvEl("ev-metric-filter-panel").style.display = (tabId === "player" || tabId === "team") ? "flex" : "none";
    renderActiveEventVisualization();
}

function handleEvMetricToggle(cb) {
    if (cb.checked) { if (!EV_SELECTED_METRICS.includes(cb.value)) EV_SELECTED_METRICS.push(cb.value); }
    else { EV_SELECTED_METRICS = EV_SELECTED_METRICS.filter(m => m !== cb.value); }
    buildWhoScoredMetricFiltersHTML();
    renderActiveEventVisualization();
}

function renderActiveEventVisualization() {
    if (!EV_GLOBAL_DATA) return;
    if (EV_ACTIVE_TAB === "passmap") buildWhoScoredFig1Passmap();
    else if (EV_ACTIVE_TAB === "player") buildWhoScoredFig2PlayerEvents();
    else if (EV_ACTIVE_TAB === "team") buildWhoScoredFig3TeamEvents();
    else if (EV_ACTIVE_TAB === "xt") buildWhoScoredFig4XTHeatmap();
    else if (EV_ACTIVE_TAB === "zonal") buildWhoScoredFig5ZonalControl();
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - OPDATERET HEADER MED STORE LOGOER OG RESTE-FARVEKANTER
// ==========================================================================

function generateWhoScoredHeaderHTML(titleText) {
    const info = EV_GLOBAL_DATA.match_info;
    const scores = (info.scoreStr || "0-0").split('-');
    const homeGoals = scores[0] ? scores[0].trim() : "0";
    const awayGoals = scores[1] ? scores[1].trim() : "0";

    // Standard fallback-farver hvis backend mangler dem
    const homeColor = info.homeColor || "#00F0FF"; 
    const awayColor = info.awayColor || "#FF0055";

    return `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%; padding:10px 10px 15px 10px; margin-bottom:20px; text-align:center; font-family: 'Gabarito', sans-serif;">
            
            <!-- CENTRAL SCOREBOARD-BLOK -->
            <div style="display:flex; align-items:center; justify-content:center; gap:24px; width:100%;">
                
                <!-- VENSTRE: Hjemmeholdets store logo med farvet cirkel-kant (Ingen tekst) -->
                <div style="width:58px; height:58px; border-radius:50%; background:rgba(255,255,255,0.02); border: 2.5px solid ${homeColor}; display:flex; align-items:center; justify-content:center; padding:6px; box-shadow: 0 0 15px rgba(${hexToRgb(homeColor)}, 0.25); flex-shrink:0;">
                    <img src="${info.homeLogo}" style="max-width:100%; max-height:100%; object-fit:contain;">
                </div>
                
                <!-- MIDTEN: Måltavle score -->
                <div style="font-size:32px; font-weight:900; color:#fff; letter-spacing:1.5px; padding:0 10px; font-variant-numeric: tabular-nums;">
                    ${homeGoals} - ${awayGoals}
                </div>
                
                <!-- HØJRE: Udeholdets store logo med farvet cirkel-kant (Ingen tekst) -->
                <div style="width:58px; height:58px; border-radius:50%; background:rgba(255,255,255,0.02); border: 2.5px solid ${awayColor}; display:flex; align-items:center; justify-content:center; padding:6px; box-shadow: 0 0 15px rgba(${hexToRgb(awayColor)}, 0.25); flex-shrink:0;">
                    <img src="${info.awayLogo}" style="max-width:100%; max-height:100%; object-fit:contain;">
                </div>
                
            </div>
            
            <!-- SUBTITLE & TELEMETRI INFO -->
            <div style="font-size:11px; font-weight:800; color:rgba(255,255,255,0.3); letter-spacing:1.5px; text-transform:uppercase; margin-top:14px;">
                ${titleText}
            </div>
        </div>
    `;
}

// 🎯 HJÆLPEFUNKTION: Omdanner hex-farver (#ff0000) til RGB, så vi kan lave en flot, blød skygge (box-shadow) under logoerne
function hexToRgb(hex) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    let num = parseInt(c, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}


function getMetricColorAndProps(metric) {
    const conf = {
        'Touch': { c: 'orange', m: 'circle' }, 'Opp. Box Touch': { c: '#00f0ff', m: 'circle' },
        'Goal': { c: '#47B745', m: 'star' }, 'Shot': { c: '#3498db', m: 'cross' },
        'Assist': { c: '#47B745', m: 'line' }, 'Shot Assist': { c: '#3498db', m: 'line' },
        'Regular Pass': { c: '#64748b', m: 'line' }, 'Pass into Final ⅓': { c: '#a855f7', m: 'line' },
        'Cross': { c: '#ff0055', m: 'line' }, 'Long Pass': { c: '#f59e0b', m: 'line' },
        'Won Take-on': { c: '#00ff78', m: 'square' }, 'Defensive Action': { c: '#ff4d4d', m: 'square' }
    };
    return conf[metric] || { c: '#fff', m: 'circle' };
}
function buildWhoScoredFig1Passmap() {
    const container = getEvEl("ev-capture-target-area");
    if (!EV_GLOBAL_DATA) return;

    const info = EV_GLOBAL_DATA.match_info;
    const subMinHome = info.homeFirstSubMin || 90;
    const subMinAway = info.awayFirstSubMin || 90;
    
    let homePasses = EV_GLOBAL_DATA.events.filter(e => e.teamId == info.homeId && e.type === "Pass" && e.success && !e.isSetPiece && e.minute < subMinHome);
    let homePlayerStats = {}, homeNetworkPairs = {};
    processPassmapData(homePasses, homePlayerStats, homeNetworkPairs);

    let awayPasses = EV_GLOBAL_DATA.events.filter(e => e.teamId == info.awayId && e.type === "Pass" && e.success && !e.isSetPiece && e.minute < subMinAway);
    let awayPlayerStats = {}, awayNetworkPairs = {};
    processPassmapData(awayPasses, awayPlayerStats, awayNetworkPairs);

    const scores = (info.scoreStr || "0-0").split('-');
    const homeGoals = scores[0] ? scores[0].trim() : "0";
    const awayGoals = scores[1] ? scores[1].trim() : "0";
    const homeColor = info.homeColor || "#00F0FF"; 
    const awayColor = info.awayColor || "#FF0055";

    container.innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; align-items:stretch; font-family: 'Gabarito', sans-serif;">
            
            <!-- 🎯 NYT STRØMLINET HEADER-LAYOUT TIL FIG 1 -->
            <div style="display:flex; flex-direction:column; align-items:center; width:100%; padding:10px 10px 15px 10px; margin-bottom:20px; text-align:center;">
                
                <!-- 1) Logoer og score placeret allerøverst -->
                <div style="display:flex; align-items:center; justify-content:center; gap:20px; width:100%;">
                    
                    <!-- Hjemmehold Logo -->
                    <div style="width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,0.02); border: 2px solid ${homeColor}; display:flex; align-items:center; justify-content:center; padding:5px; box-shadow: 0 0 12px rgba(${hexToRgb(homeColor)}, 0.2); flex-shrink:0;">
                        <img src="${info.homeLogo}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                    
                    <!-- Score -->
                    <div style="font-size:24px; font-weight:900; color:#fff; letter-spacing:1px; padding:0 4px; font-variant-numeric: tabular-nums;">
                        ${homeGoals} - ${awayGoals}
                    </div>
                    
                    <!-- Udehold Logo -->
                    <div style="width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,0.02); border: 2px solid ${awayColor}; display:flex; align-items:center; justify-content:center; padding:5px; box-shadow: 0 0 12px rgba(${hexToRgb(awayColor)}, 0.2); flex-shrink:0;">
                        <img src="${info.awayLogo}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                </div>

                <!-- 2) Hovedtitlen rykket under logoer, gjort stor og med god synlighed -->
                <div style="font-size:16px; font-weight:900; color:rgba(255,255,255,0.85); letter-spacing:1.5px; text-transform:uppercase; margin-top:20px; margin-bottom:4px;">
                    TEAM PASSMAPS BEFORE 1ST SUB
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; margin-top: 5px; box-sizing: border-box;">
                <!-- HOME TEAM -->
                <div style="display: flex; flex-direction: column; align-items: center; min-width:0;">
                    <div style="font-size: 11px; font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <img src="${info.homeLogo}" style="height: 14px; width: auto; object-fit: contain;">
                        ${info.homeName} (1'-${subMinHome}')
                    </div>
                    <div class="ev-pitch-box" style="width: 100%; aspect-ratio: 68 / 105; position: relative;">
                        ${generateVerticalPitchSVG(homePlayerStats, homeNetworkPairs, info.homeColor, true)}
                    </div>
                </div>

                <!-- AWAY TEAM -->
                <div style="display: flex; flex-direction: column; align-items: center; min-width:0;">
                    <div style="font-size: 11px; font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <img src="${info.awayLogo}" style="height: 14px; width: auto; object-fit: contain;">
                        ${info.awayName} (1'-${subMinAway}')
                    </div>
                    <div class="ev-pitch-box" style="width: 100%; aspect-ratio: 68 / 105; position: relative;">
                        ${generateVerticalPitchSVG(awayPlayerStats, awayNetworkPairs, info.awayColor, false)}
                    </div>
                </div>
            </div>

            <!-- FOOTER-LEGENDE -->
            <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-top:30px; padding:15px 5px 0 5px; border-top:1px solid rgba(255,255,255,0.05); color:rgba(255,255,255,0.5); font-size:10px; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; box-sizing:border-box;">
                <div style="text-align: left; line-height: 1.4; color: rgba(255,255,255,0.5);">
                    Via per-90.streamlit.app
                </div>
                <div style="display:flex; align-items:center; gap:12px; justify-content: center; flex-grow: 1;">
                    <span>Low xT</span>
                    <div style="width:10px; height:10px; border:1.5px solid rgba(255,255,255,0.4); border-radius:50%; background:transparent;"></div>
                    <div style="width:16px; height:16px; border:1.5px solid rgba(255,255,255,0.4); border-radius:50%; background:transparent;"></div>
                    <div style="width:22px; height:22px; border:1.5px solid rgba(255,255,255,0.4); border-radius:50%; background:transparent;"></div>
                    <span>High xT</span>
                </div>
                <div style="text-align: right; line-height: 1.4; color: rgba(255,255,255,0.5);">
                    Circles are avg. locations<br>Lines mapped by frequency
                </div>
            </div>
        </div>
        <div class="ev-interactive-buttons" style="text-align:center; margin-top:25px; width:100%;">
            <button class="mr-btn" style="margin:0 auto;" onclick="triggerEventDataDownload('whoscored_passmap', 'ev-capture-target-area')">Download as PNG</button>
        </div>
    `;
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - FIG 1 (DEL 2 AF 2: BANETEGNING & INITIAL-MOTOR)
// ==========================================================================

function generateVerticalPitchSVG(playerStats, networkPairs, teamColor, isHome) {
    let linesSVG = "";
    let nodesHTML = "";
    
    const minPassThreshold = 2; 
    let maxPairCount = Math.max(...Object.values(networkPairs), 1);

    // 🔥 TOP 3 FORBINDELSER FILTER: Sørger for, at hver spiller kun viser sine 3 mest hyppige modtagere
    let filteredPairs = {};
    let connectionsByPlayer = {};

    // Grupper alle eksisterende pasningskombinationer ud fra afsenderen (fromId)
    for (const [pairKey, count] of Object.entries(networkPairs)) {
        if (count < minPassThreshold) continue;
        const [fromId, toId] = pairKey.split("->");
        if (!connectionsByPlayer[fromId]) connectionsByPlayer[fromId] = [];
        connectionsByPlayer[fromId].push({ pairKey, count });
    }

    // Sorter forbindelserne for hver spiller efter antal pasninger og gem kun top 3
    for (const fromId in connectionsByPlayer) {
        connectionsByPlayer[fromId]
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .forEach(conn => {
                filteredPairs[conn.pairKey] = conn.count;
            });
    }

    // 1. GENERER DE FILTREREDE RETNINGSBESTEMTE, BUEDE KURVER (KUN TOP 3)
    for (const [pairKey, count] of Object.entries(filteredPairs)) {
        const [fromId, toId] = pairKey.split("->");
        const p1 = playerStats[fromId];
        const p2 = playerStats[toId];

        if (p1 && p2 && EV_GLOBAL_DATA.players_map[fromId]?.isFirstEleven && EV_GLOBAL_DATA.players_map[toId]?.isFirstEleven) {
            let x1 = 100 - (p1.ySum / p1.count);
            let x2 = 100 - (p2.ySum / p2.count);
            let y1 = 100 - (p1.xSum / p1.count);
            let y2 = 100 - (p2.xSum / p2.count);

            let weight = 0.4 + (count / maxPairCount) * 1.8;
            let opacity = 0.08 + (count / maxPairCount) * 0.62;

            let midX = (x1 + x2) / 2;
            let midY = (y1 + y2) / 2;
            let dx = x2 - x1;
            let dy = y2 - y1;
            let cx = midX - dy * 0.12;
            let cy = midY + dx * 0.12;

            linesSVG += `
                <path d="M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}" 
                      fill="none" 
                      stroke="rgba(238, 237, 224, ${opacity.toFixed(2)})" 
                      stroke-width="${weight.toFixed(2)}" 
                      stroke-linecap="round" />
            `;
        }
    }


    // 2. GENERER SPILLER-CIRKLER (MED RETTET INITIAL-LOGIK OG DYNAMISK TEKST)
    for (const [pId, p] of Object.entries(playerStats)) {
        let meta = EV_GLOBAL_DATA.players_map[pId] || { name: "Player", shirtNo: "" };
        if (!meta.isFirstEleven) continue;

        // 🎯 VARIABLER SKAL DEFINERES FØRST:
        let size = 24 + Math.min(12, p.xtSum * 45); 
        let fontSize = (size * 0.42).toFixed(1); // Skalerer skriften automatisk efter cirklens størrelse

        let avgX = p.xSum / p.count; 
        let avgY = p.ySum / p.count;
        let leftPercent = 100 - avgY;
        let topPercent = 100 - avgX;

        // 🎯 RETTET NAVNE-MOTOR: Finder forbogstavet i HVERT ord og samler dem (f.eks. "Virgil van Dijk" -> VVD)
        let initials = meta.name
            .split(' ')
            .filter(word => word.length > 0)
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 3); // Sikrer max 3 tegn så det ikke klemmer

        nodesHTML += `
            <div class="mr-shot-dot" style="left:${leftPercent}%; top:${topPercent}%; width:${size}px; height:${size}px; background: rgba(10, 15, 26, 0.85); border:2.5px solid ${teamColor}; color:#fff; font-size: ${fontSize}px; font-weight:900; line-height:${size-5}px; transform: translate(-50%, -50%); position: absolute; box-shadow: 0 4px 12px rgba(0,0,0,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 20; text-shadow: 0 1px 4px rgba(0,0,0,0.8), 0 0 2px #fff; pointer-events: auto; backdrop-filter: blur(1px);">
                ${initials}
            </div>
        `;
    }



    // 3. LODRET BANE OVERFLADE (MED RETTEDE HARMONISKE PROPORTIONER)
    return `
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block; z-index: 1;">
            <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            
            <ellipse cx="50" cy="50" rx="12.5" ry="8.5" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            
            <rect x="21.1" y="83.0" width="57.8" height="17.0" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <rect x="36.8" y="94.2" width="26.4" height="5.8" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <path d="M 40.0,83.0 A 10.0,6.5 0 0,1 60.0,83.0" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />

            <rect x="21.1" y="0.0" width="57.8" height="17.0" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <rect x="36.8" y="0.0" width="26.4" height="5.8" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <path d="M 40.0,17.0 A 10.0,6.5 0 0,0 60.0,17.0" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <g>${linesSVG}</g>
        </svg>
        
        <div class="ev-markers-layer" style="position: absolute; inset: 0; pointer-events: none; z-index: 10;">
            ${nodesHTML}
        </div>
    `;
}

function processPassmapData(passesArray, playerStats, networkPairs) {
    passesArray.forEach(p => {
        if (!playerStats[p.playerId]) playerStats[p.playerId] = { xSum: 0, ySum: 0, count: 0, xtSum: 0 };
        playerStats[p.playerId].xSum += p.x; playerStats[p.playerId].ySum += p.y;
        playerStats[p.playerId].count++; playerStats[p.playerId].xtSum += (p.xtDiff || 0);
    });
    for (let i = 0; i < passesArray.length - 1; i++) {
        const passer = passesArray[i].playerId; const receiver = passesArray[i + 1].playerId;
        if (passer && receiver && passer !== receiver) {
            const pairKey = `${passer}->${receiver}`;
            networkPairs[pairKey] = (networkPairs[pairKey] || 0) + 1;
        }
    }
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 5 AF 7 (FIG 2 & 3 – PLAYER OG TEAM INDIVIDUELLE EVENTS)
// ==========================================================================

function buildWhoScoredFig2PlayerEvents() {
    const container = getEvEl("ev-capture-target-area"); if (!EV_GLOBAL_DATA) return;
    const info = EV_GLOBAL_DATA.match_info;
    
    const pList = Object.entries(EV_GLOBAL_DATA.players_map)
        .map(([id, p]) => `<option value="${id}" ${id == EV_SELECTED_PLAYER ? 'selected' : ''}>${p.name} (${p.position})</option>`).join('');
        
    let dropdownHTML = `
        <div class="ev-interactive-select" style="margin-bottom:20px; display: flex; justify-content: center; width:100%;">
            <select class="table-drawer-select" style="width:100%; max-width:350px; background:#1e293b; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:8px 12px; border-radius:6px; font-weight:600;" onchange="EV_SELECTED_PLAYER=this.value; buildWhoScoredFig2PlayerEvents();">
                ${pList}
            </select>
        </div>
    `;
    
    let counts = {}; EV_SELECTED_METRICS.forEach(m => counts[m] = 0);
    const { markersHTML, arrowsSVG, gradientDefs } = processPlayerEventsGraphics(counts);

    let legendHTML = '<div class="ev-legend-grid" style="justify-content:flex-end; gap:8px 14px; width:auto; margin:0;">' + 
        EV_SELECTED_METRICS.map(m => `<div class="ev-legend-item" style="font-size:10px; color:#cbd5e1;"><span class="ev-legend-marker" style="background:${getMetricColorAndProps(m).c}; width:9px; height:9px;"></span>${counts[m]}x ${m}</div>`).join('') + '</div>';
    
    const playerName = EV_GLOBAL_DATA.players_map[EV_SELECTED_PLAYER]?.name.toUpperCase() || "PLAYER";

    container.innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; align-items:stretch;">
            ${dropdownHTML}
            ${generateWhoScoredHeaderHTML(`PLAYER EVENTS – ${playerName}`)}
            
            <div class="ev-pitch-box">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                <defs>${gradientDefs}</defs>
                
                <!-- Banens yderlinje og midterlinje -->
                <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                
                <!-- 🎯 RETTET MIDTERCIRKEL: Gjort til ellipse (rx < ry) for at kompensere for det liggende stræk -->
                <ellipse cx="50" cy="50" rx="8.7" ry="13.5" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <circle cx="50" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" />
                
                <!-- VENSTRE FELT (Målfelt, straffesparksfelt og den manglende bue) -->
                <rect x="0" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <rect x="0" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <!-- 🎯 TILFØJET BUE VENSTRE: Perfekt afrundet efter banens proportioner -->
                <path d="M 17,43.5 A 4.5,6.5 0 0,1 17,56.5" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                
                <!-- HØJRE FELT (Målfelt, straffesparksfelt og den manglende bue) -->
                <rect x="83" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <rect x="94.2" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <!-- 🎯 TILFØJET BUE HØJRE: Perfekt afrundet efter banens proportioner -->
                <path d="M 83,43.5 A 4.5,6.5 0 0,0 83,56.5" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                
                <g>${arrowsSVG}</g>
            </svg>
            <div class="ev-markers-layer">${markersHTML}</div>
        </div>

            
                        <!-- ULTRA-STILREN GRÅ SVG-VEKTOR-PIL I BUNDEN AF FIG 2 -->
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-top:20px; box-sizing:border-box; padding:0 5px;">
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <span style="font-size:9px; font-weight:800; text-transform:uppercase; color:rgba(255,255,255,0.35); letter-spacing:0.5px;">Attacking Direction</span>
                    
                    <!-- Låst til samme dæmpede systemfarve som i Fig 4 -->
                    <div style="width: 80px; height: 12px; display: flex; align-items: center;">
                        <svg viewBox="0 0 80 12" style="width: 100%; height: 100%; overflow: visible;">
                            <path d="M 2,6 L 72,6 M 68,2 L 74,6 L 68,10" 
                                  fill="none" 
                                  stroke="rgba(255,255,255,0.3)" 
                                  stroke-width="2.5" 
                                  stroke-linecap="round" 
                                  stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
                ${legendHTML}
            </div>



        </div>

        <div class="ev-interactive-buttons" style="display: flex; justify-content: center; margin: 25px auto 0 auto; width: 100%;">
            <button class="mr-btn" onclick="triggerEventDataDownload('${playerName.replace(/\s+/g,'_')}_events', 'ev-capture-target-area')">Download as PNG</button>
        </div>
    `;
}

function buildWhoScoredFig3TeamEvents() {
    const container = getEvEl("ev-capture-target-area"); if (!EV_GLOBAL_DATA) return;
    const info = EV_GLOBAL_DATA.match_info;
    
    let teamSelectHTML = `
        <div class="ev-interactive-buttons" style="display:flex; gap:10px; margin-bottom:20px; justify-content:center; width:100%;">
            <button class="mr-btn" style="background:${EV_SELECTED_TEAM == info.homeId ? '#00F0FF' : '#1e293b'}; color:${EV_SELECTED_TEAM == info.homeId ? '#000' : '#fff'};" onclick="EV_SELECTED_TEAM='${info.homeId}'; buildWhoScoredFig3TeamEvents();">${info.homeName}</button>
            <button class="mr-btn" style="background:${EV_SELECTED_TEAM == info.awayId ? '#FF0055' : '#1e293b'}; color:#fff;" onclick="EV_SELECTED_TEAM='${info.awayId}'; buildWhoScoredFig3TeamEvents();">${info.awayName}</button>
        </div>
    `;
    
    let counts = {}; EV_SELECTED_METRICS.forEach(m => counts[m] = 0);
    const { markersHTML, arrowsSVG, gradientDefs } = processTeamEventsGraphics(counts);

    let legendHTML = '<div class="ev-legend-grid" style="justify-content:flex-end; gap:8px 14px; width:auto; margin:0;">' + 
        EV_SELECTED_METRICS.map(m => `<div class="ev-legend-item" style="font-size:10px; color:#cbd5e1;"><span class="ev-legend-marker" style="background:${getMetricColorAndProps(m).c}; width:9px; height:9px;"></span>${counts[m]}x ${m}</div>`).join('') + '</div>';
    
    const teamName = EV_SELECTED_TEAM == info.homeId ? info.homeName.toUpperCase() : info.awayName.toUpperCase();

    container.innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; align-items:stretch;">
            ${teamSelectHTML}
            ${generateWhoScoredHeaderHTML(`TEAM EVENTS – ${teamName}`)}
            
            <div class="ev-pitch-box">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                <defs>${gradientDefs}</defs>
                
                <!-- Banens yderlinje og midterlinje -->
                <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                
                <!-- 🎯 RETTET MIDTERCIRKEL: Gjort til ellipse (rx < ry) for at kompensere for det liggende stræk -->
                <ellipse cx="50" cy="50" rx="8.7" ry="13.5" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <circle cx="50" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" />
                
                <!-- VENSTRE FELT (Målfelt, straffesparksfelt og den manglende bue) -->
                <rect x="0" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <rect x="0" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <!-- 🎯 TILFØJET BUE VENSTRE: Perfekt afrundet efter banens proportioner -->
                <path d="M 17,43.5 A 4.5,6.5 0 0,1 17,56.5" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                
                <!-- HØJRE FELT (Målfelt, straffesparksfelt og den manglende bue) -->
                <rect x="83" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <rect x="94.2" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                <!-- 🎯 TILFØJET BUE HØJRE: Perfekt afrundet efter banens proportioner -->
                <path d="M 83,43.5 A 4.5,6.5 0 0,0 83,56.5" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                
                <g>${arrowsSVG}</g>
            </svg>
            <div class="ev-markers-layer">${markersHTML}</div>
        </div>

                        <!-- ULTRA-STILREN GRÅ SVG-VEKTOR-PIL I BUNDEN AF FIG 3 -->
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-top:20px; box-sizing:border-box; padding:0 5px;">
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <span style="font-size:9px; font-weight:800; text-transform:uppercase; color:rgba(255,255,255,0.35); letter-spacing:0.5px;">Attacking Direction</span>
                    
                    <!-- Låst til samme dæmpede systemfarve som i Fig 4 -->
                    <div style="width: 80px; height: 12px; display: flex; align-items: center;">
                        <svg viewBox="0 0 80 12" style="width: 100%; height: 100%; overflow: visible;">
                            <path d="M 2,6 L 72,6 M 68,2 L 74,6 L 68,10" 
                                  fill="none" 
                                  stroke="rgba(255,255,255,0.3)" 
                                  stroke-width="2.5" 
                                  stroke-linecap="round" 
                                  stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
                ${legendHTML}
            </div>



        </div>

        <div class="ev-interactive-buttons" style="display: flex; justify-content: center; margin: 25px auto 0 auto; width: 100%;">
            <button class="mr-btn" onclick="triggerEventDataDownload('${teamName.replace(/\s+/g,'_')}_events', 'ev-capture-target-area')">Download as PNG</button>
        </div>
    `;
}
function buildWhoScoredFig4XTHeatmap() {
    const container = getEvEl("ev-capture-target-area"); if (!EV_GLOBAL_DATA) return;
    const info = EV_GLOBAL_DATA.match_info;
    const baseColor = EV_SELECTED_TEAM == info.homeId ? info.homeColor : info.awayColor;

    let teamSelectHTML = `
        <div class="ev-interactive-buttons" style="display:flex; gap:10px; margin-bottom:20px; justify-content:center; width:100%;">
            <button class="mr-btn" style="background:${EV_SELECTED_TEAM == info.homeId ? '#00F0FF' : '#1e293b'}; color:${EV_SELECTED_TEAM == info.homeId ? '#000' : '#fff'};" onclick="EV_SELECTED_TEAM='${info.homeId}'; buildWhoScoredFig4XTHeatmap();">${info.homeName}</button>
            <button class="mr-btn" style="background:${EV_SELECTED_TEAM == info.awayId ? '#FF0055' : '#1e293b'}; color:#fff;" onclick="EV_SELECTED_TEAM='${info.awayId}'; buildWhoScoredFig4XTHeatmap();">${info.awayName}</button>
        </div>
    `;

    let passes = EV_GLOBAL_DATA.events.filter(e => e.teamId == EV_SELECTED_TEAM && e.type === "Pass" && e.success && e.xtDiff > 0);
    const { gridBlocksHTML } = processWhoScored6x5XTGrid(passes, baseColor);
    const teamName = EV_SELECTED_TEAM == info.homeId ? info.homeName.toUpperCase() : info.awayName.toUpperCase();

    container.innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; align-items:stretch;">
            ${teamSelectHTML}
            ${generateWhoScoredHeaderHTML(`${teamName}'S EXPECTED THREAT VIA PASSES`)}
            
            <div class="ev-pitch-box" style="background:#0b0813; overflow: hidden; border-radius: 6px; box-shadow: inset 0 0 30px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.05);">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                    <!-- LAYER A: DATA-GRID -->
                    <g id="ev-xt-6x5-grid-layer">${gridBlocksHTML}</g>
            
                    <!-- LAYER B: DE RETTEDE BANELINJER OVENPÅ -->
                    <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    
                    <!-- REKTANGULÆRT STRÆK FOR MIDTEN -->
                    <ellipse cx="50" cy="50" rx="8.7" ry="13.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <circle cx="50" cy="50" r="0.4" fill="rgba(255,255,255,0.4)" />
                    
                    <!-- FELTER + BUER OVENPÅ GRIDDET -->
                    <rect x="0" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <rect x="0" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <path d="M 17,43.5 A 4.5,6.5 0 0,1 17,56.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    
                    <rect x="83" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <rect x="94.2" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <path d="M 83,43.5 A 4.5,6.5 0 0,0 83,56.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                </svg>
            </div>

            <!-- 🔥 STRØMLINET BUND-PANEL: ULTRA-KOMPAKT LAYOUT -->
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-top:20px; font-size:10px; font-weight:700; color:rgba(255,255,255,0.5); padding:0 5px; box-sizing:border-box;">
                
                <!-- VENSTRE: Attacking Direction og ultra-kort pil på samme linje -->
                <div style="flex:1; display:flex; justify-content:flex-start; align-items:center;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:9px; font-weight:800; text-transform:uppercase; color:rgba(255,255,255,0.35); letter-spacing:0.5px; white-space:nowrap;">Attacking Direction</span>
                        <!-- Mikro-pil (30px bred og super diskret) -->
                        <div style="width:30px; height:10px; display:flex; align-items:center;">
                            <svg viewBox="0 0 30 10" style="width:100%; height:100%; overflow:visible;">
                                <path d="M 2,5 L 26,5 M 22,2 L 27,5 L 22,8" 
                                      fill="none" 
                                      stroke="rgba(255,255,255,0.3)" 
                                      stroke-width="1.5" 
                                      stroke-linecap="round" 
                                      stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <!-- MIDTEN: Centreret xT Legende -->
                <div style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px; text-transform:uppercase; font-size:9px; font-weight:800; color:rgba(255,255,255,0.5);">
                    Low xT</span>
                    <div style="width:100px; height:6px; background:linear-gradient(90deg, #0c111e, ${baseColor}); border-radius:3px; border:0.5px solid rgba(255,255,255,0.1);"></div>
                    <span>Max xT</span>
                </div>
                
                <!-- HØJRE: Præcis placeret footer-tekst helt til højre kant -->
                <div style="flex:1; display:flex; justify-content:flex-end; font-size:10px; font-weight:700; color:rgba(255,255,255,0.25); letter-spacing:1px; text-transform:uppercase;">
                    Via ://onrender.com
                </div>
            </div>


        </div>
                    
        <div class="ev-interactive-buttons" style="display: flex; justify-content: center; margin: 25px auto 0 auto; width: 100%;">
            <button class="mr-btn" onclick="triggerEventDataDownload('${teamName.replace(/\s+/g,'_')}_xt_map', 'ev-capture-target-area')">Download as PNG</button>
        </div>
    `;
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 7 AF 7 (OPDATERET FIG 5 MED NY TOP-HEADER & MINIMAL FOOTER)
// ==========================================================================

function buildWhoScoredFig5ZonalControl() {
    const container = getEvEl("ev-capture-target-area");
    if (!EV_GLOBAL_DATA) return;

    const info = EV_GLOBAL_DATA.match_info;
    let touches = EV_GLOBAL_DATA.events.filter(e => e.isTouch);

    // 4x3 TERRITORIAL BANESPALTNING (12 ZONER)
    let homeGrid = Array(3).fill(0).map(() => Array(4).fill(0));
    let awayGrid = Array(3).fill(0).map(() => Array(4).fill(0));

    touches.forEach(t => {
        let c = Math.min(3, Math.floor((t.x / 100) * 4));
        let r = Math.min(2, Math.floor((t.y / 100) * 3));
        
        if (t.teamId == info.awayId) {
            c = Math.min(3, Math.floor(((100 - t.x) / 100) * 4));
            r = Math.min(2, Math.floor(((100 - t.y) / 100) * 3));
            awayGrid[r][c]++;
        } else {
            homeGrid[r][c]++;
        }
    });

    let zonesHTML = "";
    const baseDarkColor = "#0c111e";
    
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            let hCount = homeGrid[r][c]; 
            let aCount = awayGrid[r][c];
            let tot = hCount + aCount;
            
            let zoneColor = baseDarkColor; 
            let alpha = 0.95;
            
            if (tot > 0) {
                let share = hCount / tot;
                if (share > 0.55) { 
                    zoneColor = info.homeColor; 
                    alpha = 0.35; 
                } else if (share < 0.45) { 
                    zoneColor = info.awayColor; 
                    alpha = 0.35; 
                } else { 
                    zoneColor = baseDarkColor; 
                    alpha = 0.95; 
                }
            }

            let flipRow = 2 - r; 
            
            if (zoneColor !== baseDarkColor) {
                zonesHTML += `<rect x="${(c / 4) * 100}" y="${(flipRow / 3) * 100}" width="25" height="${100 / 3}" fill="${baseDarkColor}" fill-opacity="1" />`;
            }

            zonesHTML += `
                <rect x="${(c / 4) * 100}" y="${(flipRow / 3) * 100}" width="25" height="${100 / 3}" 
                      fill="${zoneColor}" fill-opacity="${alpha.toFixed(3)}" stroke="rgba(0,0,0,0.4)" stroke-width="0.3"/>
            `;
        }
    }

    const teamNameHome = info.homeName.toUpperCase();
    const teamNameAway = info.awayName.toUpperCase();
    const homeColor = info.homeColor || '#00F0FF';
    const awayColor = info.awayColor || '#FF0055';

    container.innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; align-items:stretch;">
            
            <!-- 🎯 NY ANRETTET TOP-HEADER: Præcis som på dit screenshot -->
            <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:25px; text-align:center; font-family: 'Gabarito', sans-serif;">
                <div style="font-size:26px; font-weight:900; color:#fff; letter-spacing:1px; text-transform:uppercase; margin-bottom:6px;">ZONAL CONTROL BY TOUCHES</div>
                
                <!-- Tekst-baseret legende under titlen -->
                <div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:8px;">
                    <span style="color:${homeColor};">${teamNameHome}</span>
                    <span style="color:rgba(255,255,255,0.15);">|</span>
                    <span style="color:${awayColor};">${teamNameAway}</span>
                    <span style="color:rgba(255,255,255,0.15);">|</span>
                    <span style="color:#64748b;">CONTESTED</span>
                </div>

                <!-- Blok med de store logoer, "VS" og retningspile -->
                <div style="display:flex; align-items:center; justify-content:center; gap:20px; margin-top:20px;">
                    
                    <!-- Venstre Logo + Pil -->
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <div style="width:58px; height:58px; border-radius:50%; background:rgba(255,255,255,0.02); border: 2.5px solid ${homeColor}; display:flex; align-items:center; justify-content:center; padding:6px; box-shadow: 0 0 15px rgba(${hexToRgb(homeColor)}, 0.25);">
                            <img src="${info.homeLogo}" style="max-width:100%; max-height:100%; object-fit:contain;">
                        </div>
                        <span style="color:${homeColor}; font-size:16px; font-weight:900; line-height:1;">➡</span>
                    </div>

                    <!-- "VS." adskiller i midten -->
                    <div style="font-size:14px; font-weight:800; color:rgba(255,255,255,0.15); text-transform:uppercase; padding-bottom:24px;">vs.</div>

                    <!-- Højre Logo + Pil -->
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <div style="width:58px; height:58px; border-radius:50%; background:rgba(255,255,255,0.02); border: 2.5px solid ${awayColor}; display:flex; align-items:center; justify-content:center; padding:6px; box-shadow: 0 0 15px rgba(${hexToRgb(awayColor)}, 0.25);">
                            <img src="${info.awayLogo}" style="max-width:100%; max-height:100%; object-fit:contain;">
                        </div>
                        <span style="color:${awayColor}; font-size:16px; font-weight:900; line-height:1;">⬅</span>
                    </div>

                </div>
            </div>


            <div class="ev-pitch-box" style="background:#0b0813; overflow: hidden; border-radius: 6px; box-shadow: inset 0 0 30px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.05);">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                    
                    <!-- LAYER A: MATRIX FARVER (Rettet til zonesHTML) -->
                    <g id="ev-zonal-matrix-layer">${zonesHTML}</g>
                    
                    <!-- LAYER B: DE RIGTIGE BANELINJER -->
                    <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    
                    <ellipse cx="50" cy="50" rx="8.7" ry="13.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <circle cx="50" cy="50" r="0.4" fill="rgba(255,255,255,0.4)" />
                    
                    <rect x="0" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <rect x="0" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <path d="M 17,43.5 A 4.5,6.5 0 0,1 17,56.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    
                    <rect x="83" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <rect x="94.2" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <path d="M 83,43.5 A 4.5,6.5 0 0,0 83,56.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                </svg>
            </div>


            <div style="width:100%; text-align:center; font-size:10px; font-weight:700; color:rgba(255,255,255,0.25); letter-spacing:1px; margin-top:20px; text-transform:uppercase; padding-top:12px; border-top:1px solid rgba(255,255,255,0.03);">
                Via per-90.streamlit.app
            </div>

        </div> <!-- Lukker hoved-div'en -->

        <!-- 🎯 TILFØJET: Interaktiv download-knap til Figur 5 -->
        <div class="ev-interactive-buttons" style="text-align:center; margin-top:25px; width:100%;">
            <button class="mr-btn" style="margin:0 auto;" onclick="triggerEventDataDownload('zonal_control', 'ev-capture-target-area')">Download as PNG</button>
        </div>
    `;
}


// ==========================================================================
// PER 90 - EVENTDATA.JS - GRAFISK DATAMOTOR TIL SPILLER-EVENTS (FIG 2)
// ==========================================================================
function processPlayerEventsGraphics(counts) {
    let markersHTML = "";
    let arrowsSVG = "";
    let gradientDefs = "";
    let idx = 0;

    if (!EV_GLOBAL_DATA || !EV_GLOBAL_DATA.events) return { markersHTML, arrowsSVG, gradientDefs };

    EV_GLOBAL_DATA.events.filter(e => e.playerId == EV_SELECTED_PLAYER).forEach(e => {
        let cats = [];
        if (e.type === "Pass") cats.push(e.xtDiff > 0.05 ? "Pass into Final ⅓" : (e.isSetPiece ? "Long Pass" : "Regular Pass"));
        if (e.isTouch) cats.push(e.x > 83.0 && e.y > 21.1 && e.y < 78.9 ? "Opp. Box Touch" : "Touch");
        if (["Tackle", "Interception", "Clearance"].includes(e.type)) cats.push("Defensive Action");

        cats.forEach(cat => {
            if (!EV_SELECTED_METRICS.includes(cat)) return;
            counts[cat]++;
            const props = getMetricColorAndProps(cat);
            
            let flipY = 100 - e.y;
            let flipEndY = 100 - e.endY;
            
            if (props.m === "line" && e.endX !== null) {
                idx++;
                const gradId = `comet-grad-${idx}`;
                
                gradientDefs += `
                    <linearGradient id="${gradId}" x1="${e.x}%" y1="${flipY}%" x2="${e.endX}%" y2="${flipEndY}%" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="${props.c}" stop-opacity="0.00" />
                        <stop offset="65%" stop-color="${props.c}" stop-opacity="0.50" />
                        <stop offset="100%" stop-color="${props.c}" stop-opacity="0.95" />
                    </linearGradient>
                `;

                let dx = e.endX - e.x;
                let dy = flipEndY - flipY;
                let len = Math.sqrt(dx * dx + dy * dy) || 1;
                let nx = -dy / len;
                let ny = dx / len;
                
                let wStart = 0.03;
                let wEnd = 0.42;
                
                let xStartLeft = e.x + nx * wStart;
                let yStartLeft = flipY + ny * wStart;
                let xStartRight = e.x - nx * wStart;
                let yStartRight = flipY - ny * wStart;
                
                let xEndLeft = e.endX + nx * wEnd;
                let yEndLeft = flipEndY + ny * wEnd;
                let xEndRight = e.endX - nx * wEnd;
                let yEndRight = flipEndY - ny * wEnd;

                arrowsSVG += `
                    <path d="M ${xStartLeft} ${yStartLeft} L ${xEndLeft} ${yEndLeft} L ${xEndRight} ${yEndRight} L ${xStartRight} ${yStartRight} Z" fill="url(#${gradId})" />
                    <circle cx="${e.endX}" cy="${flipEndY}" r="0.75" fill="#0a0f1a" opacity="1" />
                    <circle cx="${e.endX}" cy="${flipEndY}" r="0.75" fill="none" stroke="${props.c}" stroke-width="0.22" opacity="0.95" />
                `;
            } else if (props.m === "circle" || props.m === "square") {
                markersHTML += `<div style="left:${e.x}%; top:${flipY}%; width:11px; height:11px; background:${props.c}; border:1.5px solid #fff; box-shadow:0 0 6px ${props.c}; position:absolute; transform:translate(-50%,-50%); border-radius:50%;"></div>`;
            }
        });
    });

    return { markersHTML, arrowsSVG, gradientDefs };
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - MATEMATISK KILE-MOTOR TIL HOLD-EVENTS (FIG 3)
// ==========================================================================
function processTeamEventsGraphics(counts) {
    let markersHTML = "";
    let arrowsSVG = "";
    let gradientDefs = "";
    let idx = 0;

    if (!EV_GLOBAL_DATA || !EV_GLOBAL_DATA.events) return { markersHTML, arrowsSVG, gradientDefs };

    EV_GLOBAL_DATA.events.filter(e => e.teamId == EV_SELECTED_TEAM).forEach(e => {
        let cats = [];
        if (e.type === "Pass") {
            cats.push(e.xtDiff > 0.05 ? "Pass into Final ⅓" : (e.isSetPiece ? "Long Pass" : "Regular Pass"));
        }
        if (e.isTouch) {
            cats.push(e.x > 83.0 && e.y > 21.1 && e.y < 78.9 ? "Opp. Box Touch" : "Touch");
        }
        if (["Tackle", "Interception", "Clearance"].includes(e.type)) {
            cats.push("Defensive Action");
        }

        cats.forEach(cat => {
            if (!EV_SELECTED_METRICS.includes(cat)) return;
            counts[cat]++;
            const props = getMetricColorAndProps(cat);
            
            let flipY = 100 - e.y;
            let flipEndY = 100 - e.endY;
            
            if (props.m === "line" && e.endX !== null) {
                idx++;
                const gradId = `team-comet-grad-${idx}`;
                
                gradientDefs += `
                    <linearGradient id="${gradId}" x1="${e.x}%" y1="${flipY}%" x2="${e.endX}%" y2="${flipEndY}%" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="${props.c}" stop-opacity="0.00" />
                        <stop offset="65%" stop-color="${props.c}" stop-opacity="0.50" />
                        <stop offset="100%" stop-color="${props.c}" stop-opacity="0.95" />
                    </linearGradient>
                `;

                let dx = e.endX - e.x;
                let dy = flipEndY - flipY;
                let len = Math.sqrt(dx * dx + dy * dy) || 1;
                let nx = -dy / len;
                let ny = dx / len;
                
                let wStart = 0.03;
                let wEnd = 0.42;
                
                let xStartLeft = e.x + nx * wStart;
                let yStartLeft = flipY + ny * wStart;
                let xStartRight = e.x - nx * wStart;
                let yStartRight = flipY - ny * wStart;
                
                let xEndLeft = e.endX + nx * wEnd;
                let yEndLeft = flipEndY + ny * wEnd;
                let xEndRight = e.endX - nx * wEnd;
                let yEndRight = flipEndY - ny * wEnd;

                arrowsSVG += `
                    <path d="M ${xStartLeft} ${yStartLeft} L ${xEndLeft} ${yEndLeft} L ${xEndRight} ${yEndRight} L ${xStartRight} ${yStartRight} Z" fill="url(#${gradId})" />
                    <circle cx="${e.endX}" cy="${flipEndY}" r="0.75" fill="#0a0f1a" opacity="1" />
                    <circle cx="${e.endX}" cy="${flipEndY}" r="0.75" fill="none" stroke="${props.c}" stroke-width="0.22" opacity="0.95" />
                `;
            } else if (props.m === "circle" || props.m === "square") {
                markersHTML += `<div style="left:${e.x}%; top:${flipY}%; width:11px; height:11px; background:${props.c}; border:1.5px solid #fff; box-shadow:0 0 6px ${props.c}; position:absolute; transform:translate(-50%,-50%); border-radius:50%;"></div>`;
            }
        });
    });

    return { markersHTML, arrowsSVG, gradientDefs };
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - TACTICAL 6x5 EXPECTED THREAT MATRIX DATA ENGINE (FIG 4)
// ==========================================================================
function processWhoScored6x5XTGrid(passes, teamColor) {
    let grid = Array(5).fill(0).map(() => Array(6).fill(0));
    let maxCellVal = 0.001;

    passes.forEach(p => {
        let c = Math.min(5, Math.floor((p.x / 100) * 6));
        let r = Math.min(4, Math.floor((p.y / 100) * 5));
        grid[r][c] += p.xtDiff;
        if (grid[r][c] > maxCellVal) maxCellVal = grid[r][c];
    });

    let gridBlocksHTML = "";
    const baseDarkColor = "#0c111e";

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 6; c++) {
            let val = grid[r][c];
            let factor = maxCellVal > 0 ? (val / maxCellVal) : 0;
            
            let flipRow = 4 - r;
            let xPos = (c / 6) * 100;
            let yPos = (flipRow / 5) * 100;
            let width = 100 / 6;
            let height = 100 / 5;

            if (factor === 0) {
                gridBlocksHTML += `
                    <rect x="${xPos}" y="${yPos}" width="${width}" height="${height}" 
                          fill="${baseDarkColor}" fill-opacity="0.95" 
                          stroke="rgba(0, 0, 0, 0.4)" stroke-width="0.3" />
                `;
            } else {
                gridBlocksHTML += `
                    <rect x="${xPos}" y="${yPos}" width="${width}" height="${height}" fill="${baseDarkColor}" fill-opacity="1" />
                    <rect x="${xPos}" y="${yPos}" width="${width}" height="${height}" 
                          fill="${teamColor || '#ffffff'}" fill-opacity="${(factor * 0.85).toFixed(3)}" 
                          stroke="rgba(0, 0, 0, 0.4)" stroke-width="0.3" />
                `;
            }
        }
    }

    return { gridBlocksHTML };
}
