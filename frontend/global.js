// ==========================================================================
// PER 90 - GLOBAL.JS - GLASSMORPHISM DESIGN MATRIX - DEL 1 AF 3
// ==========================================================================

const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:8000' 
    : 'https://vercel-nine-opal-71.vercel.app/';
let pizzaChartInstance = null;

const minimalSaaSStyles = `
    #view-landing .master-saas-container {
        background: rgba(10, 16, 12, 0.65);
        backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
        border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 32px;
        padding: 50px; max-width: 820px; width: 100%;
        box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.95);
        box-sizing: border-box; text-align: left; position: relative; overflow: hidden;
    }
    #view-landing .master-saas-container::before {
        content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
        background: linear-gradient(to bottom, #00ff66, rgba(0, 255, 102, 0.1));
    }
    #view-landing .hero-header-block { margin-bottom: 35px; padding-left: 10px; }
    
    #view-landing .hero-title { 
        color: #ffffff !important; font-size: 38px !important; font-weight: 900;
        letter-spacing: -0.5px; line-height: 1.1; margin: 0 0 12px 0; text-transform: uppercase;
        white-space: nowrap;
    }
    #view-landing .hero-title span {
        opacity: 0.45; font-weight: 700; margin-right: 10px;
    }
    
    #view-landing .hero-subtitle { 
        color: rgba(255, 255, 255, 0.6) !important; font-size: 14.5px;
        max-width: 580px; margin: 0; line-height: 1.6; font-weight: 400;
    }
    
    #view-landing .dashboard-stream-layout {
        display: flex; flex-direction: column; gap: 35px;
        border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 35px;
    }
    
    #view-landing .db-horizontal-stats { 
        display: flex; justify-content: space-between; align-items: center; 
        width: 100%; gap: 20px; padding-left: 10px; padding-right: 10px;
        box-sizing: border-box;
    }
    #view-landing .db-stat-row { flex: 1; text-align: left; }
    #view-landing .db-num { color: #ffffff !important; font-size: 36px; font-weight: 800; line-height: 1; letter-spacing: -1px; }
    #view-landing .db-label { color: #00ff66 !important; font-size: 11px; margin-top: 6px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; }
    #view-landing .db-subtext { color: rgba(255, 255, 255, 0.3) !important; font-size: 11px; margin-top: 2px; }

    #view-landing .live-feed-section { 
        display: flex; 
        flex-direction: row; 
        width: 100%;
        gap: 30px;
        border-top: 1px dashed rgba(255, 255, 255, 0.06); 
        padding-top: 35px;
        box-sizing: border-box;
        align-items: stretch;
    }
    #view-landing .carousel-left-block {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    #view-landing .carousel-title-wrapper { padding-left: 10px; }
    
    #view-landing .p-row { 
        background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.03);
        border-radius: 14px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #view-landing .p-row:hover { 
        background: rgba(255, 255, 255, 0.04); border-color: rgba(0, 255, 102, 0.2);
        transform: translateY(-2px);
    }
    #view-landing .p-row-1st {
        background: linear-gradient(90deg, rgba(0, 255, 102, 0.06) 0%, rgba(0, 255, 102, 0.01) 100%);
        border: 1px solid rgba(0, 255, 102, 0.20) !important;
    }
    @keyframes coreBlink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

    /* Support boks - Fuld højde og ren struktur på store skærme */
    #view-landing .db-support-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 24px 20px;
        width: 240px;
        min-width: 240px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-sizing: border-box;
        margin-top: 62px;
    }
    #view-landing .db-support-btn {
        background: #00ff66;
        color: #0a100c !important;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-decoration: none;
        padding: 12px 14px;
        border-radius: 8px;
        text-align: center;
        transition: all 0.2s ease;
        box-shadow: 0 0 15px rgba(0, 255, 102, 0.2);
        width: 100%;
        box-sizing: border-box;
    }
    #view-landing .db-support-btn:hover {
        background: #00dd55;
        transform: translateY(-1px);
        box-shadow: 0 0 20px rgba(0, 255, 102, 0.4);
    }

    @media (max-width: 768px) {
        #view-landing .hero-title { white-space: normal; font-size: 32px !important; }
        #view-landing .live-feed-section { flex-direction: column; gap: 35px; }
        #view-landing .db-support-card { width: 100%; min-width: 100%; height: auto; margin-top: 0; gap: 15px; align-items: center; text-align: center; }
        #view-landing .db-support-btn { max-width: 250px; }
    }
    
    /* SPECIFIK OPTIMERING TIL MOBILSKÆRME UNDER 550PX */
    @media (max-width: 550px) {
        #view-landing .master-saas-container { padding: 35px 20px; border-radius: 24px; }
        #view-landing .hero-title { font-size: 26px !important; padding-left: 0; text-align: center !important; }
        #view-landing .hero-subtitle { text-align: center !important; margin: 0 auto !important; }
        #view-landing .hero-header-block { padding-left: 0; margin-bottom: 25px; }
        
        #view-landing .db-horizontal-stats { 
            flex-direction: row !important; 
            justify-content: space-between !important; 
            gap: 10px !important; 
            padding-left: 0; padding-right: 0; 
        }
        #view-landing .db-stat-row { 
            flex: 1; 
            text-align: center !important; 
            border-left: none !important; 
            padding-left: 0 !important; 
        }
        #view-landing .db-num { font-size: 26px !important; }
        #view-landing .db-label { font-size: 9.5px !important; letter-spacing: 1px !important; margin-top: 4px !important; }
        #view-landing .db-subtext { display: none !important; }
        
        #view-landing .live-feed-section { flex-direction: column !important; gap: 25px !important; padding-top: 25px; }
        
        /* Centrerer alt indhold i kaffeboksen på mobilen */
        #view-landing .db-support-card { 
            width: 100%; 
            min-width: 100%; 
            box-sizing: border-box; 
            padding: 20px 15px; 
            margin-top: 0; 
            align-items: center !important; 
            text-align: center !important; 
        }
        #view-landing .db-support-card > div {
            align-items: center !important;
            justify-content: center !important;
        }
        #view-landing .db-support-card div[style*="max-width"] {
            margin: 0 auto !important;
        }

        #view-landing .carousel-title-wrapper { 
            padding-left: 0; 
            text-align: center !important; 
        }
        #view-landing .carousel-title-wrapper > div { 
            align-items: center !important; 
        }
        #view-landing .carousel-title-wrapper div style*="display: flex" { 
            justify-content: center !important; 
        }
        
        #view-landing .dashboard-stream-layout { gap: 25px; padding-top: 25px; }
    }
`;

