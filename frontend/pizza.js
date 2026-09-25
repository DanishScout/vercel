// ==========================================================================
// PER 90 - PIZZA.JS - DEL 1 AF 7 (MASTER CONFIG & STATISKE PARAMETRE)
// ==========================================================================

const AVAILABLE_PIZZA_METRICS = [
    "Goals", "npxG", "Shots On Target", "On Target %", "Created Own Shot", "Total Shots", "Shots Outside Box", "Shots Inside Box",
    "Assists", "xA", "Key Passes", "xT via Live Passes", "Progressive Passes", "Passes Into Final 3rd", "Forward Passes", "Passes in Opp. Half", "Passes in Own Half", "Accurate Passes", "Accurate Long Balls", "Accurate Crosses", "Pass Accuracy %", "Long Ball Accuracy %", "Cross Accuracy %",
    "Successful Dribbles", "Dribble Attempts", "Dribble Success %", "Progressive Carries", "xT via Prog. Carries", "Carries Into Final ⅓", "Touches In Opp. Box", "Fouls Drawn",
    "Tackles Won %", "Aerials Won %", "Duels Won %", "Tackles Won", "Aerials Won", "Duels Won", "Clearances", "Blocked Shots", "Interceptions"
];

const PIZZA_CATEGORIES = {
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

let CURRENT_SELECTED_PLAYER = "", CURRENT_SELECTED_POS = "";
if (typeof window.pizzaChartInstance === 'undefined') window.pizzaChartInstance = null;

const $ = id => document.getElementById(id);
const toggleDisplay = (el, show) => el && (el.style.display = show ? "block" : "none");
/* ==========================================================================
/* PER 90 - PIZZA.JS - DEL 2 AF 7 (RUNTIME DESIGN & RESPONSIV TABEL-CSS)
// ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-option-item { padding: 10px 14px; color: #f3f1f6; cursor: pointer; font-size: 14px; transition: all 0.15s ease; font-family: 'Gabarito', sans-serif; }
        .custom-option-item:hover { background-color: rgba(147, 51, 234, 0.2) !important; color: #ffffff !important; padding-left: 18px; }
        .custom-option-item.selected-active { background-color: #581c87 !important; color: #ffffff !important; }

        #chart-only { position: relative; padding: 25px 25px 25px; border-radius: 24px; width: 100%; max-width: 710px; border: 1px solid rgba(255,255,255,.05); box-shadow: 0 40px 80px -20px #000; box-sizing: border-box; overflow: hidden; background: #0B1220; display: flex; flex-direction: column; align-items: center; margin: 20px auto !important; font-family: 'Gabarito', sans-serif; color: #e5e7eb; }
        #chart-only::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(#0e1726, #070b12); z-index: 0; border-radius: 24px; }
        
        /* 📈 MODERNISERET HEADER-TABEL */
        .pizza-header-profile-table {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 610px;
            margin: 10px auto 20px;
            background: transparent;
            border-collapse: collapse !important;
        }
        
        .pizza-header-profile-table td {
            padding: 0px !important;
            box-sizing: border-box;
            vertical-align: middle;
        }
        
        /* 📈 NY NAVNESTIL */
        .p-nm { font-size: 28px; font-weight: 900; margin: 0 0 8px; text-transform: uppercase; letter-spacing: -1px; color: #fff; text-align: left; }
        
        /* LINJE MED GLOW EFFECT */
        .tactic-line { width: 100%; height: 3px; margin-bottom: 16px; display: block; border: none; border-radius: 2px; }

        /* NY MODERNE METADATA STRUKTUR */
        .pizza-meta-container {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
            justify-content: flex-start;
        }
        
        .meta-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.03);
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .5px;
            color: #94a3b8;
            white-space: nowrap;
            transition: all 0.2s ease;
        }

        .meta-pill svg { opacity: .9; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; width: 14px; height: 14px; }
        .logo-shape { display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: rgba(255,255,255,0.02); border-radius: 4px; padding: 1px; box-sizing: border-box; }
        .club-crest-small { width: 100%; height: 100%; object-fit: contain; }
        .data-val { color: #ffffff; font-weight: 700; }
        
        /* DIAGRAM PLACERING */
        #pizza-svg-element { display: block; margin: 5px auto 0; overflow: visible; max-width: 100%; height: auto; position: relative; z-index: 1; }
        
        .grid-circle { fill: none; stroke: rgba(255, 255, 255, 0.12); stroke-width: 1; }
        .grid-line { stroke: rgba(255, 255, 255, 0.08); stroke-width: 1; }
        .ax-lbl { font-size: 12px; fill: #94a3b8; font-weight: 700; letter-spacing: .3px; }
        
        .slice-b { stroke-width: 1.75; stroke-linejoin: round; }
        .box-bg-rect { fill: #111827 !important; stroke-width: 1.5 !important; }
        .tx-b { font-size: 11px; font-weight: 900; }
        
        .pizza-footer-table {
            width: 100% !important;
            border-collapse: collapse !important;
            text-align: center;
            position: relative;
            z-index: 2;
            margin-top: 15px;
            font-family: 'Gabarito', sans-serif;
        }
        .pizza-footer-table td { padding: 2px 40px !important; font-size: 11px; font-weight: 500; color: #64748b; letter-spacing: .4px; box-sizing: border-box; }
        .pizza-footer-table .footer-line-bottom { opacity: 0.6; font-size: 11px; }

        @media (max-width: 1025px) {
            .p-nm { font-size: 24px !important; margin-bottom: 6px !important; }
            .tactic-line { margin-bottom: 12px !important; }
            .meta-pill { font-size: 10px !important; padding: 5px 10px !important; }
            .meta-pill svg { width: 12px !important; height: 12px !important; }
            .logo-shape { width: 16px !important; height: 16px !important; }
            .ax-lbl { font-size: 11px !important; }
        }

        @media (max-width: 480px) {
            .pizza-header-profile-table { max-width: 100% !important; margin-bottom: 12px !important; }
            .p-nm { font-size: 18px !important; margin-bottom: 4px !important; letter-spacing: -0.5px !important; }
            .tactic-line { margin-bottom: 8px !important; height: 2px !important; }
            .pizza-meta-container { gap: 4px !important; }
            .meta-pill { font-size: 8.5px !important; padding: 4px 8px !important; border-radius: 6px !important; }
            .meta-pill svg { width: 10px !important; height: 10px !important; stroke-width: 2.5 !important; }
            .logo-shape { width: 12px !important; height: 12px !important; }
            .pizza-footer-table td { font-size: 8px !important; }
        }
    `;
    document.head.appendChild(style);
});

// ==========================================================================
// PER 90 - PIZZA.JS - DEL 3 AF 7 (FRONTEND VIEW INITIALISERING)
// ==========================================================================

async function initPizzaView(container) {
    container.innerHTML = `
        <section id="view-pizza" class="content-view active">
            <div class="chart-header-container">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Pizza Chart</span>
            </div>

            <div class="control-trigger-wrapper" style="margin-bottom: 24px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Chart <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>

            <div id="chart-only"></div>
            
            <div class="download" style="display: flex; justify-content: center; margin-top: 24px;">
                <button onclick="downloadPNG()" style="background: var(--accent-purple); color: #06140c; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; cursor: pointer;">Download as PNG</button>
            </div>
        </section>
    `;

    const gammelDrawer = document.querySelector('.filter-drawer');
    if (gammelDrawer) gammelDrawer.remove();

    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Chart Settings</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
            
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px; width: 100%; position: relative;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Select player</label>
                <div class="custom-select-wrapper" id="custom-player-wrapper" style="position: relative; width: 100%;">
                    <div class="custom-select-trigger" onclick="toggleCustomDropdown('player')" style="background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span id="custom-player-selected-text">Indlæser...</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-muted);"></i>
                    </div>
                    <div class="custom-options-list" id="custom-player-options" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--accent-purple); border-radius: 6px; max-height: 250px; overflow-y: auto; z-index: 120;">
                        <div style="position: sticky; top: 0; background: #07030c; padding: 8px; border-bottom: 1px solid var(--border-color); z-index: 130;"><input type="text" id="player-search-input" oninput="filterPlayerList()" placeholder="Search..." style="width: 100%; background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 4px; font-size: 13px; outline: none;" onclick="event.stopPropagation();"></div>
                        <div id="custom-player-items-container"></div>
                    </div>
                </div>
            </div>

            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px; width: 100%; position: relative;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Compare against</label>
                <div class="custom-select-wrapper" id="custom-pos-wrapper" style="position: relative; width: 100%;">
                    <div class="custom-select-trigger" onclick="toggleCustomDropdown('pos')" style="background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span id="custom-pos-selected-text">Indlæser...</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-muted);"></i>
                    </div>
                    <div class="custom-options-list" id="custom-pos-options" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--accent-purple); border-radius: 6px; max-height: 250px; overflow-y: auto; z-index: 120;"></div>
                </div>
            </div>

            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px; width: 100%; position: relative;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Select Metrics</label>
                <div class="multiselect" style="position: relative; width: 100%;">
                    <div class="selectBox" onclick="toggleCheckboxDropdown()" style="background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span id="metrics-select-text">Vælg parametre...</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-muted);"></i>
                    </div>
                    <div id="checkboxes-container" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; flex-direction: column; gap: 12px; max-height: 300px; overflow-y: auto; z-index: 120;"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(drawerDiv);

    buildCategorizedMetrics();
    await initCustomPizzaSelectors();
}
function buildPizzaVektorChart(data, selectedColor) {
    const svg = $("pizza-svg-element"); if (!svg) return;
    
    // 🎯 MIKROSKOPISK JUSTERING FOR AT UNDGÅ CLIPPING
    // Radius er sat ned fra 255 til 240. Centrum (CX, CY) bevares.
    const CX = 355, CY = 295, MAX_R = 240, total = data.metrics.length, angle = (2 * Math.PI) / total;
    
    const catColors = { 
        "Shooting": "#e11d48",   
        "Passing": "#2563eb",    
        "Possession": "#d97706", 
        "Defending": "#16a34a"   
    };
    
    // Beregner de fire nye grid-cirkler baseret på den nye max radius (240 / 4 = 60)
    let markup = [60, 120, 180, 240].map(r => `<circle cx="${CX}" cy="${CY}" r="${r}" class="grid-circle" />`).join('');

    data.metrics.forEach((metric, i) => {
        const rawScore = data.percentiles[i], score = Math.round(rawScore), currentR = (rawScore / 100) * MAX_R;
        const sA = (i * angle) - Math.PI / 2, eA = sA + angle, midA = sA + angle / 2;
        const cos = Math.cos(midA), sin = Math.sin(midA);

        let cat = Object.keys(PIZZA_CATEGORIES).find(k => Object.values(PIZZA_CATEGORIES[k]).includes(metric)) || "Shooting";
        const c = catColors[cat] || selectedColor;

        if (currentR > 0) {
            markup += `<path d="M ${CX} ${CY} L ${CX + currentR * Math.cos(sA)} ${CY + currentR * Math.sin(sA)} A ${currentR} ${currentR} 0 ${angle > Math.PI ? 1 : 0} 1 ${CX + currentR * Math.cos(eA)} ${CY + currentR * Math.sin(eA)} Z" class="slice-b" fill="${c}" fill-opacity="0.15" stroke="${c}" stroke-width="8" stroke-linejoin="round" />`;
        }

        markup += `<line x1="${CX}" y1="${CY}" x2="${CX + MAX_R * Math.cos(sA)}" y2="${CY + MAX_R * Math.sin(sA)}" class="grid-line" />`;
        
        const ord = metric.split(" ");
        
        // 🎯 TEKST-RADIUS ØGET: Sat op til 285 (før 272) for at skubbe titlerne 
        // væk fra diagrammets yderkant, så de ikke kolliderer med 100-talboksene.
        const textX = CX + 285 * cos;
        const textY = CY + 285 * sin;

        if (ord.length > 1) {

            let linje1 = ord[0];
            let linje2 = ord.slice(1).join(" ");

            if (ord.length === 3) {
                const alt1 = ord[0];                             
                const alt2 = ord.slice(1).join(" ");            
                const test1 = ord.slice(0, 2).join(" ");        
                const test2 = ord[2];                           
                
                if (Math.max(alt1.length, alt2.length) < Math.max(test1.length, test2.length)) {
                    linje1 = alt1; linje2 = alt2;
                } else {
                    linje1 = test1; linje2 = test2;
                }
            } else if (ord.length > 3) {
                const midtpunkt = Math.ceil(ord.length / 2);
                linje1 = ord.slice(0, midtpunkt).join(" ");
                linje2 = ord.slice(midtpunkt).join(" ");
            }
            
            markup += `<text x="${textX}" y="${textY - 7}" class="ax-lbl" style="font-family: 'Gabarito', sans-serif;" text-anchor="middle" dominant-baseline="middle">${linje1}</text>`;
            markup += `<text x="${textX}" y="${textY + 9}" class="ax-lbl" style="font-family: 'Gabarito', sans-serif;" text-anchor="middle" dominant-baseline="middle">${linje2}</text>`;
        } else {
            markup += `<text x="${textX}" y="${textY}" class="ax-lbl" style="font-family: 'Gabarito', sans-serif;" text-anchor="middle" dominant-baseline="middle">${metric}</text>`;
        }

        if (score > 15) {
            markup += `<g><rect x="${CX + currentR * cos - 13}" y="${CY + currentR * sin - 7}" width="26" height="14" rx="2" class="box-bg-rect" stroke="${c}" stroke-width="1.5" /><text x="${CX + currentR * cos}" y="${CY + currentR * sin}" class="tx-b" style="font-family: 'Gabarito', sans-serif; fill: #ffffff !important;" text-anchor="middle" dominant-baseline="central">${score}</text></g>`;
        }

    });

    svg.innerHTML = markup + `<circle cx="${CX}" cy="${CY}" r="10" fill="#0B1220" stroke="#ffffff" stroke-width="2.5" />;`;
}



// ==========================================================================
// PER 90 - PIZZA.JS - DEL 5 AF 7 (CACHET SPILLERSØGNING & DROPDOWN SYNC)
// ==========================================================================

async function onPizzaFilterChange() {
    if (!CURRENT_SELECTED_PLAYER || !CURRENT_SELECTED_POS) return;
    const checkboxes = document.querySelectorAll('#checkboxes-container input[type="checkbox"]');
    const selected = [...checkboxes].filter(cb => cb.checked).map(cb => cb.value);
    const selectText = $("metrics-select-text");
    if (selectText) {
        selectText.innerText = selected.length === checkboxes.length ? "All metrics selected" :
                               selected.length === 0 ? "No metrics chosen" : `${selected.length}/${checkboxes.length} chosen`;
    }
    const lowMetrics = selected.length < 3;
    if ($("pizza-warning-overlay")) $("pizza-warning-overlay").style.display = lowMetrics ? "flex" : "none";
    if (!lowMetrics) await loadPizzaChartDataWithFilters(CURRENT_SELECTED_PLAYER, CURRENT_SELECTED_POS, selected);
}

let PIZZA_CACHED_PLAYER_ITEMS = null;
let PIZZA_SEARCH_DEBOUNCE_TIMER = null;

function filterPlayerList() {
    clearTimeout(PIZZA_SEARCH_DEBOUNCE_TIMER);
    PIZZA_SEARCH_DEBOUNCE_TIMER = setTimeout(() => {
        const filter = $("player-search-input")?.value.toLowerCase();
        if (filter === undefined) return;
        
        if (!PIZZA_CACHED_PLAYER_ITEMS) {
            PIZZA_CACHED_PLAYER_ITEMS = document.querySelectorAll("#custom-player-items-container .custom-option-item");
        }
        
        let matchesFound = 0;
        for (let i = 0; i < PIZZA_CACHED_PLAYER_ITEMS.length; i++) {
            const item = PIZZA_CACHED_PLAYER_ITEMS[i];
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

function resetPlayerSearch() {
    if ($("player-search-input")) { 
        $("player-search-input").value = ""; 
        PIZZA_CACHED_PLAYER_ITEMS = document.querySelectorAll("#custom-player-items-container .custom-option-item");
        for (let i = 0; i < PIZZA_CACHED_PLAYER_ITEMS.length; i++) {
            PIZZA_CACHED_PLAYER_ITEMS[i].style.display = i < 30 ? "block" : "none";
        }
    }
}

function toggleCustomDropdown(type) {
    const pOpt = $("custom-player-options"), posOpt = $("custom-pos-options");
    if (type === 'player') {
        const isOpening = pOpt?.style.display === "none" || pOpt?.style.display === "";
        if (pOpt) pOpt.style.display = isOpening ? "block" : "none"; 
        if (posOpt) posOpt.style.display = "none";
        if (isOpening) { resetPlayerSearch(); setTimeout(() => $("player-search-input")?.focus(), 50); }
    } else if (type === 'pos') {
        if (posOpt) posOpt.style.display = posOpt.style.display === "none" ? "block" : "none";
        if (pOpt) pOpt.style.display = "none";
    }
}

function toggleCheckboxDropdown() {
    const cb = $("checkboxes-container");
    if (cb) cb.style.display = ["none", ""].includes(cb.style.display) ? "flex" : "none";
    const pOpt = $("custom-player-options"), posOpt = $("custom-pos-options");
    if (pOpt) pOpt.style.display = "none"; if (posOpt) posOpt.style.display = "none";
}

async function initCustomPizzaSelectors() {
    try {
        const [players, positions] = await Promise.all([
            fetch(`${API_BASE_URL}/api/pizza/players`).then(r => r.json()),
            fetch(`${API_BASE_URL}/api/pizza/positions`).then(r => r.json())
        ]);
        
        if (players.length > 0 && $("custom-player-items-container")) {
            CURRENT_SELECTED_PLAYER = players[0]; 
            $("custom-player-selected-text").innerText = CURRENT_SELECTED_PLAYER;
            $("custom-player-items-container").innerHTML = players.map(p => `<div class="custom-option-item ${p === CURRENT_SELECTED_PLAYER ? 'selected-active' : ''}" onclick="selectCustomItem('player', '${p.replace(/'/g, "\\\\'")}')">${p}</div>`).join('');
        }

        if (positions.length > 0 && $("custom-pos-options")) {
            CURRENT_SELECTED_POS = positions[0]; 
            $("custom-pos-selected-text").innerText = CURRENT_SELECTED_POS;
            $("custom-pos-options").innerHTML = positions.map(pos => `<div class="custom-option-item ${pos === CURRENT_SELECTED_POS ? 'selected-active' : ''}" id="opt-pos-${pos}" onclick="selectCustomItem('pos', '${pos}')">${pos}</div>`).join('');
        }
        await onPizzaPlayerChange();
    } catch (e) { console.error("Fejl under indlæsning af dropdowns:", e); }
}

