// ==========================================================================
// PER 90 - GLOBAL.JS - CENTRAL INTERFACE ROUTER & APP BRAIN
// ==========================================================================

// Finder automatisk ud af, om du tester lokalt eller kører live på Render
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : window.location.origin;

// Global reference til dit pizza-chart objekt
let pizzaChartInstance = null;

/**
 * Central router der styrer alt indhold på skærmen baseret på den valgte fane
 */
function switchView(viewId) {
    console.log("LOG: Skifter visning til -> " + viewId);
    
    // 🎯 DOM-STØVSUGER: Sletter alle gamle faners indstillingsskuffer øjeblikkeligt!
    // Dette forhindrer at dropdowns smitter af på hinanden, når du skifter fane.
    document.querySelectorAll('.filter-drawer, .stats-filter-drawer, .scatter-filter-drawer, .table-filter-drawer').forEach(drawer => {
        drawer.remove();
    });

    // 1. NAVIGATION: Opdater aktive klasser på knapperne i sidebaren
    const allNavItems = document.querySelectorAll('.nav-item');
    allNavItems.forEach(item => item.classList.remove('active'));
    
    allNavItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes("'" + viewId + "'")) {
            item.classList.add('active');
        }
    });

    // Luk mobilmenuen hvis den er åben
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) navMenu.classList.remove('mobile-open');

    // 2. CONTAINER-TJEK: Find det centrale visningsområde i index.html
    const contentArea = document.getElementById('dynamic-content-area');
    if (!contentArea) {
        console.error("FEJL: Kunne ikke finde #dynamic-content-area i HTML'en.");
        return;
    }

    // Gem den nuværende valgte spiller som fallback til den næste fane, der indlæses
    const fallbackPlayer = (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER) ? CURRENT_SELECTED_PLAYER : "";

    // 3. CENTRAL ROUTING MATRIX 🎯
    
    // Visning: HOME / LANDING PAGE
    if (viewId === 'landing' || viewId === 'home') {
        contentArea.innerHTML = `
            <section id="view-landing" class="content-view active">
                <div class="hero-container">
                    <div class="dashboard-tag">WELCOME!</div>
                    <h1 class="hero-title">ALL YOU NEED<br><span class="highlight">PER 90</span></h1>
                    <p class="hero-subtitle">Advanced data from 25 leagues worldwide. Advanced data from 25 leagues worldwide. Advanced data from 25 leagues worldwide. Advanced data from 25 leagues worldwide.</p>
                </div>
                <div class="stats-grid">
                    <div class="stat-card c-rooney">
                        <div class="stat-value">4.440</div>
                        <div class="stat-label">Minutter</div>
                        <div class="stat-desc">Højeste spilletid</div>
                    </div>
                    <div class="stat-card c-ronaldinho">
                        <div class="stat-value">684</div>
                        <div class="stat-label">Spillere</div>
                        <div class="stat-desc">Liga-database</div>
                    </div>
                    <div class="stat-card c-davids">
                        <div class="stat-value">47</div>
                        <div class="stat-label">Metrikker</div>
                        <div class="stat-desc">Parametre målt pr. kamp</div>
                    </div>
                    <div class="stat-card c-henry">
                        <div class="stat-value">73</div>
                        <div class="stat-label">Modeller</div>
                        <div class="stat-desc">Taktiske spillestile</div>
                    </div>
                </div>
            </section>
        `;
    } 
    // Visning: PIZZA CHART ENGINE
    else if (viewId === 'pizza') {
        if (typeof initPizzaView === 'function') {
            initPizzaView(contentArea);
            if (fallbackPlayer && typeof onPizzaFilterChange === 'function') {
                onPizzaFilterChange();
            }
        } else {
            console.error("FEJL: initPizzaView() blev ikke fundet i pizza.js");
        }
    } 
    // Visning: RADAR SPIDERWEB ENGINE
    else if (viewId === 'radar') {
        if (typeof initRadarView === 'function') {
            initRadarView(contentArea);
            if (fallbackPlayer && typeof onRadarFilterChange === 'function') {
                onRadarFilterChange();
            }
        } else {
            console.error("FEJL: initRadarView() blev ikke fundet i radar.js");
        }
    }
    // Visning: PLAYER STATS PROFILE DASHBOARD
    else if (viewId === 'player_stats') {
        if (typeof initPlayerStatsView === 'function') {
            initPlayerStatsView(contentArea);
            if (fallbackPlayer && typeof onStatsFilterChange === 'function') {
                onStatsFilterChange();
            }
        } else {
            console.error("FEJL: initPlayerStatsView() blev ikke fundet i stats.js");
        }
    }
    // Visning: SCATTER PLOT COORDINATE GRAPH
    else if (viewId === 'scatter') {
        if (typeof initScatterView === 'function') {
            initScatterView(contentArea);
            if (fallbackPlayer && typeof onScatterFilterChange === 'function') {
                onScatterFilterChange();
            }
        } else {
            console.error("FEJL: initScatterView() blev ikke fundet i scatter.js");
        }
    }
    // Visning: TOP 10 LEADERBOARD TABLE
    else if (viewId === 'table') {
        if (typeof initTableView === 'function') {
            initTableView(contentArea);
            if (fallbackPlayer && typeof onTableFilterChange === 'function') {
                onTableFilterChange();
            }
        } else {
            console.error("FEJL: initTableView() blev ikke fundet i table.js");
        }
    }

    // Visning: ADVANCED STAT FILTERS ENGINE
    else if (viewId === 'stat_filters') {
        if (typeof initFiltersView === 'function') {
            initFiltersView(contentArea);
            // Hvis der er en global spiller valgt, kan du køre et filter-change fallback her
            if (fallbackPlayer && typeof onFiltersFilterChange === 'function') {
                onFiltersFilterChange();
            }
        } else {
            console.error("FEJL: initFiltersView() blev ikke fundet i filters.js");
        }
    }

    // Visning: PLAYER SIMILARITY ENGINE
    else if (viewId === 'similarity') {
        if (typeof initSimilarityView === 'function') {
            initSimilarityView(contentArea);
            // Giver den nuværende valgte spiller med videre som fallback, hvis det ønskes
            if (fallbackPlayer && typeof onSimilarityFilterChange === 'function') {
                onSimilarityFilterChange();
            }
        } else {
            console.error("FEJL: initSimilarityView() blev ikke fundet i similarity.js");
        }
    }

    // Visning: CUSTOM PERFORMANCE RANKING ENGINE
    else if (viewId === 'ranking') {
        if (typeof initRankingView === 'function') {
            initRankingView(contentArea);
            if (fallbackPlayer && typeof onRankingFilterChange === 'function') {
                onRankingFilterChange();
            }
        } else {
            console.error("FEJL: initRankingView() blev ikke fundet i ranking.js");
        }
    }

    // Visning: TACTICAL MATCH REPORT ENGINE
    else if (viewId === 'matchreport') {
        if (typeof initMatchReportView === 'function') {
            initMatchReportView(contentArea);
        } else {
            console.error("FEJL: initMatchReportView() blev ikke fundet i matchreport.js");
        }
    }

    // Visning: WHOSCORED ADVANCED EVENT DATA ENGINE
    else if (viewId === 'eventdata') {
        if (typeof initEventDataView === 'function') {
            initEventDataView(contentArea);
        } else {
            console.error("FEJL: initEventDataView() blev ikke fundet i eventdata.js");
        }
    }


    // Visning: FALLBACK PLACEHOLDERS (De resterende 5 faner under opbygning)
    else {
        const faneNavn = viewId.replace('_', ' ').toUpperCase();
        contentArea.innerHTML = `
            <section class="content-view active" style="text-align: center; padding: 60px 20px;">
                <div style="margin-bottom: 20px;">
                    <i class="fa-solid fa-screwdriver-wrench" style="font-size: 60px; color: var(--text-muted); opacity: 0.5;"></i>
                </div>
                <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px;">${faneNavn}</h2>
                <p style="color: var(--text-muted);">Denne fane is under opbygning. Logik og diagrammer tilføjes i din ${viewId}.js fil senere.</p>
            </section>
        `;
    }
}

// ==========================================================================
// MOBIL-NAVIGATION OG EVENT HANDLING
// ==========================================================================

/**
 * Sørger for, at mobilmenuen toggler åben/lukket fejlfrit,
 * når man klikker på selve overskriften/pilen på telefonen!
 */
function toggleMobileMenu(event) {
    if (event.target.closest('.nav-item')) return;
    
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('mobile-open');
    }
}