const styleEl = document.createElement('style');
styleEl.textContent = minimalSaaSStyles;
document.head.appendChild(styleEl);
// ==========================================================================
// PER 90 - GLOBAL.JS - NAVIGATION & INTERFACE ROUTING - DEL 2 AF 3
// ==========================================================================

function switchView(viewId) {
    console.log("LOG: Skifter visning til -> " + viewId);
    
    document.querySelectorAll('.filter-drawer, .stats-filter-drawer, .scatter-filter-drawer, .table-filter-drawer').forEach(d => d.remove());

    const allNavItems = document.querySelectorAll('.nav-item');
    allNavItems.forEach(item => item.classList.remove('active'));
    allNavItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes("'" + viewId + "'")) item.classList.add('active');
    });

    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) navMenu.classList.remove('mobile-open');

    const contentArea = document.getElementById('dynamic-content-area');
    if (!contentArea) return console.error("FEJL: Kunne ikke finde #dynamic-content-area");

    const fallbackPlayer = (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER) ? CURRENT_SELECTED_PLAYER : "";

    if (viewId === 'landing' || viewId === 'home') {
        contentArea.innerHTML = `
            <section id="view-landing" class="content-view active" style="font-family: 'Inter', system-ui, sans-serif; padding: 60px 20px; display: flex; align-items: center; justify-content: center; width: 100%; box-sizing: border-box;">
                <div class="master-saas-container">
                    
                    <div class="hero-header-block">
                        <h1 class="hero-title"><span>All you need</span>PER 90</h1>
                        <p class="hero-subtitle">This website allows you to visualize some of the most detailed player and match data available online from top leagues around the world, powered by high-quality sources. Use the menu to choose from a wide range of interactive plots.</p>
                    </div>
                    
                    <div class="dashboard-stream-layout">
                        
                        <div class="db-horizontal-stats">
                            <div class="db-stat-row">
                                <div id="live-stat-leagues" class="db-num">--</div>
                                <div class="db-label">Leagues</div>
                                <div class="db-subtext">From all over Europe</div>
                            </div>
                            <div class="db-stat-row" style="border-left: 1px solid rgba(255,255,255,0.06); padding-left: 25px;">
                                <div id="live-stat-players" class="db-num">--</div>
                                <div class="db-label">Players</div>
                                <div class="db-subtext">... And counting</div>
                            </div>
                            <div class="db-stat-row" style="border-left: 1px solid rgba(255,255,255,0.06); padding-left: 25px;">
                                <div id="live-stat-metrics" class="db-num">--</div>
                                <div class="db-label">Metrics</div>
                                <div class="db-subtext">By totals, per 90 & percentiles</div>
                            </div>
                        </div>

                        <div class="live-feed-section">
                            <div class="carousel-left-block">
                                <div id="carousel-metric-title" class="carousel-title-wrapper" style="transition: opacity 0.3s; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); min-height: 42px;">
                                    <span style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block;">Henter parametre...</span>
                                </div>
                                <div id="carousel-cards-container" style="display: flex; flex-direction: column; gap: 10px; transition: opacity 0.4s ease-in-out;"></div>
                            </div>

                            <div class="db-support-card">
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.5px;">Support PER 90</span>
                                    </div>
                                    <div style="font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.45; max-width: 200px;">This app is a personal passion project with zero financial gain. If you enjoy using it and want to support my work, please consider donating down below.</div>
                                </div>
                                <a href="https://buymeacoffee.com/per90" target="_blank" class="db-support-btn">Donate</a>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        `;

        updateDatasetSummaryStats();
        updateHomeCarousel();
        if (window.carouselInterval) clearInterval(window.carouselInterval);
        window.carouselInterval = setInterval(updateHomeCarousel, 7000);
    }
    else if (viewId === 'pizza') { if (typeof initPizzaView === 'function') { initPizzaView(contentArea); if (fallbackPlayer && typeof onPizzaFilterChange === 'function') onPizzaFilterChange(); } } 
    else if (viewId === 'radar') { if (typeof initRadarView === 'function') { initRadarView(contentArea); if (fallbackPlayer && typeof onRadarFilterChange === 'function') onRadarFilterChange(); } }
    else if (viewId === 'player_stats') { if (typeof initPlayerStatsView === 'function') { initPlayerStatsView(contentArea); if (fallbackPlayer && typeof onStatsFilterChange === 'function') onStatsFilterChange(); } }
    else if (viewId === 'scatter') { if (typeof initScatterView === 'function') { initScatterView(contentArea); if (fallbackPlayer && typeof onScatterFilterChange === 'function') onScatterFilterChange(); } }
    else if (viewId === 'table') { if (typeof initTableView === 'function') { initTableView(contentArea); if (fallbackPlayer && typeof onTableFilterChange === 'function') onTableFilterChange(); } }
    else if (viewId === 'stat_filters') { if (typeof initFiltersView === 'function') { initFiltersView(contentArea); if (fallbackPlayer && typeof onFiltersFilterChange === 'function') onFiltersFilterChange(); } }
    else if (viewId === 'similarity') { if (typeof initSimilarityView === 'function') { initSimilarityView(contentArea); if (fallbackPlayer && typeof onSimilarityFilterChange === 'function') onSimilarityFilterChange(); } }
    else if (viewId === 'ranking') { if (typeof initRankingView === 'function') { initRankingView(contentArea); if (fallbackPlayer && typeof onRankingFilterChange === 'function') onRankingFilterChange(); } }
    else if (viewId === 'matchreport') { if (typeof initMatchReportView === 'function') initMatchReportView(contentArea); }
    else if (viewId === 'eventdata') { if (typeof initEventDataView === 'function') initEventDataView(contentArea); }
}
// ==========================================================================
// PER 90 - GLOBAL.JS - DATA FETCHING & LIVE KARRUSEL LOGIK - DEL 3 AF 3
// ==========================================================================