async function selectCustomItem(type, value) {
    const isPlayer = type === 'player';
    if (isPlayer) CURRENT_SELECTED_PLAYER = value; else CURRENT_SELECTED_POS = value;
    $(`custom-${type}-selected-text`).innerText = value;
    const optEl = $(`custom-${type}-options`); if (optEl) optEl.style.display = "none";
    document.querySelectorAll(`#custom-${type}-options .custom-option-item`).forEach(el => el.classList.toggle('selected-active', el.innerText === value));
    if (isPlayer) await onPizzaPlayerChange(); else onPizzaFilterChange();
}

async function onPizzaPlayerChange() {
    if (!CURRENT_SELECTED_PLAYER) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/pizza?player=${encodeURIComponent(CURRENT_SELECTED_PLAYER)}&compare_pos=`);
        if (response.ok) {
            const data = await response.json();
            if (data.player_pos) {
                CURRENT_SELECTED_POS = data.player_pos;
                $("custom-pos-selected-text").innerText = data.player_pos;
                document.querySelectorAll('#custom-pos-options .custom-option-item').forEach(el => el.classList.toggle('selected-active', el.innerText === data.player_pos));
            }
        }
    } catch (e) { console.error(e); }
    onPizzaFilterChange();
}

// ==========================================================================
// PER 90 - PIZZA.JS - DEL 6 AF 7 (DATAMOTOR & SEMANTISK TABEL-TEMPLATE) - DEL 1/3
// ==========================================================================

function buildCategorizedMetrics() {
    const container = $("checkboxes-container"); if (!container) return;
    const colors = { "Shooting": "#ff007f", "Passing": "#00ffd5", "Possession": "#ffb700", "Defending": "#00ff66" };
    const defaults = ["Goals", "npxG", "Assists", "xA", "Key Passes", "Successful Dribbles", "Progressive Carries", "Duels Won", "Aerials Won"];
    container.innerHTML = Object.entries(PIZZA_CATEGORIES).map(([cat, metrics]) => {
        const c = colors[cat] || "var(--accent-purple)";
        const body = Object.values(metrics).map(m => {
            const checked = defaults.includes(m);
            return `<label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; color: var(--text-primary); transition: opacity 0.2s; opacity: ${checked ? 1 : 0.35};"><input type="checkbox" value="${m}" ${checked ? "checked" : ""} onchange="this.parentElement.style.opacity = this.checked ? '1' : '0.35'; onPizzaFilterChange();" style="accent-color: ${c}; cursor: pointer;">${m}</label>`;
        }).join('');
        return `<div style="margin-bottom: 12px;"><div style="font-size: 11px; color: ${c}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid ${c}44; padding-bottom: 4px; margin-bottom: 6px;">${cat}</div><div style="display: flex; flex-direction: column; gap: 6px; padding-left: 4px;">${body}</div></div>`;
    }).join('');
}


