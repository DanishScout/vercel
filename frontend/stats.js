// ==========================================================================
// PER 90 - STATS.JS - DEL 1 AF 6 (MASTER CONFIG & PROFIL-CSS)
// ==========================================================================

const STATS_CATEGORIES_LIST = ["OUTPUT", "PLAYMAKING", "PASSING", "POSSESSION", "DEFENDING/DUELS", "OTHER"];
let STATS_CURRENT_PLAYER = "";
let STATS_ACTIVE_CATEGORIES = [...STATS_CATEGORIES_LIST];
let STATS_GLOBAL_PAYLOAD = null;

const $s = id => document.getElementById(id);

// 🎨 CORE DESIGN INJECTION (DINE ORIGINALE KLASSER BEVARET 1:1)
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        /* 🌐 THE MAIN PROFILE CARD AS A TABLE */
        .stats-profile-table-container {
            width: 100%;
            max-width: 1100px;
            background: rgba(11, 18, 32, 0.6);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255,255,255,0.04);
            border-top: 3px solid var(--accent-purple);
            border-radius: 20px;
            margin: 0 auto 35px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.6);
            border-collapse: collapse !important;
        }

        .stats-profile-table-container td {
            padding: 30px !important;
            box-sizing: border-box;
            vertical-align: middle;
        }

        .stats-p-left-tabel { display: flex; align-items: center; gap: 24px; width: 100%; }
        
        .stats-p-names { 
            display: flex; 
            flex-direction: column; 
            border-left: 4px solid var(--accent-purple) !important; 
            padding-left: 14px !important; 
            text-align: left; 
            width: 100%;
        }
        
        .stats-p-name { 
            font-size: 34px; 
            font-weight: 900; 
            margin: 0; 
            color: #fff; 
            letter-spacing: -0.5px; 
            text-shadow: 0 0 20px rgba(255,255,255,0.1); 
            line-height: 1.1; 
        }

        .stats-p-sub { 
            font-size: 12px; 
            color: #64748b; 
            margin: 6px 0 0 0; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            opacity: 0.8; 
        }

        .stats-logo-shape { display: flex; align-items: center; justify-content: center; width: 70px; height: 75px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 6px; border-radius: 14px; box-sizing: border-box; flex-shrink: 0; }
        .stats-club-crest { width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: opacity 0.25s ease-in-out; }
        .stats-club-crest.logo-loaded { opacity: 1 !important; }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - STATS.JS - DEL 2 AF 6 (DIAGRAM LOGIK & MEDIEQUERIES)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        /* 🌐 DET ORIGINALE DATA-DIAGRAM */
        .stats-blocks-container { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 25px; width: 100%; max-width: 1100px; margin: 0 auto; box-sizing: border-box; }
        .stats-cat-block { background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-sizing: border-box; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .stats-cat-title { font-size: 13px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; }
        
        .stats-metrics-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 20px; width: 100%; }
        .stats-metric-item { display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
        
        .stats-m-lbl { font-size: 10px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; }
        .stats-m-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; overflow: hidden; position: relative; margin-bottom: 6px; display: block !important; }
        .stats-m-bar-fill { height: 100%; border-radius: 10px; width: 0%; transition: width 0.6s ease-in-out; display: block !important; }
        
        .stats-m-info-row { display: flex; align-items: center; justify-content: space-between; width: 100%; }
        .stats-m-val-text { font-size: 11px; font-weight: 800; color: #fff; }
        .stats-m-val-text span { color: #475569; font-weight: 600; font-size: 10px; margin-left: 2px; }
        
        .stats-status-badge { 
            font-size: 8.5px; font-weight: 900; padding: 0 6px !important; border-radius: 4px; text-transform: uppercase; 
            display: inline-block !important; text-align: center !important; 
            height: 15px !important; line-height: 15px !important; box-sizing: border-box !important;
            letter-spacing: 0.5px !important; -webkit-text-size-adjust: 100% !important; text-rendering: geometricPrecision !important;
        }
        
        .fill-elite { background: #22c55e !important; }
        .fill-good { background: #60a5fa !important; }
        .fill-avg { background: #94a3b8 !important; }
        .fill-concern { background: #f59e0b !important; }
        .fill-poor { background: #ef4444 !important; }

        .badge-elite { background: rgba(34, 197, 94, 0.06); border: 1px solid #22c55e; color: #22c55e; }
        .badge-good { background: rgba(96, 165, 252, 0.06); border: 1px solid #60a5fa; color: #60a5fa; }
        .badge-avg { background: rgba(148, 163, 184, 0.12); border: 1px solid #94a3b8; color: #94a3b8; }
        .badge-concern { background: rgba(245, 158, 11, 0.06); border: 1px solid #f59e0b; color: #f59e0b; }
        .badge-poor { background: rgba(239, 68, 68, 0.06); border: 1px solid #ef4444; color: #ef4444; }

        /* 📱 TABLET-OPTIMERING */
        @media (max-width: 1025px) { 
            .stats-blocks-container { grid-template-columns: 1fr !important; } 
            .stats-profile-table-container td { padding: 15px 20px !important; }
            .stats-p-name { font-size: 26px; }
            .stats-p-sub { font-size: 10px; }
        }
        
        @media (max-width: 600px) { .stats-metrics-grid { grid-template-columns: 1fr !important; } }

        /* 📱 ULTRA-MOBIL SIKRING */
        @media (max-width: 480px) {
            .stats-profile-table-container td { padding: 12px 10px !important; }
            .stats-p-left-tabel { gap: 12px !important; }
            .stats-p-names { border-left-width: 3px !important; padding-left: 6px !important; width: 100% !important; }
            .stats-p-name { font-size: 14px !important; letter-spacing: -0.3px !important; }
            .stats-p-sub { font-size: 7.5px !important; margin-top: 2px !important; letter-spacing: 0px !important; white-space: nowrap !important; width: 100% !important; opacity: 0.8 !important; }
            .stats-logo-shape { width: 44px !important; height: 48px !important; border-radius: 8px !important; padding: 3px !important; }

            .stats-blocks-container { grid-template-columns: 1fr !important; gap: 6px !important; width: 100% !important; padding: 0 !important; }
            .stats-cat-block { padding: 8px !important; gap: 6px !important; border-radius: 10px !important; }
            .stats-cat-title { font-size: 8.5px !important; padding-bottom: 3px !important; margin-bottom: 0px !important; }
            .stats-metrics-grid { grid-template-columns: 1fr !important; gap: 6px !important; }
            .stats-m-lbl { font-size: 6px !important; margin-bottom: 1px !important; letter-spacing: 0px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.8 !important; }
            .stats-m-bar-bg { height: 2px !important; margin-bottom: 2px !important; }
            .stats-m-val-text { font-size: 6px !important; }
            .stats-m-val-text span { font-size: 6px !important; margin-left: 1px !important; }
            .stats-status-badge { font-size: 5px !important; padding: 2px 4px !important; line-height: 1 !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; letter-spacing: -0.2px !important; border-radius: 2px !important; height: 10px !important; box-sizing: border-box !important; }
        }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - STATS.JS - DEL 3 AF 6 (VIEW INITIALISERING & DRAWER UI)
// ==========================================================================

async function initPlayerStatsView(container) {
    container.innerHTML = `
        <section id="view-stats" class="content-view active" style="padding-top: 10px;">
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-id-card-clip" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Player Stats</span>
            </div>
            <div class="control-trigger-wrapper" style="margin-bottom: 35px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Profile <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            <div id="stats-capture-target-area" style="padding: 15px 5px; width: 100%; box-sizing: border-box;">
                <div id="stats-main-profile-card"></div>
                <div class="stats-blocks-container" id="stats-live-blocks-grid"></div>
            </div>
            <div style="display: flex; justify-content: center; margin-top: 30px; width: 100%;">
                <button onclick="downloadPlayerStatsPNG()" style="background: var(--accent-purple); color: #06140c; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">Download Profile as PNG</button>
            </div>
        </section>
    `;
    await initCustomStatsSelectors();
}

function buildAndAppendStatsDrawerHTML() {
    const checkboxesHTML = STATS_CATEGORIES_LIST.map(cat => {
        const checked = STATS_ACTIVE_CATEGORIES.includes(cat);
        return `<label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; color: var(--text-primary); transition: opacity 0.2s; opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${cat}" ${checked ? "checked" : ""} onchange="handleStatsCategoryToggle(this)" style="accent-color: var(--accent-purple); cursor: pointer;"> ${cat}</label>`;
    }).join('');

    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer stats-filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Profile Settings</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px; position: relative; width:100%;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Select player</label>
                <div class="custom-select-wrapper" id="stats-player-wrapper" style="position: relative; width: 100%;">
                    <div class="custom-select-trigger" onclick="toggleStatsDropdown()" style="background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span id="stats-player-selected-text">Indlæser...</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-muted);"></i>
                    </div>
                    <div class="custom-options-list" id="stats-player-options" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--accent-purple); border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 120;">
                        <div style="position: sticky; top: 0; background: #07030c; padding: 8px; border-bottom: 1px solid var(--border-color); z-index: 130;"><input type="text" id="stats-player-search" oninput="filterStatsPlayerList()" placeholder="Search..." style="width: 100%; background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 4px; font-size: 13px; outline: none;" onclick="event.stopPropagation();"></div>
                        <div id="stats-player-items-container"></div>
                    </div>
                </div>
            </div>
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px;"><label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Select Categories</label><div style="background: #07030c; border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 12px;">${checkboxesHTML}</div></div>
        </div>
    `;
    document.body.appendChild(drawerDiv);
}
// ==========================================================================
// PER 90 - STATS.JS - DEL 4 AF 6 (PERCENTILE CONFIG & PROFIL MOTOR)
// ==========================================================================

function getStats5TierConfig(p) {
    if (p >= 85) return { text: "Elite", classSuffix: "elite" };
    if (p >= 65) return { text: "Above Avg", classSuffix: "good" };
    if (p >= 40) return { text: "Average", classSuffix: "avg" };
    if (p >= 20) return { text: "Below Avg", classSuffix: "concern" };
    return { text: "Poor", classSuffix: "poor" };
}

function handleStatsCategoryToggle(checkbox) {
    const cat = checkbox.value;
    if (checkbox.checked) { if (!STATS_ACTIVE_CATEGORIES.includes(cat)) STATS_ACTIVE_CATEGORIES.push(cat); } 
    else { if (STATS_ACTIVE_CATEGORIES.length > 1) { STATS_ACTIVE_CATEGORIES = STATS_ACTIVE_CATEGORIES.filter(c => c !== cat); } else { checkbox.checked = true; return; } }
    checkbox.parentElement.style.opacity = checkbox.checked ? '1' : '0.4';
    renderStatsActiveBlocks();
}

function renderStatsPlayerHeaderCard(data) {
    const container = $s("stats-main-profile-card"); if (!container) return;
    const posPlural = data.position ? `${data.position}s` : 'Peers';
    const dynamicSubtitle = `Percentile rank vs. ${data.league || 'League'} ${posPlural}`;
    const imgId = `stats-profile-crest-${data.team_id || 'none'}`;

    container.innerHTML = `
        <table class="stats-profile-table-container">
            <tr>
                <td>
                    <div class="stats-p-left-tabel">
                        <div class="stats-logo-shape"><img id="${imgId}" class="stats-club-crest" src="data:image/svg+xml;utf8,<svg xmlns=%22http://w3.org width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23475569%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>'" /></div>
                        <div class="stats-p-names"><h1 class="stats-p-name">${data.player_name}</h1><p class="stats-p-sub">${dynamicSubtitle}</p></div>
                    </div>
                </td>
            </tr>
        </table>
    `;

    setTimeout(async () => {
        const imgEl = document.getElementById(imgId); if (!imgEl || !data.team_id || data.team_id === "nan" || data.team_id === "None") return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/logo/${data.team_id}`).then(r => r.json());
            if (res.logo_base64) { imgEl.onload = () => { imgEl.classList.add('logo-loaded'); }; imgEl.src = res.logo_base64; }
        } catch (e) { console.warn(`Kunne ikke hente logo`, e); }
    }, 10);
}
// ==========================================================================
// PER 90 - STATS.JS - DEL 5 AF 6 (GITTER GENERATOR & ASYNKRON SELECTOR)
// ==========================================================================

function renderStatsActiveBlocks() {
    const grid = $s("stats-live-blocks-grid"); if (!grid || !STATS_GLOBAL_PAYLOAD) return;
    
    grid.innerHTML = Object.entries(STATS_GLOBAL_PAYLOAD.categories)
        .filter(([catName]) => STATS_ACTIVE_CATEGORIES.includes(catName))
        .map(([catName, metrics]) => {
            const metricsHTML = metrics.map(m => {
                const conf = getStats5TierConfig(m.percentile); 
                return `
                    <div class="stats-metric-item">
                        <div class="stats-m-lbl">${m.metric_name}</div>
                        <div class="stats-m-bar-bg"><div class="stats-m-bar-fill fill-${conf.classSuffix}" style="width: ${m.percentile}%;"></div></div>
                        <div class="stats-m-info-row">
                            <div class="stats-m-val-text">${m.value.toFixed(2)}/90 <span>(${Math.round(m.percentile)}%)</span></div>
                            <div class="stats-status-badge badge-${conf.classSuffix}">${conf.text}</div>
                        </div>
                    </div>
                `;
            }).join('');
            return `<div class="stats-cat-block"><div class="stats-cat-title" style="color:var(--accent-purple); font-weight:900; letter-spacing:1.5px;">${catName}</div><div class="stats-metrics-grid">${metricsHTML}</div></div>`;
        }).join('');
}

async function initCustomStatsSelectors() {
    const gammelDrawer = document.querySelector('.stats-filter-drawer'); if (gammelDrawer) gammelDrawer.remove();
    buildAndAppendStatsDrawerHTML();
    try {
        const players = await fetch(`${API_BASE_URL}/api/pizza/players`).then(r => r.json());
        if (players.length > 0 && $s("stats-player-items-container")) {
            // 🎯 CRASH SIKRING: Sætter dataene i arrayet op korrekt i ét hug
            STATS_CURRENT_PLAYER = players[0];
            $s("stats-player-selected-text").innerText = STATS_CURRENT_PLAYER;
            $s("stats-player-items-container").innerHTML = players.map(p => `<div class="custom-option-item ${p === STATS_CURRENT_PLAYER ? 'selected-active' : ''}" onclick="selectStatsPlayer('${p.replace(/'/g, "\\\\'")}')">${p}</div>`).join('');
            await onStatsFilterChange();
        }
    } catch (e) { console.error("Fejl under indlæsning af spillere:", e); }
}

let STATS_CACHED_PLAYER_ITEMS = null;
let STATS_SEARCH_DEBOUNCE_TIMER = null;

function toggleStatsDropdown() {
    const p = $s("stats-player-options"); if (!p) return;
    const isOpening = p.style.display === "none" || p.style.display === ""; p.style.display = isOpening ? "block" : "none";
    if (isOpening) {
        if ($s("stats-player-search")) { $s("stats-player-search").value = ""; }
        STATS_CACHED_PLAYER_ITEMS = document.querySelectorAll("#stats-player-items-container .custom-option-item");
        for (let i = 0; i < STATS_CACHED_PLAYER_ITEMS.length; i++) { STATS_CACHED_PLAYER_ITEMS[i].style.display = i < 30 ? "block" : "none"; }
        setTimeout(() => $s("stats-player-search")?.focus(), 50);
    }
}

function filterStatsPlayerList() {
    clearTimeout(STATS_SEARCH_DEBOUNCE_TIMER);
    STATS_SEARCH_DEBOUNCE_TIMER = setTimeout(() => {
        const filter = $s("stats-player-search")?.value.toLowerCase(); if (filter === undefined) return;
        if (!STATS_CACHED_PLAYER_ITEMS) { STATS_CACHED_PLAYER_ITEMS = document.querySelectorAll("#stats-player-items-container .custom-option-item"); }
        let matchesFound = 0;
        for (let i = 0; i < STATS_CACHED_PLAYER_ITEMS.length; i++) {
            const item = STATS_CACHED_PLAYER_ITEMS[i];
            if (filter === "") { item.style.display = i < 30 ? "block" : "none"; } 
            else {
                if (item.innerText.toLowerCase().includes(filter) && matchesFound < 30) { item.style.display = "block"; matchesFound++; } 
                else { item.style.display = "none"; }
            }
        }
    }, 150);
}
// ==========================================================================
// PER 90 - STATS.JS - DEL 6 AF 6 (STATE HANDLERS & DOWNLOAD MOTOR)
// ==========================================================================

async function selectStatsPlayer(val) {
    STATS_CURRENT_PLAYER = val; $s("stats-player-selected-text").innerText = val;
    if ($s("stats-player-options")) $s("stats-player-options").style.display = "none";
    await onStatsFilterChange();
}

async function onStatsFilterChange() {
    if (!STATS_CURRENT_PLAYER) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/player-stats?player=${encodeURIComponent(STATS_CURRENT_PLAYER)}`);
        if (res.ok) {
            STATS_GLOBAL_PAYLOAD = await res.json();
            renderStatsPlayerHeaderCard(STATS_GLOBAL_PAYLOAD);
            renderStatsActiveBlocks();
        }
    } catch (e) { console.error("Fejl under hentning af profil-data:", e); }
}

function downloadPlayerStatsPNG() {
    const originalEl = $s("stats-capture-target-area"); if (!originalEl) return;
    const clone = originalEl.cloneNode(true); clone.id = "stats-download-clone";
    
    Object.assign(clone.style, {
        position: "absolute", left: "-9999px", top: "-9999px",
        width: "1024px", minWidth: "1024px", maxWidth: "1024px",
        height: "auto", minHeight: "auto", maxHeight: "none",
        boxSizing: "border-box", padding: "30px", overflow: "visible"
    });
    
    const overrideStyle = document.createElement("style");
    overrideStyle.innerHTML = `
        /* 🎯 ULTRA-LÅST FLEXBOX-AKSE FOR TOPPEN KUN I BILLEDET (FJERNER SAFARI RETINA-FEJL) */
        #stats-download-clone .stats-profile-table-container td { padding: 30px !important; }
        #stats-download-clone .stats-p-left-tabel { display: flex !important; align-items: center !important; gap: 24px !important; width: 100% !important; }
        /* 🎯 REPARATION: Fjerner Flexbox og tvinger en rå tabel-alignment, så teksten ALDRIG kan rykke mod højre */
        #stats-download-clone .stats-p-names { 
            display: table-cell !important;      /* 🛠️ ÆNDRET FRA FLEX TIL TABEL-CELLE */
            vertical-align: middle !important;   /* Tvinger perfekt, urokkelig lodret centrering */
            border-left: 4px solid var(--accent-purple) !important; 
            padding-left: 14px !important; 
            margin: 0 !important;
            text-align: left !important; 
            width: 100% !important;
        }

        #stats-download-clone .stats-p-name { font-size: 34px !important; font-weight: 900 !important; line-height: 1.0 !important; letter-spacing: -0.5px !important; margin: 0 0 6px 0 !important; display: block !important; }
        #stats-download-clone .stats-p-sub { font-size: 12px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 1px !important; opacity: 0.8 !important; white-space: normal !important; width: auto !important; line-height: 1.0 !important; display: block !important; }
        #stats-download-clone .stats-logo-shape { width: 70px !important; height: 75px !important; border-radius: 14px !important; padding: 6px !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; }

        /* Tvinger altid det store 2-kolonne master layout */
        #stats-download-clone .stats-blocks-container { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 25px !important; width: 100% !important; }
        #stats-download-clone .stats-cat-block { padding: 25px !important; gap: 20px !important; border-radius: 20px !important; }
        
        /* 🛠️ FIKSET: Rettet den dobbelte CSS-klasse (.stats-download-clone) så titellayoutet ikke cutter */
        #stats-download-clone .stats-cat-title { font-size: 13px !important; padding-bottom: 10px !important; margin-bottom: 5px !important; }
        #stats-download-clone .stats-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
        
        #stats-download-clone .stats-m-lbl { font-size: 10px !important; margin-bottom: 6px !important; opacity: 0.9 !important; letter-spacing: 0.5px !important; -webkit-text-size-adjust: 100% !important; text-rendering: geometricPrecision !important; }
        #stats-download-clone .stats-m-bar-bg { height: 4px !important; margin-bottom: 6px !important; }
        #stats-download-clone .stats-m-val-text { font-size: 11px !important; }
        #stats-download-clone .stats-m-val-text span { font-size: 10px !important; margin-left: 2px !important; }
        
        #stats-download-clone .stats-status-badge { 
            font-size: 8.5px !important; font-weight: 900 !important; padding: 0 6px !important; border-radius: 4px !important; display: inline-block !important; text-align: center !important; box-sizing: border-box !important; letter-spacing: 0.5px !important; -webkit-text-size-adjust: 100% !important; text-rendering: geometricPrecision !important; 
            height: 15px !important; line-height: 12.5px !important; vertical-align: middle !important; margin-top: 0 !important; 
        }
    `;
    
    document.body.appendChild(clone); document.body.appendChild(overrideStyle);
    
    // 🛠️ MELDING: pixelRatio: 1 blæser iPhonens retina forstyrrelse ud, så downloads spejles 1:1 på pc og mobil!
    setTimeout(() => {
        html2canvas(clone, { scale: 3, pixelRatio: 1, backgroundColor: "#0B1220", useCORS: true, logging: false }).then(canvas => {
            const link = document.createElement("a"); 
            link.download = `player_stats_${STATS_CURRENT_PLAYER.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL("image/png"); link.click();
            clone.remove(); overrideStyle.remove();
        }).catch(e => { console.error("Fejl under tvunget PC-download:", e); clone.remove(); overrideStyle.remove(); });
    }, 60);
}

document.addEventListener("click", e => {
    if (!e.target.closest('#stats-player-wrapper')) { const p = $s("stats-player-options"); if(p) p.style.display = "none"; }
});