function updateDatasetSummaryStats() {
    const leaguesEl = document.getElementById('live-stat-leagues');
    const playersEl = document.getElementById('live-stat-players');
    const metricsEl = document.getElementById('live-stat-metrics');
    if (!leaguesEl || !playersEl || !metricsEl) return;

    fetch(`${API_BASE_URL}/api/stats-summary`)
        .then(res => res.json())
        .then(data => {
            leaguesEl.innerText = Number(data.leagues).toLocaleString('da-DK');
            playersEl.innerText = Number(data.players).toLocaleString('da-DK');
            metricsEl.innerText = Number(data.metrics).toLocaleString('da-DK');
        })
        .catch(err => {
            console.error("Fejl ved hentning af datasæt info:", err);
            leaguesEl.innerText = "25"; playersEl.innerText = "Error"; metricsEl.innerText = "Error";
        });
}

function updateHomeCarousel() {
    const container = document.getElementById('carousel-cards-container');
    const titleElement = document.getElementById('carousel-metric-title');
    if (!container || !titleElement || !document.getElementById('view-landing')) return;

    container.style.opacity = '0'; titleElement.style.opacity = '0';

    setTimeout(() => {
        if (!document.getElementById('carousel-cards-container')) return;

        fetch(`${API_BASE_URL}/api/carousel`)
            .then(res => res.json())
            .then(data => {
                if (data.error || !data.players || data.players.length === 0) {
                    titleElement.innerHTML = `<span style="font-size: 10px; color: #475569; text-transform: uppercase;">Afventer data...</span>`;
                    container.innerHTML = ""; return;
                }
    
                let formattedMetricSentence = data.suffix_type === "Total" 
                    ? `Most Total ${data.metric_name}` 
                    : `Most ${data.metric_name} / 90`;

                titleElement.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="display: inline-block; width: 5px; height: 5px; background-color: #00ff66; border-radius: 50%; box-shadow: 0 0 8px #00ff66; animation: coreBlink 2s infinite;"></span>
                            <span style="font-size: 10px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Using the app, explore parameters like...</span>
                        </div>
                        <div style="font-size: 14px; font-weight: 800; color: #ffffff; letter-spacing: -0.2px; line-height: 1.2;">
                            ${formattedMetricSentence} <span style="color: rgba(255,255,255,0.4); font-weight: 400;">in</span> <span style="color: #00ff66; font-weight: 700;">${data.league_name}</span>
                        </div>
                    </div>
                `;

                let podiumHtml = "";
                data.players.forEach((player, index) => {
                    const isFirst = index === 0;
                    const rowClass = isFirst ? "p-row p-row-1st" : "p-row";
                    const valColor = isFirst ? "#00ff66" : "rgba(255, 255, 255, 0.85)";

                    podiumHtml += `
                        <div class="${rowClass}" style="display: flex; align-items: center; justify-content: space-between; border-radius: 12px; padding: 14px 18px; color: #ffffff;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <span style="font-size: 11px; font-weight: 900; opacity: 0.3;">0${index + 1}</span>
                                <div style="text-align: left;">
                                    <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">${player.player_name}</div>
                                    <div style="font-size: 10.5px; color: rgba(255, 255, 255, 0.4); margin-top: 1px; font-weight: 500; text-transform: uppercase;">${player.team_name}</div>
                                </div>
                            </div>
                            <div style="font-size: 20px; font-weight: 800; color: ${valColor}; letter-spacing: -0.5px;">
                                ${player.value}
                            </div>
                        </div>
                    `;
                });
    
                container.innerHTML = podiumHtml;
                container.style.opacity = '1'; titleElement.style.opacity = '1';
            })
            .catch(err => {
                console.error("Karrusel netværksfejl:", err);
                titleElement.innerHTML = `<span style="font-size: 11px; color: #ef4444; text-transform: uppercase;">Forbindelsesfejl...</span>`;
            });
    }, 400);
}

function toggleMobileMenu(event) {
    if (event.target.closest('.nav-item')) return;
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) navMenu.classList.toggle('mobile-open');
}