async function loadPizzaChartDataWithFilters(playerName, comparePos, metricsList) {
    try {
        let url = `${API_BASE_URL}/api/pizza?player=${encodeURIComponent(playerName)}&compare_pos=${encodeURIComponent(comparePos)}`;
        metricsList.forEach(m => url += `&metrics=${encodeURIComponent(m)}`);
        const apiResponse = await fetch(url).then(r => { if (!r.ok) throw new Error(); return r.json(); });
        let logoBase64 = apiResponse.logo_base64 || "";
        if (apiResponse.team_id && apiResponse.team_id !== "nan" && !logoBase64) {
            try { logoBase64 = (await fetch(`${API_BASE_URL}/api/logo/${apiResponse.team_id}`).then(r => r.json())).logo_base64 || ""; } catch (e) {}
        }
        
        const chartContainer = $("chart-only"); if (!chartContainer) return;
        const sColor = apiResponse.selected_color || "#00f0ff", leagueVal = apiResponse.league || "N/A";
// ==========================================================================
// PER 90 - PIZZA.JS - DEL 6 AF 7 (DATAMOTOR & SEMANTISK TABEL-TEMPLATE) - DEL 2/3
// ==========================================================================

        chartContainer.style.overflow = "hidden";
        chartContainer.style.position = "relative";
        chartContainer.innerHTML = `
            <!-- 🛡️ STORT BAGGRUNDS-VANDMÆRKE I ØVERSTE VENSTRE HJØRNE (Mobil-optimeret) -->
            ${logoBase64 ? `<img class="pizza-bg-logo" src="${logoBase64}" style="position: absolute; top: 0px; left: -15px; width: 22vw; max-width: 140px; min-width: 90px; height: auto; object-fit: contain; opacity: 0.06; transform: rotate(-15deg); z-index: 1; pointer-events: none;" />` : ''}

            <table class="pizza-header-profile-table" style="position: relative; z-index: 2;">
                <tr>
                    <td>
                        <h2 class="p-nm">${apiResponse.player_name}</h2>
                        <div class="tactic-line" style="background-color: ${sColor}; filter: drop-shadow(0 0 6px ${sColor}88);"></div>
        
                        <div class="pizza-meta-container">
                            <!-- Liga Pill (Nu med ikon i stedet for logo) -->
                            <div class="meta-pill" style="border: 1px solid rgba(255,255,255,0.06); border-left: 3px solid ${sColor};">
                                <svg viewBox="0 0 24 24" style="stroke: ${sColor}"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                                <span class="data-val">${leagueVal}</span>
                            </div>
                            
                            <!-- Position Pill -->
                            <div class="meta-pill" style="border: 1px solid rgba(255,255,255,0.06); border-left: 3px solid ${sColor};">
                                <svg viewBox="0 0 24 24" style="stroke: ${sColor}"><path d="M4 3h16a1 1 0 0 1 1 1v5a2 2 0 0 1-2 2h-1v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-9H5a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1z"/><path d="M9 3a3 3 0 0 0 6 0"/></svg>
                                <span class="data-val">${apiResponse.player_pos || 'N/A'}</span>
                            </div>
                            
                            <!-- Minutter Pill -->
                            <div class="meta-pill" style="border: 1px solid rgba(255,255,255,0.06); border-left: 3px solid ${sColor};">
                                <svg viewBox="0 0 24 24" style="stroke: ${sColor}"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 15 14"/></svg>
                                <span class="data-val">${apiResponse.mins_played || 0} MIN.</span>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>

            <div id="pizza-warning-overlay" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(11, 6, 18, 0.9); border-radius: 12px; justify-content: center; align-items: center; z-index: 150;">
                <div style="color: #ff007f; font-weight: 700; text-align: center;">CHOOSE AT LEAST 3 METRICS</div>
            </div>
            
            <svg viewBox="0 0 710 600" id="pizza-svg-element" style="position: relative; z-index: 2;"></svg>
            
            <table class="pizza-footer-table" style="position: relative; z-index: 2;">
                <tr class="footer-line-top"><td>${apiResponse.player_name}'s percentile rank vs. ${leagueVal} ${CURRENT_SELECTED_POS}s</td></tr>
                <tr class="footer-line-bottom"><td>Generated via per90.vercel.app</td></tr>
            </table>
        `;
        
        buildPizzaVektorChart(apiResponse, sColor);
    } catch (e) { console.error("Interface fejl:", e); }
}

