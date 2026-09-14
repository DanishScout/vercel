// ==========================================================================
// PER 90 - RADAR.JS - DEL 1 AF 6 (MASTER CONFIG & SEMANTISK TABEL-CSS)
// ==========================================================================

const AVAILABLE_RADAR_METRICS = [
    "Goals", "npxG", "Shots On Target", "On Target %", "Created Own Shot", 
    "Total Shots", "Shots Outside Box", "Shots Inside Box", "Assists", "xA", 
    "Key Passes", "xT via Live Passes", "Progressive Passes", "Passes Into Final 3rd", 
    "Forward Passes", "Passes in Opp. Half", "Passes in Own Half", "Accurate Passes", 
    "Accurate Long Balls", "Accurate Crosses", "Pass Accuracy %", "Long Ball Accuracy %", 
    "Cross Accuracy %", "Successful Dribbles", "Dribble Attempts", "Dribble Success %", 
    "Progressive Carries", "xT via Prog. Carries", "Carries Into Final ⅓", "Touches In Opp. Box", 
    "Fouls Drawn", "Tackles Won %", "Aerials Won %", "Duels Won %", "Tackles Won", 
    "Aerials Won", "Duels Won", "Clearances", "Blocked Shots", "Interceptions"
];


const RADAR_CATEGORIES = {
    "Shooting": {
        "Goals": "Goals",
        "npxG": "npxG",
        "Shots On Target": "Shots On Target",
        "On Target %": "On Target %",
        "Created Own Shot": "Created Own Shot",
        "Total Shots": "Total Shots",
        "Shots Outside Box": "Shots Outside Box",
        "Shots Inside Box": "Shots Inside Box"
    },
    "Passing": {
        "Assists": "Assists",
        "xA": "xA",
        "Key Passes": "Key Passes",
        "xT via Live Passes": "xT via Live Passes",
        "Progressive Passes": "Progressive Passes",
        "Passes Into Final 3rd": "Passes Into Final 3rd",
        "Forward Passes": "Forward Passes",
        "Passes in Opp. Half": "Passes in Opp. Half",
        "Passes in Own Half": "Passes in Own Half",
        "Accurate Passes": "Accurate Passes",
        "Accurate Long Balls": "Accurate Long Balls",
        "Accurate Crosses": "Accurate Crosses",
        "Pass Accuracy %": "Pass Accuracy %",
        "Long Ball Accuracy %": "Long Ball Accuracy %",
        "Cross Accuracy %": "Cross Accuracy %"
    },
    "Possession": {
        "Successful Dribbles": "Successful Dribbles",
        "Dribble Attempts": "Dribble Attempts",
        "Dribble Success %": "Dribble Success %",
        "Progressive Carries": "Progressive Carries",
        "xT via Prog. Carries": "xT via Prog. Carries",
        "Carries Into Final ⅓": "Carries Into Final ⅓",
        "Touches In Opp. Box": "Touches In Opp. Box",
        "Fouls Drawn": "Fouls Drawn"
    },
    "Defending": {
        "Tackles Won %": "Tackles Won %",
        "Aerials Won %": "Aerials Won %",
        "Duels Won %": "Duels Won %",
        "Tackles Won": "Tackles Won",
        "Aerials Won": "Aerials Won",
        "Duels Won": "Duels Won",
        "Clearances": "Clearances",
        "Blocked Shots": "Blocked Shots",
        "Interceptions": "Interceptions"
    }
};


let RADAR_PLAYER_1 = "", RADAR_PLAYER_2 = "";
let RADAR_COLOR_1 = "#00f0ff", RADAR_COLOR_2 = "#d946ef";

const $r = id => document.getElementById(id);

