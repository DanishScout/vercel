// ==========================================================================
// PER 90 - FILTERS.JS - DEL 1 AF 5 (SORT STATES & RESPONSIV PERFORMANCE CSS)
// ==========================================================================

let FILTERS_GLOBAL_DATA = null, FILTERS_STAT_TYPE = "Per 90";
let FILTERS_META = { leagues: [], nationalities: [], positions: [], minAge: 0, maxAge: 100, minMins: 0, maxMins: 99999 };
let FILTERS_METRIC_SLIDERS = {}; 

let FILTERS_SORT = { key: "mins_played", type: "meta", desc: true };

const $f = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .filters-main-layout { display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 950px; margin: 0 auto; padding: 0 10px; box-sizing: border-box; }
        .filters-data-viewport-wrapper { width: 100%; background: linear-gradient(180deg, #090f1e 0%, #020617 100%); border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; overflow-x: auto; box-sizing: border-box; }
        .filters-dynamic-grid-container { min-width: 100%; display: flex; flex-direction: column; width: max-content; }
        
        /* INTERAKTIVE KLIKBARE COLUMNS HEADERS */
        .filters-scouting-header { display: grid; align-items: center; padding: 14px 20px; font-family: 'Gabarito', sans-serif; font-size: 10.5px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 2px solid rgba(255,255,255,0.06); background: rgba(15, 23, 42, 0.6); }
        .filters-sort-trigger { cursor: pointer; display: flex; align-items: center; gap: 4px; user-select: none; transition: color 0.1s; }
        .filters-sort-trigger:hover { color: #fff; }
        .filters-sort-trigger.active-sort { color: #f59e0b; text-shadow: 0 0 8px rgba(245,158,11,0.3); }
        
        .filters-scroll-window { display: flex; flex-direction: column; max-height: 480px; overflow-y: auto; }
        .filters-compact-card { display: grid; align-items: center; padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .filters-compact-card:hover { background: rgba(255,255,255,0.02); }
        .filters-c-cell { display: flex; flex-direction: column; justify-content: center; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .filters-c-player-name { font-size: 13.5px; font-weight: 800; color: #fff; text-transform: uppercase; }
        .filters-c-subtext { font-size: 10.5px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        
        /* 🎯 LØSNING: Position mister sin blå farve og flugter 100% med alder og minutter */
        .filters-c-val-pos { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; text-align: center; }
        .filters-c-val-age, .filters-c-val-mins { font-size: 12px; font-weight: 700; color: #94a3b8; text-align: center; }
        
        /* Symmetriske metrik-kolonner placeret tæt på hinanden */
        .filters-c-val-metric { font-size: 12.5px; font-weight: 900; color: #f59e0b; text-align: center; }
        .filters-hdr-metric { justify-content: center; }
        .filter-native-slider:active, .filter-native-slider:focus { z-index: 5 !important; }

        
        .filters-data-viewport-wrapper::-webkit-scrollbar { height: 6px; width: 5px; }
        .filters-data-viewport-wrapper::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }

        /* 📱 RESPONSIV MOBILOPTIMERING FOR SPREADSHEET ENGINE */
        @media (max-width: 480px) {
            .filters-main-layout { padding: 0 4px !important; gap: 14px !important; }
            
            .filters-scouting-header { padding: 10px 12px !important; font-size: 9.5px !important; }
            .filters-compact-card { padding: 10px 12px !important; }
            
            .filters-c-cell { padding-right: 0px !important; }
            .filters-c-player-name { font-size: 11.5px !important; }
            .filters-c-subtext { font-size: 9px !important; }
            
            .filters-c-val-pos { font-size: 10.5px !important; }
            .filters-c-val-age, .filters-c-val-mins { font-size: 10.5px !important; }
            .filters-c-val-metric { font-size: 11px !important; }
            
            .filters-scroll-window { max-height: 350px !important; }
        }

    `;
    document.head.appendChild(style);
});

// ==========================================================================
// PER 90 - FILTERS.JS - DEL 2 AF 5 (MAIN VIEW SETUP & METRIC CSS)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .drawer-metrics-section { display: flex; flex-direction: column; gap: 12px; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.08); }
        .drawer-section-title { font-size: 11px; font-weight: 900; color: #f59e0b; text-transform: uppercase; }
        .filter-compact-row { display: flex; flex-direction: column; gap: 6px; background: #07030c; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); }
        .filter-row-topline { display: flex; align-items: center; justify-content: space-between; }
        .filter-label-checkbox-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: #fff; font-weight: 700; text-transform: uppercase; }
        .filter-row-range-text { font-size: 11px; font-weight: 800; color: #f59e0b; }
        .range-slider-container { display: flex; flex-direction: column; opacity: 0.25; pointer-events: none; }
        .range-slider-container.active { opacity: 1; pointer-events: auto; }
        .range-slider-wrapper { position: relative; width: 100%; height: 16px; display: flex; align-items: center; }
        .filter-native-slider { position: absolute; width: 100%; pointer-events: none; -webkit-appearance: none; background: none; border: none; outline: none; }
        .filter-native-slider::-webkit-slider-runnable-track { background: rgba(255,255,255,0.08); height: 4px; border-radius: 4px; }
        .filter-native-slider.slider-max-input::-webkit-slider-runnable-track { background: none; } 
        .filter-native-slider::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: auto; width: 12px; height: 12px; border-radius: 50%; background: var(--accent-purple, #a855f7); cursor: pointer; position: relative; z-index: 2; margin-top: -4px; }
    `;
    document.head.appendChild(style);
});

// EFTER (Centreret perfekt)
async function initFiltersView(container) {
    container.innerHTML = `
        <section id="view-filters" class="content-view active" style="padding-top: 10px;">
            <div style="text-align: center; margin: 0 auto 20px auto; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-filter" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Stat filters</span>
            </div>

            <div class="control-trigger-wrapper" style="margin-bottom: 25px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Configure Metrics & Sliders <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            <div class="filters-main-layout">
                <div class="filters-data-viewport-wrapper">
                    <div class="filters-dynamic-grid-container" id="filters-master-grid-canvas">
                        <!-- 🎯 LØSNING: Flot, stationær loader-spinner, der kun roterer roligt om sit eget centrum via fa-spin -->
                        <div id="filters-initial-spinner" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; gap: 12px; color: #94a3b8; font-family: 'Gabarito', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 40px; color: var(--accent-purple); height: 40px; width: 40px; display: flex; align-items: center; justify-content: center;"></i>
                            <span>Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
    await loadFiltersAPIDataFeed();
}


// ==========================================================================
// PER 90 - FILTERS.JS - DEL 3 AF 5 (DRAWER DASHBOARD PANEL BUILDER)
// ==========================================================================

function buildAndAppendFiltersDrawerHTML() {
    const gammelDrawer = document.querySelector('.table-filter-drawer');
    if (gammelDrawer) gammelDrawer.remove();

    const list = FILTERS_GLOBAL_DATA.players;
    const leagues = [...new Set(list.map(p => p.league).filter(Boolean).sort())];
    const nationalities = [...new Set(list.map(p => p.nationality).filter(Boolean).sort())];
    const positions = [...new Set(list.map(p => p.position).filter(Boolean).sort())];

    // --- LIGA CHECKBOXES MED INTRA-LOGIK FOR "ALL" ---
    const isAllLeaguesChecked = FILTERS_META.leagues.length === 0;
    let lCheckboxes = `<label class="table-drawer-checkbox-label" style="opacity: ${isAllLeaguesChecked ? 1 : 0.4}; font-weight: bold; color: var(--accent-purple);"><input type="checkbox" value="ALL" ${isAllLeaguesChecked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'leagues')"> [ALLE LIGAER]</label>`;
    lCheckboxes += leagues.map(l => {
        const checked = FILTERS_META.leagues.includes(l);
        return `<label class="table-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${l}" ${checked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'leagues')"> ${l}</label>`;
    }).join('');

    // --- NATIONALITET CHECKBOXES MED INTRA-LOGIK FOR "ALL" ---
    const isAllNationalitiesChecked = FILTERS_META.nationalities.length === 0;
    let nCheckboxes = `<label class="table-drawer-checkbox-label" style="opacity: ${isAllNationalitiesChecked ? 1 : 0.4}; font-weight: bold; color: var(--accent-purple);"><input type="checkbox" value="ALL" ${isAllNationalitiesChecked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'nationalities')"> [ALLE NATIONALITETER]</label>`;
    nCheckboxes += nationalities.map(n => {
        const checked = FILTERS_META.nationalities.includes(n);
        return `<label class="table-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${n}" ${checked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'nationalities')"> ${n}</label>`;
    }).join('');

    // --- POSITION CHECKBOXES MED INTRA-LOGIK FOR "ALL" ---
    const isAllPositionsChecked = FILTERS_META.positions.length === 0;
    let pCheckboxes = `<label class="table-drawer-checkbox-label" style="opacity: ${isAllPositionsChecked ? 1 : 0.4}; font-weight: bold; color: var(--accent-purple);"><input type="checkbox" value="ALL" ${isAllPositionsChecked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'positions')"> [ALLE POSITIONER]</label>`;
    pCheckboxes += positions.map(pos => {
        const checked = FILTERS_META.positions.includes(pos);
        return `<label class="table-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${pos}" ${checked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'positions')"> ${pos}</label>`;
    }).join('');

    let slidersHTML = `<div class="drawer-metrics-section"><div class="drawer-section-title">Performance Metrics Activation</div>`;
    Object.keys(FILTERS_METRIC_SLIDERS).forEach(m => {
        const s = FILTERS_METRIC_SLIDERS[m], step = s.max <= 2 ? "0.01" : (s.max <= 100 ? "0.1" : "1"), cid = m.replace(/\s+/g, '');
        slidersHTML += `
            <div class="filter-compact-row">
                <div class="filter-row-topline">
                    <label class="filter-label-checkbox-wrap"><input type="checkbox" id="fl-chk-${cid}" ${s.enabled ? "checked" : ""} onchange="handleMetricToggleClick(this, '${m}')"> ${m}</label>
                    <span class="filter-row-range-text" id="fl-lbl-${cid}">${s.currentMin.toFixed(2)} - ${s.currentMax.toFixed(2)}</span>
                </div>
                <div class="range-slider-container ${s.enabled ? 'active' : ''}" id="fl-wrap-${cid}">
                    <div class="range-slider-wrapper">
                        <input type="range" class="filter-native-slider slider-min-input" min="${s.min}" max="${s.max}" step="${step}" value="${s.currentMin}" oninput="handleDualSliderMovement(this, '${m}', 'min')" />
                        <input type="range" class="filter-native-slider slider-max-input" min="${s.min}" max="${s.max}" step="${step}" value="${s.currentMax}" oninput="handleDualSliderMovement(this, '${m}', 'max')" />
                    </div>
                </div>
            </div>`;
    });

    slidersHTML += `</div>`;

    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer stats-filter-drawer table-filter-drawer';
    
    // 🎯 HER ER RETTELSEN: Alle dropdown-grupper og inputs er lagt tilbage i skabelonen
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Filter Engine</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display:flex; flex-direction:column; gap:12px; width:100%; max-height:85vh; overflow-y:auto;">
            <div class="table-drawer-group"><label class="table-drawer-label">Stat Type</label><select id="fl-opt-stat-type" class="table-drawer-select" onchange="handleFiltersStatTypeChange()"><option value="Per 90" ${FILTERS_STAT_TYPE === "Per 90" ? "selected" : ""}>Per 90</option><option value="Total" ${FILTERS_STAT_TYPE === "Total" ? "selected" : ""}>Total</option></select></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Leagues</label><div class="table-drawer-checkbox-box" id="fl-container-leagues">${lCheckboxes}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Nationalities</label><div class="table-drawer-checkbox-box" id="fl-container-nationalities">${nCheckboxes}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Positions</label><div class="table-drawer-checkbox-box" id="fl-container-positions">${pCheckboxes}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Age (Min / Max)</label><div class="table-drawer-input-row"><input type="number" id="fl-filt-min-age" class="table-drawer-input" value="${FILTERS_META.minAge}" oninput="handleFiltersMetaInputChange()"><input type="number" id="fl-filt-max-age" class="table-drawer-input" value="${FILTERS_META.maxAge}" oninput="handleFiltersMetaInputChange()"></div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Minutes (Min / Max)</label><div class="table-drawer-input-row"><input type="number" id="fl-filt-min-mins" class="table-drawer-input" value="${FILTERS_META.minMins}" oninput="handleFiltersMetaInputChange()"><input type="number" id="fl-filt-max-mins" class="table-drawer-input" value="${FILTERS_META.maxMins}" oninput="handleFiltersMetaInputChange()"></div></div>
            
            ${slidersHTML}
            
            <div style="margin-top: 15px; width: 100%;">
                <button onclick="resetAllFiltersToDefault()" style="width: 100%; padding: 12px; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; font-family: Gabarito, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: all 0.15s ease;" onmouseover="this.style.background='rgba(239, 68, 68, 0.25)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.15)'">
                    Reset To Default <i class="fa-solid fa-rotate-left" style="margin-left: 6px;"></i>
                </button>
            </div>
        </div>`;
    document.body.appendChild(drawerDiv);
}


// ==========================================================================
// PER 90 - FILTERS.JS - DEL 4 AF 5 (API SYNC MED FASTLÅST PERFORMANCE MINIMUM)
// ==========================================================================

async function loadFiltersAPIDataFeed() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/filters-data?stat_type=${encodeURIComponent(FILTERS_STAT_TYPE)}`);
        if (!res.ok) return;
        FILTERS_GLOBAL_DATA = await res.json();
        const list = FILTERS_GLOBAL_DATA.players, mList = FILTERS_GLOBAL_DATA.filter_metrics;
        
        if (list.length > 0) {
            const ages = list.map(p => p.age).filter(a => a > 0), mins = list.map(p => p.mins_played).filter(m => m > 0);
            FILTERS_META.minAge = Math.min(...ages); FILTERS_META.maxAge = Math.max(...ages);
            FILTERS_META.minMins = Math.min(...mins); FILTERS_META.maxMins = Math.max(...mins);
            
            FILTERS_METRIC_SLIDERS = {}; 
            mList.forEach(m => {
                const vals = list.map(p => p.metrics[m] || 0.0), mn = Math.min(...vals), mx = Math.max(...vals);
                
                // Standard værdier
                let isEnabled = false;
                let calculatedMin = mn;

                // 🎯 80% OPTIMERING: Hvis metrikken er Goals eller npxG, skruer vi bunden op på 80% af max
                if (m === "Goals" || m === "npxG") {
                    isEnabled = true;
                    calculatedMin = mn + (mx - mn) * 0.35; 
                }

                FILTERS_METRIC_SLIDERS[m] = { 
                    enabled: isEnabled, 
                    min: mn, 
                    max: mx, 
                    currentMin: calculatedMin, 
                    currentMax: mx 
                };
            });
        }
        buildAndAppendFiltersDrawerHTML(); 
        runAdvancedFilteringEngine();
    } catch (e) { console.error("API Fejl:", e); }
}

// 🎯 INTERAKTIV METODE: HÅNDTERER KLIK PÅ KOLONNE-HEADERS FOR LIVE SORTERING
function setFiltersSortColumn(columnKey, columnType) {
    if (FILTERS_SORT.key === columnKey) {
        FILTERS_SORT.desc = !FILTERS_SORT.desc; // Samme kolonne -> Vend rækkefølgen om
    } else {
        FILTERS_SORT.key = columnKey;
        FILTERS_SORT.type = columnType; // 'meta' eller 'metric'
        FILTERS_SORT.desc = true; // Sorter altid højest-til-lavest først
    }
    runAdvancedFilteringEngine();
}

function handleMetricToggleClick(cb, m) {
    const wrapper = $f(`fl-wrap-${m.replace(/\s+/g, '')}`);
    FILTERS_METRIC_SLIDERS[m].enabled = cb.checked;
    if (wrapper) wrapper.classList.toggle('active', cb.checked);
    runAdvancedFilteringEngine();
}

function handleDualSliderMovement(el, m, type) {
    const s = FILTERS_METRIC_SLIDERS[m], val = parseFloat(el.value);
    if (type === 'min') {
        if (val > s.currentMax) { el.value = s.currentMax; s.currentMin = s.currentMax; } else { s.currentMin = val; }
    } else {
        if (val < s.currentMin) { el.value = s.currentMin; s.currentMax = s.currentMin; } else { s.currentMax = val; }
    }
    const lbl = $f(`fl-lbl-${m.replace(/\s+/g, '')}`);
    if (lbl) lbl.innerText = `${s.currentMin.toFixed(2)} - ${s.currentMax.toFixed(2)}`;
    
    // 🚀 PERFORMANCE DEBOUNCE
    clearTimeout(window.filterDebounceTimeout);
    window.filterDebounceTimeout = setTimeout(() => {
        runAdvancedFilteringEngine();
    }, 40);
}

function handleFiltersMetaInputChange() {
    if (!$f("fl-filt-min-age")) return;
    FILTERS_META.minAge = parseInt($f("fl-filt-min-age").value) || 0; 
    FILTERS_META.maxAge = parseInt($f("fl-filt-max-age").value) || 100;
    FILTERS_META.minMins = parseInt($f("fl-filt-min-mins").value) || 0; 
    FILTERS_META.maxMins = parseInt($f("fl-filt-max-mins").value) || 99999;
    
    // 🚀 PERFORMANCE DEBOUNCE
    clearTimeout(window.filterDebounceTimeout);
    window.filterDebounceTimeout = setTimeout(() => {
        runAdvancedFilteringEngine();
    }, 40);
}

// ==========================================================================
// PER 90 - FILTERS.JS - DEL 5 AF 5 (INTERACTIVE SPREADSHEET ENGINE)
// ==========================================================================

// ==========================================================================
// PER 90 - FILTERS.JS - DEL 5A AF 5 (DYNAMISK SYMMETRISK GRID FILTER)
// ==========================================================================

function runAdvancedFilteringEngine() {
    const canvas = $f("filters-master-grid-canvas"); if (!canvas || !FILTERS_GLOBAL_DATA) return;

    // 🎯 LØSNING: Fjerner loading spinneren med det samme, når data er klar
    const spinner = document.getElementById("filters-initial-spinner");
    if (spinner) spinner.remove();

    const activeM = Object.keys(FILTERS_METRIC_SLIDERS).filter(m => FILTERS_METRIC_SLIDERS[m].enabled);
    
    // 🎯 LØSNING: Vi låser alle datakolonner til præcis 75px hver (Symmetrisk og ensartet afstand efter Min)
    let gridLayout = "240px 75px 75px 75px";
    activeM.forEach(() => { gridLayout += " 75px"; });

    let filtered = FILTERS_GLOBAL_DATA.players.filter(p => {
        if (FILTERS_META.leagues.length > 0 && !FILTERS_META.leagues.includes(p.league)) return false;
        if (FILTERS_META.nationalities.length > 0 && !FILTERS_META.nationalities.includes(p.nationality)) return false;
        if (FILTERS_META.positions.length > 0 && !FILTERS_META.positions.includes(p.position)) return false;
        if (p.age < FILTERS_META.minAge || p.age > FILTERS_META.maxAge) return false;
        if (p.mins_played < FILTERS_META.minMins || p.mins_played > FILTERS_META.maxMins) return false;

        for (let i = 0; i < activeM.length; i++) {
            const m = activeM[i], val = p.metrics[m] || 0.0, b = FILTERS_METRIC_SLIDERS[m];
            if (val < b.currentMin || val > b.currentMax) return false;
        }
        return true;
    });

    // Match count badge-linjen er fjernet helt herfra!
    if (filtered.length === 0) {
        canvas.innerHTML = `<div style="text-align:center; padding:40px; color:#64748b; font-size:12px; font-weight:700;">NO MATCHES</div>`;
        return;
    }

    filtered.sort((a, b) => {
        // Hent værdierne korrekt baseret på typen
        let valA = FILTERS_SORT.type === "meta" ? a[FILTERS_SORT.key] : (a.metrics ? a.metrics[FILTERS_SORT.key] : 0.0);
        let valB = FILTERS_SORT.type === "meta" ? b[FILTERS_SORT.key] : (b.metrics ? b.metrics[FILTERS_SORT.key] : 0.0);
    
        // Konverter til tal, hvis muligt (håndterer strenge og rydder op)
        let numA = parseFloat(valA);
        let numB = parseFloat(valB);
    
        // Hvis det er gyldige tal, så sorter numerisk
        if (!isNaN(numA) && !isNaN(numB)) {
            return FILTERS_SORT.desc ? numB - numA : numA - numB;
        }
    
        // Fallback til tekstsortering, hvis det er strenge (f.eks. navne eller positioner)
        let strA = String(valA || "").toLowerCase();
        let strB = String(valB || "").toLowerCase();
        if (strA < strB) return FILTERS_SORT.desc ? 1 : -1;
        if (strA > strB) return FILTERS_SORT.desc ? -1 : 1;
        return 0;
    });



    const getSortIndicator = (colKey) => {
        if (FILTERS_SORT.key !== colKey) return `<i class="fa-solid fa-sort" style="opacity:0.3; font-size:9px;"></i>`;
        return FILTERS_SORT.desc ? ` ▼` : ` ▲`;
    };
    const getSortClass = (colKey) => FILTERS_SORT.key === colKey ? "active-sort" : "";

    // Symmetrisk header med ensartede, midterstillede bredder
    // 🎯 LØSNING: Alle overskrifter (Pos, Age, Min, Metrics) kører nu med text-content centrering ligesom data-kortene
    let headerHTML = `
        <div class="filters-scouting-header" style="grid-template-columns: ${gridLayout};">
            <div style="text-align: left;">Player</div>
            <div style="text-align: center; width: 100%; display: block;">Pos.</div>
            <div style="justify-content: center; width: 100%;" class="filters-sort-trigger ${getSortClass('age')}" onclick="setFiltersSortColumn('age','meta')">Age${getSortIndicator('age')}</div>
            <div style="justify-content: center; width: 100%;" class="filters-sort-trigger ${getSortClass('mins_played')}" onclick="setFiltersSortColumn('mins_played','meta')">Min.${getSortIndicator('mins_played')}</div>
            ${activeM.map(m => `
                <div style="justify-content: center; width: 100%;" class="filters-sort-trigger filters-hdr-metric ${getSortClass(m)}" onclick="setFiltersSortColumn('${m}','metric')">
                    ${m}${getSortIndicator(m)}
                </div>
            `).join('')}
        </div>
    `;


    // Udløser næste brik (Del 5B) for at generere rækkerne
    continueBuildingFiltersRows(canvas, headerHTML, filtered, activeM, gridLayout);
}


// ==========================================================================
// PER 90 - FILTERS.JS - DEL 5B AF 5 (ROWS & SPREADSHEET VIEWPORT INJECTION)
// ==========================================================================

// ERSTAT MED DETTE:
function continueBuildingFiltersRows(canvas, headerHTML, filtered, activeM, gridLayout) {
    let rowsHTML = filtered.map(p => {
        const mCells = activeM.map(m => {
            const val = p.metrics[m] || 0.0;
            // 🎯 Hvis tallet er et helt tal (integer), fjernes decimalerne. Ellers beholdes 2 decimaler.
            const formattedVal = Number.isInteger(val) ? val : val.toFixed(2);
            return `<div class="filters-c-cell filters-c-val-metric">${formattedVal}</div>`;
        }).join('');
        
        return `
            <div class="filters-compact-card" style="grid-template-columns: ${gridLayout};">
                <div class="filters-c-cell">
                    <div class="filters-c-player-name">${p.player_name}</div>
                    <div class="filters-c-subtext">${p.team} | ${p.league}</div>
                </div>
                <div class="filters-c-cell filters-c-val-pos">${p.position}</div>
                <div class="filters-c-cell filters-c-val-age">${p.age} År</div>
                <div class="filters-c-cell filters-c-val-mins">${p.mins_played}m</div>
                ${mCells}
            </div>
        `;
    }).join('');

    canvas.innerHTML = headerHTML + `<div class="filters-scroll-window">${rowsHTML}</div>`;
}


async function handleFiltersStatTypeChange() {
    const sel = $f("fl-opt-stat-type"); 
    if (!sel) return;
    
    FILTERS_STAT_TYPE = sel.value;
    
    try {
        // 1. Hent de nye Total- eller Per 90-data i baggrunden uden at røre UI endnu
        const res = await fetch(`${API_BASE_URL}/api/filters-data?stat_type=${encodeURIComponent(FILTERS_STAT_TYPE)}`);
        if (!res.ok) return;
        
        FILTERS_GLOBAL_DATA = await res.json();
        const list = FILTERS_GLOBAL_DATA.players;
        
        // 2. Opdater de overordnede min/max grænser live i dine arrays
        if (list.length > 0) {
            const ages = list.map(p => p.age).filter(a => a > 0), mins = list.map(p => p.mins_played).filter(m => m > 0);
            FILTERS_META.minAge = Math.min(...ages); FILTERS_META.maxAge = Math.max(...ages);
            FILTERS_META.minMins = Math.min(...mins); FILTERS_META.maxMins = Math.max(...mins);
            
            // Opdater også dine slider-grænser i baggrunden, hvis max-værdierne har ændret sig radikalt
            FILTERS_GLOBAL_DATA.filter_metrics.forEach(m => {
                const vals = list.map(p => p.metrics[m] || 0.0), mn = Math.min(...vals), mx = Math.max(...vals);
                if (FILTERS_METRIC_SLIDERS[m]) {
                    FILTERS_METRIC_SLIDERS[m].min = mn;
                    FILTERS_METRIC_SLIDERS[m].max = mx;
                    // Sørg for at skydeknapperne ikke ryger uden for de nye grænser
                    if (FILTERS_METRIC_SLIDERS[m].currentMin < mn) FILTERS_METRIC_SLIDERS[m].currentMin = mn;
                    if (FILTERS_METRIC_SLIDERS[m].currentMax > mx) FILTERS_METRIC_SLIDERS[m].currentMax = mx;
                }
            });
        }
        
        // 3. Opdater udelukkende indholdet af tjekboksene live i den åbne skuffe
        updateDynamicFiltersDropdownsOnly();
        
        // 4. Kør filtermotoren så tabellen bagved opdaterer sine tal med det samme
        runAdvancedFilteringEngine();
        
    } catch (e) { 
        console.error("Fejl under skift af stat type:", e); 
    }
}


// 🎯 KORRIGERET CHECKBOX-TOGGLE MED PRODUCERBAR ALL-LOGIK OG REALTIME OPACITY
function handleFiltersCheckboxToggle(cb, key) {
    const val = cb.value;

    if (val === "ALL") {
        // Hvis der trykkes på [ALLE], nulstiller vi arrayet til at vise alt
        FILTERS_META[key] = [];
    } else {
        if (cb.checked) {
            if (!FILTERS_META[key].includes(val)) FILTERS_META[key].push(val);
        } else {
            FILTERS_META[key] = FILTERS_META[key].filter(v => v !== val);
        }
    }

    // Sætter den visuelle opacity med det samme på elementet ved klik
    cb.parentElement.style.opacity = cb.checked ? '1' : '0.4';

    // Kalder live-motoren for at opdatere de andre bokse uden genbygning af hele draweren
    updateDynamicFiltersDropdownsOnly();
    runAdvancedFilteringEngine();
}

// 🎯 DYNAMISK LIVE-OPDATERING: Genbygger udelukkende HTML'en inde i boksene uden sløret skærm
function updateDynamicFiltersDropdownsOnly() {
    if (!FILTERS_GLOBAL_DATA || !FILTERS_GLOBAL_DATA.players) return;
    
    const list = FILTERS_GLOBAL_DATA.players;
    const leaguesBox = $f("fl-container-leagues");
    const natBox = $f("fl-container-nationalities");
    const posBox = $f("fl-container-positions");
    
    // 1. Opdater Liga-tjekbokse live
    if (leaguesBox) {
        const leagues = [...new Set(list.map(p => p.league).filter(Boolean).sort())];
        const isAllChecked = FILTERS_META.leagues.length === 0;
        let html = `<label class="table-drawer-checkbox-label" style="opacity: ${isAllChecked ? 1 : 0.4}; font-weight: bold; color: var(--accent-purple);"><input type="checkbox" value="ALL" ${isAllChecked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'leagues')"> [ALLE LIGAER]</label>`;
        html += leagues.map(l => {
            const checked = FILTERS_META.leagues.includes(l);
            return `<label class="table-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${l}" ${checked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'leagues')"> ${l}</label>`;
        }).join('');
        leaguesBox.innerHTML = html;
    }

    // 2. Opdater Nationalitet-tjekbokse live
    if (natBox) {
        const nationalities = [...new Set(list.map(p => p.nationality).filter(Boolean).sort())];
        const isAllChecked = FILTERS_META.nationalities.length === 0;
        let html = `<label class="table-drawer-checkbox-label" style="opacity: ${isAllChecked ? 1 : 0.4}; font-weight: bold; color: var(--accent-purple);"><input type="checkbox" value="ALL" ${isAllChecked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'nationalities')"> [ALLE NATIONALITETER]</label>`;
        html += nationalities.map(n => {
            const checked = FILTERS_META.nationalities.includes(n);
            return `<label class="table-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${n}" ${checked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'nationalities')"> ${n}</label>`;
        }).join('');
        natBox.innerHTML = html;
    }
    
    // 3. Opdater Position-tjekbokse live (🎯 RENT FIX: handleScatterCheckboxToggle rettet til handleFiltersCheckboxToggle)
    if (posBox) {
        const positions = [...new Set(list.map(p => p.position).filter(Boolean).sort())];
        const isAllChecked = FILTERS_META.positions.length === 0;
        let html = `<label class="table-drawer-checkbox-label" style="opacity: ${isAllChecked ? 1 : 0.4}; font-weight: bold; color: var(--accent-purple);"><input type="checkbox" value="ALL" ${isAllChecked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'positions')"> [ALLE POSITIONER]</label>`;
        html += positions.map(pos => {
            const checked = FILTERS_META.positions.includes(pos);
            return `<label class="table-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${pos}" ${checked ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, 'positions')"> ${pos}</label>`;
        }).join('');
        posBox.innerHTML = html;
    }
}

// 🎯 TRIN A: OPTIMERET RESET TIL DEFAULT METODE (INGEN OVERLAY / BLUR FEJL)
function resetAllFiltersToDefault() {
    if (FILTERS_GLOBAL_DATA && FILTERS_GLOBAL_DATA.players.length > 0) {
        const list = FILTERS_GLOBAL_DATA.players;
        const ages = list.map(p => p.age).filter(a => a > 0);
        const mins = list.map(p => p.mins_played).filter(m => m > 0);
        
        // 1. Nulstil meta-data arrays og værdier
        FILTERS_META = {
            leagues: [],
            nationalities: [],
            positions: [],
            minAge: Math.min(...ages),
            maxAge: Math.max(...ages),
            minMins: Math.min(...mins),
            maxMins: Math.max(...mins)
        };
        
        // 2. Genberegn standard performance slider værdier
        if (FILTERS_GLOBAL_DATA.filter_metrics) {
            FILTERS_GLOBAL_DATA.filter_metrics.forEach(m => {
                const vals = list.map(p => p.metrics[m] || 0.0);
                const mn = Math.min(...vals), mx = Math.max(...vals);
                let isEnabled = false;
                let calculatedMin = mn;

                if (m === "Goals" || m === "npxG") {
                    isEnabled = true;
                    calculatedMin = mn + (mx - mn) * 0.35; 
                }

                FILTERS_METRIC_SLIDERS[m] = { 
                    enabled: isEnabled, 
                    min: mn, 
                    max: mx, 
                    currentMin: calculatedMin, 
                    currentMax: mx 
                };
            });
        }

        // 3. Opdater de numeriske inputfelter i UI live
        if ($f("fl-filt-min-age")) $f("fl-filt-min-age").value = FILTERS_META.minAge;
        if ($f("fl-filt-max-age")) $f("fl-filt-max-age").value = FILTERS_META.maxAge;
        if ($f("fl-filt-min-mins")) $f("fl-filt-min-mins").value = FILTERS_META.minMins;
        if ($f("fl-filt-max-mins")) $f("fl-filt-max-mins").value = FILTERS_META.maxMins;

        // 4. Opdater Stat Type dropdownen til standarden "Per 90"
        if ($f("fl-opt-stat-type")) {
            $f("fl-opt-stat-type").value = "Per 90";
            FILTERS_STAT_TYPE = "Per 90";
        }

        // 5. Opdater de visuelle metrics sliders og tjekbokse live uden at slette elementer
        Object.keys(FILTERS_METRIC_SLIDERS).forEach(m => {
            const s = FILTERS_METRIC_SLIDERS[m];
            const cid = m.replace(/\s+/g, '');
            
            const chk = $f(`fl-chk-${cid}`);
            const lbl = $f(`fl-lbl-${cid}`);
            const wrap = $f(`fl-wrap-${cid}`);
            
            if (chk) chk.checked = s.enabled;
            if (lbl) lbl.innerText = `${s.currentMin.toFixed(2)} - ${s.currentMax.toFixed(2)}`;
            if (wrap) wrap.classList.toggle('active', s.enabled);

            // Nulstil selve de to native slider-knapper i DOM'en
            const inputs = wrap ? wrap.querySelectorAll('input[type="range"]') : [];
            if (inputs.length === 2) {
                inputs[0].value = s.currentMin;
                inputs[1].value = s.currentMax;
            }
        });
    }

    // 6. Opdater tjekbokse for ligaer/nationaliteter/positioner live
    updateDynamicFiltersDropdownsOnly();
    
    // 7. Kør filtermotoren til sidst
    runAdvancedFilteringEngine();
}

function onFiltersFilterChange() { runAdvancedFilteringEngine(); }