function downloadPNG() {
    const originalEl = $("chart-only"); if (!originalEl) return;
    
    const hiddenContainer = document.createElement("div");
    Object.assign(hiddenContainer.style, {
        position: "absolute", left: "-9999px", top: "-9999px",
        width: "710px", minWidth: "710px", maxWidth: "710px", height: "auto", overflow: "visible"
    });
    
    const clone = originalEl.cloneNode(true);
    clone.id = "pizza-download-clone";
    
    Object.assign(clone.style, {
        width: "710px", minWidth: "710px", maxWidth: "710px", height: "auto", minHeight: "auto", maxHeight: "none",
        padding: "25px 25px 25px 25px", background: "#0B1220", boxSizing: "border-box",
        display: "flex", flexDirection: "column", alignItems: "center", opacity: "1"
    });
    
    hiddenContainer.appendChild(clone);
    
    const overrideStyle = document.createElement("style");
    overrideStyle.innerHTML = `
        #pizza-download-clone::before { 
            content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
            background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; z-index: 0; border-radius: 24px; 
        }

        /* Låser logoet fast til øverste venstre hjørne på PC-download */
        #pizza-download-clone .pizza-bg-logo {
            position: absolute !important;
            top: 5px !important;
            left: -15px !important;
            width: 140px !important;
            height: 140px !important;
            opacity: 0.06 !important;
            transform: rotate(-15deg) !important;
            z-index: 1 !important;
            right: auto !important;
        }
        
        #pizza-download-clone .pizza-header-profile-table {
            max-width: 610px !important; margin: 10px auto 20px !important; display: table !important; 
            width: 100% !important; border-collapse: collapse !important; position: relative !important; z-index: 2 !important;
        }
        #pizza-download-clone .pizza-header-profile-table td { padding: 0px !important; }
        #pizza-download-clone .p-nm { 
            font-size: 28px !important; margin-bottom: 8px !important; color: #ffffff !important; 
            -webkit-text-fill-color: #ffffff !important; font-weight: 900 !important; text-align: left !important; letter-spacing: -1px !important;
        }
        #pizza-download-clone .tactic-line { 
            margin-bottom: 16px !important; width: 100% !important; display: block !important; height: 3px !important; border-radius: 2px !important;
        }

        #pizza-download-clone .pizza-meta-container {
            display: flex !important; 
            align-items: center !important; 
            flex-direction: row !important; 
            flex-wrap: nowrap !important;
            justify-content: flex-start !important;
            gap: 0px !important; 
        }

        #pizza-download-clone .meta-pill {
            display: inline-flex !important; 
            align-items: center !important; 
            justify-content: center !important;
            margin-right: 8px !important; 
            background: rgba(255, 255, 255, 0.03) !important;
            padding: 0px 12px !important; 
            height: 28px !important;
            box-sizing: border-box !important;
            border-radius: 8px !important; font-size: 11px !important; font-weight: 700 !important;
            text-transform: uppercase !important; letter-spacing: .5px !important; color: #94a3b8 !important; white-space: nowrap !important;
        }
        #pizza-download-clone .meta-pill:last-child {
            margin-right: 0px !important;
        }

        /* 🎯 FIX: margin-right sat ned til 3px for at bringe teksten tættere på ikonet */
        #pizza-download-clone .meta-pill svg { 
            opacity: .9 !important; 
            width: 14px !important; 
            min-width: 14px !important;
            max-width: 14px !important;
            height: 14px !important; 
            stroke-width: 2.2 !important; 
            display: inline-block !important;
            margin-right: 1px !important;
            margin-top: 0px !important;
        }
        
        #pizza-download-clone .meta-pill .data-val { 
            color: #ffffff !important; 
            font-weight: 700 !important; 
            display: inline-block !important;
            line-height: normal !important; 
            height: auto !important;
            padding-bottom: 2px !important; 
        }
        
        #pizza-download-clone #pizza-svg-element { 
            display: block !important; margin: 5px auto 0 auto !important; width: 100% !important; max-width: 100% !important;
            height: auto !important; max-height: none !important; overflow: visible !important; position: relative !important; z-index: 2 !important;
        }
        #pizza-download-clone .ax-lbl { font-size: 12px !important; fill: #94a3b8 !important; }
        #pizza-download-clone .pizza-footer-table { 
            display: table !important; width: 100% !important; margin-top: 15px !important; margin-bottom: 5px !important; border-collapse: collapse !important; position: relative !important; z-index: 2 !important;
        }
        #pizza-download-clone .pizza-footer-table td { font-size: 11px !important; padding: 2px 40px !important; color: #64748b !important; }
        #pizza-download-clone .pizza-footer-table .footer-line-top { opacity: 1 !important; }
        #pizza-download-clone .pizza-footer-table .footer-line-bottom { opacity: 0.6 !important; }
    `;
    
    document.body.appendChild(hiddenContainer);
    document.body.appendChild(overrideStyle);
    
    document.fonts.ready.then(() => {
        html2canvas(clone, { 
            scale: 4, pixelRatio: 1, width: 710, windowWidth: 710, backgroundColor: null, useCORS: true, logging: false 
        }).then(canvas => { 
            const link = document.createElement("a"); 
            link.download = "pizza_chart.png"; 
            link.href = canvas.toDataURL("image/png"); 
            link.click(); 
            hiddenContainer.remove(); overrideStyle.remove();
        }).catch(e => { 
            console.error(e); 
            hiddenContainer.remove(); overrideStyle.remove(); 
        }); 
    });
}


window.loadPizzaChartData = function(playerName) {
    if (playerName && CURRENT_SELECTED_PLAYER !== playerName) selectCustomItem('player', playerName); else onPizzaFilterChange();
};

document.addEventListener("click", e => {
    if (!e.target.closest('#custom-player-wrapper')) { const p = $("custom-player-options"); if(p) p.style.display = "none"; }
    if (!e.target.closest('#custom-pos-wrapper')) { const pos = $("custom-pos-options"); if(pos) pos.style.display = "none"; }
    if (!e.target.closest('.multiselect')) { const cb = $("checkboxes-container"); if(cb) cb.style.display = "none"; }
});