// 🎨 CORE DESIGN INJECTION (SEMANTISKE TABELKANALER - RESPONSIVT SIKRET OVERALT)
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        #view-radar .wrap { max-width: 100%; margin: auto; padding: 10px; background: transparent; display: flex; flex-direction: column; align-items: center; }
        #view-radar .chart-container { background: linear-gradient(180deg, #0f172a 0%, #020617 100%); padding: 30px; border-radius: 24px; opacity: .90; width: 100%; max-width: 710px; margin: 10px auto; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); box-sizing: border-box; }
        
        /* 🌐 SEMANTISK TOP-PANEL: Tabellen tvinger en perfekt 50/50 fordeling uden overlap */
        .radar-header-table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin-bottom: 35px;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.06) !important;
            background: rgba(15, 23, 42, 0.6) !important;
        }
        
        .radar-header-table td {
            padding: 15px 25px !important;
            vertical-align: middle;
            box-sizing: border-box;
        }
        
        .radar-header-table .td-left {
            text-align: left !important;
            background: linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(0,0,0,0) 80%) !important;
            border-right: 1px solid rgba(255,255,255,0.08) !important;
        }
        
        .radar-header-table .td-right {
            text-align: right !important;
            background: linear-gradient(315deg, rgba(217,70,239,0.08) 0%, rgba(0,0,0,0) 80%) !important;
        }

        #view-radar .p-nm { font-size: 15px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 2px; opacity: 0.95; display: block; width: 100%; }
        .radar-header-table .td-left .p-nm { text-align: left !important; }
        .radar-header-table .td-right .p-nm { text-align: right !important; }
        
        #view-radar .p-row { display: flex; align-items: center; gap: 6px; margin-top: 6px; width: 100%; }
        .radar-header-table .td-left .p-row { justify-content: flex-start; }
        .radar-header-table .td-right .p-row { justify-content: flex-end; }
        
        #view-radar .info-tag { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.05); color: #f1f5f9; letter-spacing: 0.5px; text-transform: uppercase; display: inline-block; white-space: nowrap; }
        .radar-header-table .td-left .info-tag { border-left: 2px solid var(--radar-p1-color, #00f0ff) !important; }
        .radar-header-table .td-right .info-tag { border-right: 2px solid var(--radar-p2-color, #d946ef) !important; }

        #radar-svg-element { display: block; margin: 0 auto; overflow: visible; max-width: 100%; height: auto; }
        #view-radar .grid-poly { fill: rgba(255,255,255,0.005); stroke: rgba(255,255,255,0.1); }
        #view-radar .grid-line { stroke: rgba(255,255,255,0.075); stroke-dasharray: 4,4; }
        #view-radar .ax-lbl { font-size: 10px; fill: #94a3b8; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; font-family: 'Gabarito', sans-serif; }
        
        /* SEMANTISK FOOTER-TABEL */
        .radar-footer-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 25px;
            font-family: 'Gabarito', sans-serif;
            opacity: 0.25;
            font-size: 12px;
            text-align: center;
        }
        .radar-footer-table td { padding: 3px 0 !important; }

        #view-radar .svg-score-text { font-size: 10px; font-weight: 700; font-family: 'Gabarito', sans-serif; text-anchor: middle; }

        /* 📱 TABLET- OG MOBILOPTIMERING V5 */
        @media (max-width: 1025px) {
            #view-radar .chart-container { padding: 15px 15px !important; }
            .radar-header-table { margin-bottom: 15px !important; }
            .radar-header-table td { padding: 10px 12px !important; }
            #view-radar .p-nm { font-size: 11px !important; letter-spacing: 1px !important; }
            #view-radar .info-tag { font-size: 8.5px !important; padding: 1px 4px !important; }
            #view-radar .ax-lbl { font-size: 11px !important; font-weight: 900 !important; }
            #view-radar .svg-score-text { font-size: 11px !important; font-weight: 900 !important; }
            .radar-footer-table { font-size: 10px !important; margin-top: 15px !important; }
        }

        /* 📱 MOBILTELEFONER (Samsung S8+, iPhones under 480px) */
        @media (max-width: 480px) {
            .radar-header-table td { 
                padding: 6px 12px !important; 
            }
            
            .radar-header-table .td-right {
                text-align: right !important;
            }
            
            .radar-header-table .td-right .p-nm {
                text-align: right !important;
                width: 100% !important;
                display: block !important;
            }
            
            #view-radar .p-nm { 
                font-size: 10.5px !important; 
                letter-spacing: 0.5px !important; 
                line-height: 1.2 !important;
            }
            
            #view-radar .p-row { 
                gap: 5px !important; 
                margin-top: 5px !important;
                display: flex !important;
                flex-wrap: wrap !important;
                width: 100% !important;
            }
            
            .radar-header-table .td-left .p-row { justify-content: flex-start !important; }
            .radar-header-table .td-right .p-row { justify-content: flex-end !important; }
            
            #view-radar .info-tag { 
                font-size: 7.5px !important; 
                padding: 2px 5px !important;
                letter-spacing: 0px !important;
            }
            
            .radar-header-table .td-left .info-tag { border-left: 2px solid var(--radar-p1-color, #00f0ff) !important; border-right: none !important; }
            .radar-header-table .td-right .info-tag { border-right: 2px solid var(--radar-p2-color, #d946ef) !important; border-left: none !important; }

            
            /* 🎯 SKJUL LIGA-TEKST OG BOKS KUN PÅ MOBIL */
            #view-radar .p-row .info-tag:nth-child(3) {
                display: none !important;
            }
            
            .radar-footer-table { font-size: 8px !important; }
        }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - RADAR.JS - DEL 2 AF 6 (FRONTEND VISNING & DRAWER INITIALISERING)
// ==========================================================================

async function initRadarView(container) {
    container.innerHTML = `
        <section id="view-radar" class="content-view active">
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-circle-nodes" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Radar Chart</span>
            </div>

            <div class="control-trigger-wrapper" style="margin-bottom: 24px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Radar <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            
            <div class="wrap" id="radar-chart-only"></div>
        </section>
    `;

    const gammelRadarDrawer = document.querySelector('.radar-filter-drawer');
    if (gammelRadarDrawer) gammelRadarDrawer.remove();

    buildAndAppendRadarDrawer();
}

function buildAndAppendRadarDrawer() {
    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer radar-filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Radar Settings</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
            
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px; position: relative;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Select player 1</label>
                <div style="display: flex; gap: 10px; width: 100%;">
                    <div class="custom-select-wrapper" id="radar-player1-wrapper" style="position: relative; flex-grow: 1;">
                        <div class="custom-select-trigger" onclick="toggleRadarDropdown('player1')" style="background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                            <span id="radar-p1-selected-text">Vælg Spiller 1</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-muted);"></i>
                        </div>
                        <div class="custom-options-list" id="radar-player1-options" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--accent-purple); border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 120;">
                            <div style="position: sticky; top: 0; background: #07030c; padding: 8px; border-bottom: 1px solid var(--border-color); z-index: 130;"><input type="text" id="radar-p1-search" oninput="filterRadarPlayerList('p1')" placeholder="Search..." style="width: 100%; background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 4px; font-size: 13px; outline: none;" onclick="event.stopPropagation();"></div>
                            <div id="radar-p1-items-container"></div>
                        </div>
                    </div>
                    <input type="color" id="radar-color1-input" value="${RADAR_COLOR_1}" onchange="updateRadarColors(1)" style="width: 44px; height: 44px; background: none; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; padding: 2px;">
                </div>
            </div>

            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px; position: relative;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Select player 2</label>
                <div style="display: flex; gap: 10px; width: 100%;">
                    <div class="custom-select-wrapper" id="radar-player2-wrapper" style="position: relative; flex-grow: 1;">
                        <div class="custom-select-trigger" onclick="toggleRadarDropdown('player2')" style="background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                            <span id="radar-p2-selected-text">Vælg Spiller 2</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-muted);"></i>
                        </div>
                        <div class="custom-options-list" id="radar-player2-options" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--accent-purple); border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 120;">
                            <div style="position: sticky; top: 0; background: #07030c; padding: 8px; border-bottom: 1px solid var(--border-color); z-index: 130;"><input type="text" id="radar-p2-search" oninput="filterRadarPlayerList('p2')" placeholder="Search..." style="width: 100%; background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 4px; font-size: 13px; outline: none;" onclick="event.stopPropagation();"></div>
                            <div id="radar-p2-items-container"></div>
                        </div>
                    </div>
                    <input type="color" id="radar-color2-input" value="${RADAR_COLOR_2}" onchange="updateRadarColors(2)" style="width: 44px; height: 44px; background: none; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; padding: 2px;">
                </div>
            </div>

            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px; position: relative;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Select Metrics</label>
                <div class="multiselect" style="position: relative; width: 100%;">
                    <div class="selectBox" onclick="toggleRadarCheckboxDropdown()" style="background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span id="radar-metrics-select-text">Vælg parametre...</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-muted);"></i>
                    </div>
                    <div id="radar-checkboxes-container" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; flex-direction: column; gap: 12px; max-height: 220px; overflow-y: auto; z-index: 120;"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(drawerDiv);
    buildCategorizedRadarMetrics();
    initCustomRadarSelectors();
}

function toggleRadarCheckboxDropdown() {
    const cb = $r("radar-checkboxes-container");
    if (cb) cb.style.display = ["none", ""].includes(cb.style.display) ? "flex" : "none";
    const p1 = $r("radar-player1-options"), p2 = $r("radar-player2-options");
    if (p1) p1.style.display = "none"; if (p2) p2.style.display = "none";
}
// ==========================================================================
// PER 90 - RADAR.JS - DEL 3 AF 6 (SPIDERWEB VEKTOR-MATEMATIK)
// ==========================================================================

function buildRadarVektorSpiderweb(d1, d2) {
    const svg = $r("radar-svg-element"); if (!svg) return;
    
    const CX = 355, CY = 290, MAX_R = 210, total = d1.metrics.length, angle = (2 * Math.PI) / total;

    let markup = [52.5, 105, 157.5, 210].map(r => {
        let points = [];
        for (let i = 0; i < total; i++) points.push(`${CX + r * Math.cos(i * angle - Math.PI/2)},${CY + r * Math.sin(i * angle - Math.PI/2)}`);
        return `<polygon points="${points.join(' ')}" class="grid-poly" style="fill: none !important; stroke: rgba(255,255,255,0.1);" />`;
    }).join('');

    d1.metrics.forEach((_, i) => {
        const a = i * angle - Math.PI / 2;
        markup += `<line x1="${CX}" y1="${CY}" x2="${CX + MAX_R * Math.cos(a)}" y2="${CY + MAX_R * Math.sin(a)}" class="grid-line" />`;
    });

    const generatePlayerPathMarkup = (data, polyColor, nodeColor) => {
        if (!data || !data.metrics) return '';
        let points = [];
        data.metrics.forEach((_, i) => {
            const r = ((data.percentiles[i] || 0) / 100) * MAX_R, a = i * angle - Math.PI / 2;
            points.push(`${CX + r * Math.cos(a)},${CY + r * Math.sin(a)}`);
        });
        
        let pathMarkup = `<polygon points="${points.join(' ')}" style="fill: ${polyColor}0f; stroke: ${polyColor}; stroke-width: 2.2; stroke-linejoin: round;" />`;
        
        data.metrics.forEach((_, i) => {
            const r = ((data.percentiles[i] || 0) / 100) * MAX_R, a = i * angle - Math.PI / 2;
            pathMarkup += `<circle cx="${CX + r * Math.cos(a)}" cy="${CY + r * Math.sin(a)}" r="4.5" style="fill: ${nodeColor}; stroke: #ffffff; stroke-width: 1;" />`;
        });
        return pathMarkup;
    };

    if (d2 && d2.metrics) markup += generatePlayerPathMarkup(d2, RADAR_COLOR_2, RADAR_COLOR_2);
    markup += generatePlayerPathMarkup(d1, RADAR_COLOR_1, RADAR_COLOR_1);

    d1.metrics.forEach((metric, i) => {
        const a = i * angle - Math.PI / 2;
        const cos = Math.cos(a), sin = Math.sin(a);
        
        const tx = CX + (MAX_R + 32) * cos;
        const ty = CY + (MAX_R + 32) * sin;

        const score1 = Math.round(d1.percentiles[i] || 0);
        const score2 = d2 && d2.percentiles ? Math.round(d2.percentiles[i] || 0) : 0;

        markup += `<g transform="translate(${tx}, ${ty - 4})">`;
        
        const words = metric.split(" ");
        let boxY = 14; 

        if (words.length >= 2) {
            const line1 = words[0]; // 🎯 REPARATION: Rettet 'words' til 'words[0]', så hele arrayet ikke udskrives på én linje
            const line2 = words.slice(1).join(" ");
            markup += `
                <text x="0" y="-12" class="ax-lbl" text-anchor="middle" dominant-baseline="central">${line1}</text>
                <text x="0" y="2" class="ax-lbl" text-anchor="middle" dominant-baseline="central">${line2}</text>
            `;
        } else {
            markup += `<text x="0" y="-5" class="ax-lbl" text-anchor="middle" dominant-baseline="central">${metric}</text>`;
            boxY = 11;
        }

        // Beregner det absolutte midtpunkt for x i boksene ud fra boksbredden på 25px
        const b1X = -27;
        const b1Center = b1X + 12.5;
        
        const b2X = 2;
        const b2Center = b2X + 12.5;
        
        // Beregner det præcise lodrette y-midtpunkt i forhold til boksens top (boxY) og dens højde på 15px
        const textY = boxY + 7.5;

        // 🎯 DESIGNREPARATION: text-anchor="middle" er nu bagt direkte ind som en HTML-attribut på teksten.
        // dy="3.5" fjerner baseline-skævheden på tværs af både live browser-engine og html2canvas-canvas.
        markup += `
                <rect x="${b1X}" y="${boxY}" width="25" height="15" rx="4" style="fill: ${RADAR_COLOR_1}0a; stroke: ${RADAR_COLOR_1}; stroke-width: 1;" />
                <text x="${b1Center}" y="${textY}" dy="3.5" text-anchor="middle" class="svg-score-text" style="fill: ${RADAR_COLOR_1}; font-weight: 900;">${score1}</text>
                
                <rect x="${b2X}" y="${boxY}" width="25" height="15" rx="4" style="fill: ${RADAR_COLOR_2}0a; stroke: ${RADAR_COLOR_2}; stroke-width: 1;" />
                <text x="${b2Center}" y="${textY}" dy="3.5" text-anchor="middle" class="svg-score-text" style="fill: ${RADAR_COLOR_2}; font-weight: 900;">${d2 ? score2 : '-'}</text>
            </g>
        `;
    });

    svg.innerHTML = markup + `<circle cx="${CX}" cy="${CY}" r="4" fill="#ffffff" />`;
}

// ==========================================================================
// PER 90 - RADAR.JS - DEL 4 AF 6 (FARVESTYRING & FILTER LOGIK)
// ==========================================================================

function updateRadarColors(playerNum) {
    if (playerNum === 1) {
        const input1 = $r("radar-color1-input");
        if (input1) {
            RADAR_COLOR_1 = input1.value;
            document.documentElement.style.setProperty('--radar-p1-color', RADAR_COLOR_1);
            
            const name1 = document.querySelector(".radar-header-table .td-left .p-nm");
            if (name1) name1.style.color = RADAR_COLOR_1;
        }
    } else if (playerNum === 2) {
        const input2 = $r("radar-color2-input");
        if (input2) {
            RADAR_COLOR_2 = input2.value;
            document.documentElement.style.setProperty('--radar-p2-color', RADAR_COLOR_2);
            
            const name2 = document.querySelector(".radar-header-table .td-right .p-nm");
            if (name2) name2.style.color = RADAR_COLOR_2;
        }
    }
    onRadarFilterChange();
}


async function onRadarFilterChange() {
    if (!RADAR_PLAYER_1) return;
    const checkboxes = document.querySelectorAll('#radar-checkboxes-container input[type="checkbox"]');
    const selected = [...checkboxes].filter(cb => cb.checked).map(cb => cb.value);
    const selectText = $r("radar-metrics-select-text");
    if (selectText) {
        selectText.innerText = selected.length === checkboxes.length ? "All metrics chosen" :
                               selected.length === 0 ? "No metrics chosen" : `${selected.length}/${checkboxes.length} chosen`;
    }
    const lowMetrics = selected.length < 3;
    if ($r("radar-warning-overlay")) $r("radar-warning-overlay").style.display = lowMetrics ? "flex" : "none";
    if (!lowMetrics) await loadRadarChartDataWithFilters(RADAR_PLAYER_1, RADAR_PLAYER_2, selected);
}
// ==========================================================================
// PER 90 - RADAR.JS - DEL 5 AF 6 (CACHET SPILLERSØGNING)
// ==========================================================================

let RADAR_CACHED_P1_ITEMS = null;
let RADAR_CACHED_P2_ITEMS = null;
let RADAR_SEARCH_DEBOUNCE_TIMER = null;

function filterRadarPlayerList(type) {
    clearTimeout(RADAR_SEARCH_DEBOUNCE_TIMER);
    RADAR_SEARCH_DEBOUNCE_TIMER = setTimeout(() => {
        const filter = $r(`radar-${type}-search`)?.value.toLowerCase();
        if (filter === undefined) return;
        
        if (type === 'p1' && !RADAR_CACHED_P1_ITEMS) {
            RADAR_CACHED_P1_ITEMS = document.querySelectorAll("#radar-p1-items-container .custom-option-item");
        } else if (type === 'p2' && !RADAR_CACHED_P2_ITEMS) {
            RADAR_CACHED_P2_ITEMS = document.querySelectorAll("#radar-p2-items-container .custom-option-item");
        }
        
        const cachedItems = (type === 'p1') ? RADAR_CACHED_P1_ITEMS : RADAR_CACHED_P2_ITEMS;
        let matchesFound = 0;
        
        for (let i = 0; i < cachedItems.length; i++) {
            const item = cachedItems[i];
            if (filter === "") {
                item.style.display = i < 30 ? "block" : "none";
            } else {
                if (item.innerText.toLowerCase().includes(filter) && matchesFound < 30) {
                    item.style.display = "block";
                    matchesFound++;
                } else {
                    item.style.display = "none";
                }
            }
        }
    }, 150);
}

function resetRadarPlayerSearch(type) {
    if ($r(`radar-${type}-search`)) { 
        $r(`radar-${type}-search`).value = ""; 
        if (type === 'p1') {
            RADAR_CACHED_P1_ITEMS = document.querySelectorAll("#radar-p1-items-container .custom-option-item");
            for (let i = 0; i < RADAR_CACHED_P1_ITEMS.length; i++) {
                RADAR_CACHED_P1_ITEMS[i].style.display = i < 30 ? "block" : "none";
            }
        } else {
            RADAR_CACHED_P2_ITEMS = document.querySelectorAll("#radar-p2-items-container .custom-option-item");
            for (let i = 0; i < RADAR_CACHED_P2_ITEMS.length; i++) {
                RADAR_CACHED_P2_ITEMS[i].style.display = i < 30 ? "block" : "none";
            }
        }
    }
}
// ==========================================================================
// PER 90 - RADAR.JS - DEL 6 - APART A (HOVEDFUNKTIONER & HTML-SKABELON)
// ==========================================================================

function toggleRadarDropdown(type) {
    const p1Opt = $r("radar-player1-options"), p2Opt = $r("radar-player2-options");
    if (p1Opt && type !== 'player1') p1Opt.style.display = "none";
    if (p2Opt && type !== 'player2') p2Opt.style.display = "none";
    
    if (type === 'player1' && p1Opt) {
        const isOpening = p1Opt.style.display === "none" || p1Opt.style.display === "";
        p1Opt.style.display = isOpening ? "block" : "none";
        if (isOpening) { resetRadarPlayerSearch('p1'); setTimeout(() => $r("radar-p1-search")?.focus(), 50); }
    } else if (type === 'player2' && p2Opt) {
        const isOpening = p2Opt.style.display === "none" || p2Opt.style.display === "";
        p2Opt.style.display = isOpening ? "block" : "none";
        if (isOpening) { resetRadarPlayerSearch('p2'); setTimeout(() => $r("radar-p2-search")?.focus(), 50); }
    }
}

async function initCustomRadarSelectors() {
    try {
        const players = await fetch(`${API_BASE_URL}/api/pizza/players`).then(r => r.json());
        if (players.length > 1 && $r("radar-p1-items-container") && $r("radar-p2-items-container")) {
            RADAR_PLAYER_1 = players[0]; RADAR_PLAYER_2 = players[1]; 
            $r("radar-p1-selected-text").innerText = RADAR_PLAYER_1;
            $r("radar-p2-selected-text").innerText = RADAR_PLAYER_2;
            
            $r("radar-p1-items-container").innerHTML = players.map(p => `<div class="custom-option-item ${p === RADAR_PLAYER_1 ? 'selected-active' : ''}" onclick="selectRadarItem('player1', '${p.replace(/'/g, "\\\\'")}')">${p}</div>`).join('');
            $r("radar-p2-items-container").innerHTML = players.map(p => `<div class="custom-option-item ${p === RADAR_PLAYER_2 ? 'selected-active' : ''}" onclick="selectRadarItem('player2', '${p.replace(/'/g, "\\\\'")}')">${p}</div>`).join('');
        }
        await onRadarFilterChange();
    } catch (e) { console.error("Fejl under indlæsning:", e); }
}

async function selectRadarItem(type, value) {
    if (type === 'player1') { RADAR_PLAYER_1 = value; $r("radar-p1-selected-text").innerText = value; }
    else if (type === 'player2') { RADAR_PLAYER_2 = value; $r("radar-p2-selected-text").innerText = value; }
    const optEl = $r(`radar-${type}-options`); if (optEl) optEl.style.display = "none";
    await onRadarFilterChange();
}

function buildCategorizedRadarMetrics() {
    const container = $r("radar-checkboxes-container"); if (!container) return;
    const colors = { "Shooting": "#ff007f", "Passing": "#00ffd5", "Possession": "#ffb700", "Defending": "#00ff66" };
    const defaults = ["Goals", "Assists", "Successful Dribbles", "Tackles Won %"];
    container.innerHTML = Object.entries(RADAR_CATEGORIES).map(([cat, metrics]) => {
        const c = colors[cat] || "var(--accent-purple)";
        const body = Object.values(metrics).map(m => {
            const checked = defaults.includes(m);
            return `<label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; color: var(--text-primary); transition: opacity 0.2s; opacity: ${checked ? 1 : 0.35};"><input type="checkbox" value="${m}" ${checked ? "checked" : ""} onchange="this.parentElement.style.opacity = this.checked ? '1' : '0.35'; onRadarFilterChange();" style="accent-color: ${c}; cursor: pointer;">${m}</label>`;
        }).join('');
        return `<div style="margin-bottom: 12px;"><div style="font-size: 11px; color: ${c}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid ${c}44; padding-bottom: 4px; margin-bottom: 6px;">${cat}</div><div style="display: flex; flex-direction: column; gap: 6px; padding-left: 4px;">${body}</div></div>`;
    }).join('');
}

async function loadRadarChartDataWithFilters(p1, p2, metricsList) {
    try {
        let p1Url = `${API_BASE_URL}/api/radar?player=${encodeURIComponent(p1)}&compare_pos=`;
        let p2Url = `${API_BASE_URL}/api/radar?player=${encodeURIComponent(p2)}&compare_pos=`;
        metricsList.forEach(m => { p1Url += `&metrics=${encodeURIComponent(m)}`; p2Url += `&metrics=${encodeURIComponent(m)}`; });
        
        const [d1, d2] = await Promise.all([ fetch(p1Url).then(r => r.json()), fetch(p2Url).then(r => r.json()).catch(() => null) ]);
        const chartContainer = $r("radar-chart-only"); if (!chartContainer) return;

        chartContainer.innerHTML = `
            <div class="chart-container" id="radar-capture-target-area" style="position: relative;">
                
                <!-- 🎯 SEMANTISK TOPBJÆLKE: Låser spiller 1 og 2 i en perfekt, urokkelig tabel-struktur -->
                <table class="radar-header-table">
                    <tr>
                        <td class="td-left">
                            <h2 class="p-nm" style="color: ${RADAR_COLOR_1};">${d1.player_name}</h2>
                            <div class="p-row">
                                <span class="info-tag">${d1.player_pos || 'N/A'}</span>
                                <span class="info-tag">${d1.mins_played || 0} MIN.</span>
                                <span class="info-tag">${d1.league || 'N/A'}</span>
                            </div>
                        </td>
                        <td class="td-right">
                            <h2 class="p-nm" style="color: ${RADAR_COLOR_2};">${d2 && d2.player_name ? d2.player_name : 'No Compare'}</h2>
                            <div class="p-row">
                                <span class="info-tag">${d2 ? d2.player_pos : 'N/A'}</span>
                                <span class="info-tag">${d2 ? d2.mins_played : 0} MIN.</span>
                                <span class="info-tag">${d2 ? d2.league : 'N/A'}</span>
                            </div>
                        </td>
                    </tr>
                </table>
                
                <!-- 🎯 NYT COV-OVERLAY: Smækker advarslen på hvis der er 2 eller færre metrics (skjult som default) -->
                <div id="radar-warning-overlay" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(11, 6, 18, 0.95); border-radius: 0px; justify-content: center; align-items: center; z-index: 150;">
                    <div style="color: #ff007f; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Gabarito', sans-serif;">Choose at least 3 metrics</div>
                </div>
                
                <svg width="710" height="600" viewBox="0 0 710 600" id="radar-svg-element"></svg>

                <table class="radar-footer-table">
                    <tr><td>Percentile Spiderweb Comparison</td></tr>
                    <tr><td style="opacity:0.6;">Generated via per-90.streamlit.app</td></tr>
                </table>
            </div>
            
            <div style="display: flex; justify-content: center; margin-top: 24px;">
                <button onclick="downloadRadarPNG()" style="background: var(--accent-purple); color: #06140c; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px; transition: opacity 0.2s;">Download as PNG</button>
            </div>
        `;
        
        // Tvinger overlay-boksen frem med det samme her, hvis listen fejler kravet
        const lowMetrics = metricsList.length < 3;
        const overlay = $r("radar-warning-overlay");
        if (overlay) {
            overlay.style.display = lowMetrics ? "flex" : "none";
        }

        if (!lowMetrics) {
            buildRadarVektorSpiderweb(d1, d2);
        }
    } catch (e) { console.error("Radar motorfejl:", e); }
}

// ==========================================================================
// PER 90 - RADAR.JS - DEL 6 - APART B (ISOLERET DOWNLOAD-MOTOR)
// ==========================================================================

// ==========================================================================
// PER 90 - RADAR.JS - DEL 6 - PART B - SPLIT 1 (KLONING & OVERRIDE STYLE)
// ==========================================================================

// ==========================================================================
// PER 90 - RADAR.JS - DEL 6 - PART B - SPLIT 1 (KLONING & OVERRIDE STYLE)
// ==========================================================================

// ==========================================================================
// PER 90 - RADAR.JS - DEL 6 - PART B - SPLIT 1 (KLONING & OVERRIDE STYLE)
// ==========================================================================

function downloadRadarPNG() {
    const originalEl = $r("radar-capture-target-area"); if (!originalEl) return;
    
    const hiddenContainer = document.createElement("div");
    Object.assign(hiddenContainer.style, {
        position: "absolute", left: "-9999px", top: "-9999px",
        width: "710px", minWidth: "710px", maxWidth: "710px", overflow: "visible"
    });
    
    const clone = originalEl.cloneNode(true);
    clone.id = "radar-download-clone";
    
    Object.assign(clone.style, {
        width: "710px", minWidth: "710px", maxWidth: "710px",
        padding: "30px", background: "#0B1220", boxSizing: "border-box"
    });
    
    hiddenContainer.appendChild(clone);
    
    const overrideStyle = document.createElement("style");
    overrideStyle.innerHTML = `
        /* Overstyrer AL global responsive CSS udelukkende dybt inde i klonen under download */
        #radar-download-clone table.radar-header-table { 
            margin-bottom: 35px !important; 
            background: rgba(15, 23, 42, 0.6) !important;
            border-collapse: collapse !important;
            display: table !important;
            width: 100% !important;
            border: 1px solid rgba(255,255,255,0.06) !important;
            border-radius: 14px !important;
            overflow: hidden !important;
        }
        
        /* Fastlåser højden og polstringen på cellerne totalt uanset enhedens skærmstørrelse */
        #radar-download-clone table.radar-header-table td { 
            padding: 18px 25px !important; 
            background: none !important;
            height: 80px !important;
            box-sizing: border-box !important;
        }
        
        #radar-download-clone table.radar-header-table td.td-left { 
            text-align: left !important; 
            background: linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(0,0,0,0) 80%) !important;
            border-right: 1px solid rgba(255,255,255,0.08) !important;
        }
        
        #radar-download-clone table.radar-header-table td.td-right { 
            text-align: right !important; 
            background: linear-gradient(315deg, rgba(217,70,239,0.08) 0%, rgba(0,0,0,0) 80%) !important;
        }
        
        /* 🎯 FASTLÅST LINE-HEIGHT: Sikrer at afstanden fra tekstens bund altid er præcis ens */
        #radar-download-clone .p-nm { 
            font-size: 15px !important; 
            letter-spacing: 2px !important; 
            line-height: 18px !important; 
            margin: 0 !important;
            padding: 0 !important;
            display: block !important; 
            width: 100% !important; 
            opacity: 0.95 !important; 
        }
        #radar-download-clone table.radar-header-table td.td-left .p-nm { text-align: left !important; }
        #radar-download-clone table.radar-header-table td.td-right .p-nm { text-align: right !important; }
        
        /* 🎯 FASTLÅST MARGIN: Tvinger afstanden mellem navn og tags til at være nøjagtig 6px på alle enheder */
        #radar-download-clone .p-row { 
            margin-top: 6px !important; 
            margin-bottom: 0 !important;
            padding: 0 !important;
            gap: 6px !important; 
            display: flex !important; 
            flex-wrap: nowrap !important; 
            width: 100% !important; 
            line-height: 1 !important;
        }
        #radar-download-clone table.radar-header-table td.td-left .p-row { justify-content: flex-start !important; }
        #radar-download-clone table.radar-header-table td.td-right .p-row { justify-content: flex-end !important; }
        
        #radar-download-clone .info-tag { 
            font-size: 11px !important; 
            padding: 2px 6px !important; 
            letter-spacing: 0.5px !important; 
            display: inline-block !important; 
            background: rgba(255,255,255,0.05) !important; 
            border-radius: 4px !important; 
            line-height: 14px !important;
            height: 18px !important;
            box-sizing: border-box !important;
        }
        #radar-download-clone table.radar-header-table td.td-left .info-tag { border-left: 2px solid var(--radar-p1-color, #00f0ff) !important; }
        #radar-download-clone table.radar-header-table td.td-right .info-tag { border-right: 2px solid var(--radar-p2-color, #d946ef) !important; }

        #radar-download-clone .p-row .info-tag:nth-child(3) { display: inline-block !important; }
        
        #radar-download-clone .ax-lbl { font-size: 10px !important; font-weight: 800 !important; }
        #radar-download-clone .svg-score-text { font-size: 10px !important; font-weight: 700 !important; }
        
        #radar-download-clone .radar-footer-table { 
            font-size: 12px !important; 
            margin-top: 25px !important; 
            color: #ffffff !important;
            opacity: 1 !important; /* Nulstiller den kollektive gennemsigtighed */
        }
        #radar-download-clone .radar-footer-table tr:nth-child(1) td {
            opacity: 0.95 !important; /* Den øverste linje står helt skarpt */
        }
        #radar-download-clone .radar-footer-table tr:nth-child(2) td {
            opacity: 0.6 !important; /* Den nederste linje dæmpes præcis som på live-appen */
        }
        
        /* Skrubber tal en ekstra tak op på det downloadede billede */
        #radar-download-clone .svg-score-text {
            dy: 2.5px !important;
        }
    `;
    
    document.body.appendChild(hiddenContainer);
    document.body.appendChild(overrideStyle);


    setTimeout(() => {
        html2canvas(clone, { 
            scale: 4, 
            pixelRatio: 1, 
            backgroundColor: "#0B1220", 
            useCORS: true, 
            logging: false 
        }).then(canvas => {
            const link = document.createElement("a"); 
            link.download = `radar_comparison.png`;
            link.href = canvas.toDataURL("image/png"); 
            link.click();
            hiddenContainer.remove(); overrideStyle.remove();
        }).catch(e => { 
            console.error("Fejl under klonet radar-download:", e); 
            hiddenContainer.remove(); overrideStyle.remove(); 
        });
    }, 60);
}

document.addEventListener("click", e => {
    if (!e.target.closest('#radar-player1-wrapper')) { const p = $r("radar-player1-options"); if(p) p.style.display = "none"; }
    if (!e.target.closest('#radar-player2-wrapper')) { const p = $r("radar-player2-options"); if(p) p.style.display = "none"; }
    if (!e.target.closest('.multiselect')) { const cb = $r("radar-checkboxes-container"); if(cb) cb.style.display = "none"; }
});

