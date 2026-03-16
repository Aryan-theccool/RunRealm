import {
  player, todayStats, territories, leaderboard, clanData, clanLeaderboard,
  recentRuns, battlePassFeatures, achievements, mapThemes, comparisonTable
} from './data.js';

// ── State ──────────────────────────────────────────────────
let currentScreen = 'home';
let runState = {
  running: false, paused: false, elapsed: 0, distance: 0, captureProgress: 12,
  timerId: null, gpsWatchId: null, lastPos: null, gpsActive: false, gpsError: false,
  capturedCells: new Set(), totalCaptured: 0,
  pace: '--:--', calories: 0
};
let rankTab = 'Global';
let subscribed = false;
let selectedTheme = 1;

let mapInstance = null;
let userMarker = null;
let mapPolygons = [];

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderTabBar();
  navigateTo('home');
});

// ── Navigation ─────────────────────────────────────────────
function navigateTo(screen) {
  if (runState.running && screen !== 'map') stopRun();
  currentScreen = screen;
  const container = document.getElementById('screen-container');
  container.scrollTop = 0;
  switch (screen) {
    case 'home': container.innerHTML = renderHome(); break;
    case 'map': container.innerHTML = renderMap(); initMapInteractions(); break;
    case 'rank': container.innerHTML = renderRank(); initRankTabs(); break;
    case 'plus': container.innerHTML = renderPlus(); initPlusInteractions(); break;
    case 'profile': container.innerHTML = renderProfile(); break;
  }
  updateTabBar();
}

function renderTabBar() {
  const tabs = [
    { key: 'home', icon: '🏠', label: 'Home' },
    { key: 'map', icon: '🗺️', label: 'Map' },
    { key: 'rank', icon: '🏆', label: 'Rank' },
    { key: 'plus', icon: '⚡', label: 'Plus' },
    { key: 'profile', icon: '👤', label: 'Profile' },
  ];
  document.getElementById('tab-bar').innerHTML = tabs.map(t => `
    <button class="tab-item ${currentScreen === t.key ? 'active' : ''}" data-tab="${t.key}">
      <span class="tab-icon">${t.icon}</span>
      <span class="tab-label">${t.label}</span>
    </button>
  `).join('');
  document.querySelectorAll('.tab-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.tab));
  });
}

function updateTabBar() {
  document.querySelectorAll('.tab-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === currentScreen);
  });
}

// ── Helpers ────────────────────────────────────────────────
const pct = (v, m) => Math.min((v / m) * 100, 100);
const fmt = (n) => n.toLocaleString();
const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

function progressBar(value, max, cls = '') {
  return `<div class="progress-track"><div class="progress-fill ${cls}" style="width:${pct(value,max)}%"></div></div>`;
}

function strengthColor(s) {
  if (s > 70) return 'progress-fill-green';
  if (s > 40) return '';
  return 'progress-fill-red';
}

// Haversine distance between two GPS coords in km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Calculate pace from distance/time
function calcPace(distKm, elapsedS) {
  if (distKm <= 0) return '--:--';
  const paceS = elapsedS / distKm;
  const m = Math.floor(paceS/60), s = Math.floor(paceS%60);
  return `${m}:${String(s).padStart(2,'0')}`;
}

// Show toast notification
function showToast(icon, title, msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-icon">${icon}</div><div class="flex-1"><div class="font-bold text-sm">${title}</div><div class="text-xs text-muted mt-1">${msg}</div></div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ══════════════════════════════════════════════════════════
// HOME SCREEN
// ══════════════════════════════════════════════════════════
function renderHome() {
  return `
    <div class="flex flex-row items-center justify-between mb-4">
      <div class="flex flex-row items-center gap-3">
        <div class="avatar">${player.name.charAt(0)}</div>
        <div>
          <div class="font-bold text-base">${player.name}</div>
          <div class="text-orange text-xs">Level ${player.level} ${player.title}</div>
        </div>
      </div>
      <div class="flex flex-row items-center gap-2">
        <div class="streak-badge">🔥 ${player.streak} day streak</div>
        <button class="notif-btn">🔔</button>
      </div>
    </div>

    <div class="card">
      <div class="flex flex-row justify-between mb-1">
        <span class="text-xs text-muted">Progress to Level 13</span>
        <span class="text-xs text-orange">${fmt(player.xp)} / ${fmt(player.xpToNext)} XP</span>
      </div>
      ${progressBar(player.xp, player.xpToNext)}
    </div>

    <div class="flex flex-row gap-2 mb-3">
      <div class="stat-card stat-card-accent">
        <div class="stat-label">Territory Strength</div>
        <div class="stat-value">${fmt(player.xp)}</div>
        <div class="stat-sub">↑+12% this week</div>
      </div>
      <div class="stat-card stat-card-default">
        <div class="stat-label">Global Rank</div>
        <div class="stat-value">#${player.globalRank}</div>
        <div class="stat-sub">Top ${Math.round((player.globalRank/player.totalUsers)*100)}%</div>
      </div>
    </div>

    <div class="kingdom-preview">
      <div class="kingdom-map">
        <div class="grid-lines"></div>
        <div class="kingdom-castle"><span>🏰</span></div>
        <div class="kingdom-label">YOUR TERRITORY</div>
        <button class="kingdom-cta" onclick="window._nav('map')">View Map →</button>
      </div>
      <div class="kingdom-info">
        <div class="font-semibold text-sm">Zone 1 - Local District</div>
        <div class="text-muted text-xs mt-1">${player.territories} sectors captured</div>
      </div>
    </div>

    <div class="card">
      <div class="flex flex-row justify-between items-center mb-3">
        <span class="font-bold text-base">Today's Progress</span>
        <button style="background:none;border:none;color:var(--orange);font-size:0.8rem;font-weight:600;cursor:pointer" onclick="window._nav('profile')">History</button>
      </div>
      <div class="flex flex-row gap-2 mb-3">
        <div class="run-stat-pill"><span class="emoji">🏃</span><span class="font-bold text-sm">${todayStats.distance} km</span><span class="text-xs text-dim">Distance</span></div>
        <div class="run-stat-pill"><span class="emoji">⚡</span><span class="font-bold text-sm">${todayStats.influence} pts</span><span class="text-xs text-dim">Influence</span></div>
        <div class="run-stat-pill"><span class="emoji">⏱️</span><span class="font-bold text-sm">${todayStats.pace}</span><span class="text-xs text-dim">Pace /km</span></div>
        <div class="run-stat-pill"><span class="emoji">🔥</span><span class="font-bold text-sm">${todayStats.calories}</span><span class="text-xs text-dim">Calories</span></div>
      </div>
      <div class="flex flex-row justify-between mb-1">
        <span class="text-xs text-muted">Daily Goal</span>
        <span class="text-xs text-orange">${todayStats.distance} / ${todayStats.goal} km</span>
      </div>
      ${progressBar(todayStats.distance, todayStats.goal)}
    </div>

    <button class="cta-btn mb-3" onclick="window._nav('map')">
      <span>▶  START RUN</span>
      <span class="cta-sub">Capture territory · Earn XP · Dominate your city</span>
    </button>

    <div class="section-header"><h3>My Territories</h3><button onclick="window._nav('map')">See all</button></div>
    ${territories.map(t => `
      <div class="card flex flex-row items-center gap-3">
        <div class="territory-flag" style="background:${t.color}22">🏴</div>
        <div class="flex-1">
          <div class="font-semibold text-sm">${t.shortName}</div>
          <div class="flex flex-row items-center gap-2 mt-1">
            <div class="flex-1">${progressBar(t.strength, 100, strengthColor(t.strength))}</div>
            <span class="text-xs text-muted" style="width:28px">${t.strength}%</span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs text-dim">${t.capturedDaysAgo}d ago</div>
          <div class="text-xs ${t.strength < 50 ? 'text-red' : 'text-green'}">${t.strength < 50 ? '⚠ Decaying' : '✓ Strong'}</div>
        </div>
      </div>
    `).join('')}

    <div class="section-header"><h3>Recent Runs</h3></div>
    ${recentRuns.map(r => `
      <div class="card flex flex-row items-center justify-between">
        <div class="flex flex-row items-center gap-3">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--orange-bg);display:flex;align-items:center;justify-content:center;font-size:1rem">🏃</div>
          <div>
            <div class="font-semibold text-sm">${r.distance} km</div>
            <div class="text-xs text-dim">${r.date} · ${r.duration}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-orange font-bold text-sm">+${r.xp} XP</div>
          <div class="text-xs text-dim">${r.zones} zone${r.zones > 1 ? 's' : ''}</div>
        </div>
      </div>
    `).join('')}
  `;
}

// ══════════════════════════════════════════════════════════
// MAP SCREEN
// ══════════════════════════════════════════════════════════
function renderMap() {
  const isR = runState.running;
  return `
    <div class="flex flex-row justify-between items-center mb-3" style="padding-bottom:10px;border-bottom:1px solid var(--border)">
      <button style="background:none;border:none;color:var(--text-muted);font-size:0.9rem;cursor:pointer" onclick="window._nav('home')">← Back</button>
      <div class="text-center">
        <div class="font-bold text-sm">${isR ? '🟢 RUNNING' : 'TERRITORY MAP'}</div>
        ${isR ? `<div class="text-orange text-xs" id="run-timer" style="font-family:monospace">${fmtTime(runState.elapsed)}</div>` : ''}
      </div>
      <button class="notif-btn">⚙️</button>
    </div>

    <div class="card" style="padding:0;overflow:hidden;position:relative;z-index:1;">
      <div id="leaflet-map" style="width:100%;height:320px;z-index:1;"></div>
      <div class="map-legend" style="position:absolute;bottom:10px;left:10px;right:10px;z-index:1000;background:rgba(10,10,15,0.85);backdrop-filter:blur(8px);border-radius:12px;padding:8px;border:1px solid rgba(255,107,0,0.2);display:flex;justify-content:space-around;">
        <div class="legend-item"><div class="legend-dot" style="background:var(--orange)"></div>Your Zone</div>
        <div class="legend-item"><div class="legend-dot" style="background:rgba(59,130,246,0.6)"></div>Nearby</div>
        <div class="legend-item"><div class="legend-dot" style="background:rgba(239,68,68,0.6)"></div>Enemy</div>
      </div>
    </div>

    ${isR ? `
      <div class="card live-stats">
        <div id="gps-indicator" class="gps-status ${runState.gpsActive ? '' : runState.gpsError ? 'gps-error' : 'gps-warn'}">
          <div class="gps-dot"></div>
          ${runState.gpsActive ? 'GPS Active' : runState.gpsError ? 'Simulation Active (GPS Error)' : 'Acquiring GPS...'}
        </div>
      </div>
      <div class="card live-stats mt-2">
        <div class="flex flex-row mb-3">
          <div class="live-stat-item"><div class="live-stat-value" id="run-dist">${runState.distance.toFixed(2)} km</div><div class="live-stat-label">Distance</div></div>
          <div class="live-stat-item"><div class="live-stat-value" id="run-pace">${runState.pace}</div><div class="live-stat-label">Pace /km</div></div>
          <div class="live-stat-item"><div class="live-stat-value" id="run-cal">${runState.calories}</div><div class="live-stat-label">Calories</div></div>
        </div>
        <div class="capture-box">
          <div class="flex flex-row justify-between mb-1">
            <span class="font-semibold text-sm">🏴 Sector Capture</span>
            <span class="text-orange font-bold" id="capture-pct">${runState.captureProgress.toFixed(0)}%</span>
          </div>
          <div class="text-xs text-muted mb-2">Zone 1 - Sector 4</div>
          <div class="progress-track" style="height:8px"><div class="progress-fill" id="capture-bar" style="width:${runState.captureProgress}%"></div></div>
          <div class="text-xs text-dim mt-1" id="capture-remaining">${(100-runState.captureProgress).toFixed(0)}% remaining to capture</div>
        </div>
      </div>
    ` : ''}

    <div class="font-bold text-base mb-3 mt-3">${isR ? 'Zones In Range' : 'Territory Overview'}</div>
    ${territories.map(t => `
      <div class="card">
        <div class="flex flex-row justify-between items-center mb-2">
          <div class="flex-1"><div class="font-semibold text-sm">${t.name}</div><div class="text-xs text-dim mt-1">Captured ${t.capturedDaysAgo} days ago</div></div>
          <div class="badge-chip badge-orange" style="background:${t.color}22;color:${t.color};border-color:${t.color}44">${t.strength}% strength</div>
        </div>
        ${progressBar(t.strength, 100, strengthColor(t.strength))}
        ${isR ? '<button class="zone-run-btn">🏃 Run Through Zone</button>' : ''}
      </div>
    `).join('')}

    <div class="run-controls" id="run-controls">
      ${isR ? `
        <div class="run-btn-row">
          <button class="run-btn run-btn-pause" id="btn-pause-run">${runState.paused ? '▶ Resume' : '⏸ Pause'}</button>
          <button class="run-btn run-btn-end" id="btn-end-run">⏹ End Run</button>
        </div>
      ` : `
        <button class="cta-btn" id="btn-start-run"><span>▶  START CAPTURING</span><span class="cta-sub">GPS tracking will begin</span></button>
      `}
    </div>
  `;
}

function drawTerritories(cLat, cLon) {
  mapPolygons.forEach(p => p.remove());
  mapPolygons = [];
  const offset = 0.005;
  const zones = [
    { coords: [[cLat-offset, cLon-offset], [cLat+offset, cLon-offset], [cLat+offset, cLon+offset], [cLat-offset, cLon+offset]], color: '#ff6b00', fillOpacity: 0.35, border: '#ff8a33' },
    { coords: [[cLat-offset, cLon+offset*1.1], [cLat+offset, cLon+offset*1.1], [cLat+offset, cLon+offset*3], [cLat-offset, cLon+offset*3]], color: '#ef4444', fillOpacity: 0.25, border: '#f87171' },
    { coords: [[cLat+offset*1.1, cLon-offset], [cLat+offset*3, cLon-offset], [cLat+offset*3, cLon+offset], [cLat+offset*1.1, cLon+offset]], color: '#3b82f6', fillOpacity: 0.25, border: '#60a5fa' }
  ];
  zones.forEach(z => {
    const polygon = L.polygon(z.coords, {
      color: z.border, weight: 2, fillColor: z.color, fillOpacity: z.fillOpacity, className: 'territory-polygon'
    }).addTo(mapInstance);
    mapPolygons.push(polygon);
  });
}

function initMapInteractions() {
  const s = document.getElementById('btn-start-run');
  const e = document.getElementById('btn-end-run');
  const p = document.getElementById('btn-pause-run');
  if (s) s.addEventListener('click', startRun);
  if (e) e.addEventListener('click', () => { stopRun(); navigateTo('map'); });
  if (p) {
    p.addEventListener('click', (ev) => {
      runState.paused = !runState.paused;
      ev.target.innerHTML = runState.paused ? '▶ Resume' : '⏸ Pause';
      if (runState.paused) {
        ev.target.style.background = 'var(--orange-bg)';
        ev.target.style.color = 'var(--orange)';
      } else {
        ev.target.style.background = '';
        ev.target.style.color = '';
      }
    });
  }

  // Initialize Leaflet Map
  const mapEl = document.getElementById('leaflet-map');
  if (mapEl && window.L) {
    if (mapInstance) { mapInstance.remove(); }
    const centerLat = runState.lastPos ? runState.lastPos.lat : 0;
    const centerLon = runState.lastPos ? runState.lastPos.lon : 0;
    
    mapInstance = L.map('leaflet-map', { zoomControl: false, attributionControl: false }).setView([centerLat, centerLon], centerLat === 0 ? 2 : 15);

    function updateMapLocation(lat, lon) {
      runState.lastPos = { lat, lon };
      if (mapInstance) {
        mapInstance.setView([lat, lon], 15);
      }
      if (userMarker) {
        userMarker.setLatLng([lat, lon]);
      } else {
        const markerHtml = `<div style="width:16px;height:16px;background:var(--orange);border-radius:50%;border:2px solid #fff;box-shadow:0 0 15px var(--orange);animation:pulse 2s infinite"></div>`;
        const userIcon = L.divIcon({ html: markerHtml, className: '', iconSize: [16, 16], iconAnchor: [8, 8] });
        userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(mapInstance);
      }
      drawTerritories(lat, lon);
    }

    // Handlers for initial location fetch
    if (centerLat === 0) {
      const fallbackToIP = () => {
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            if (data.latitude && data.longitude && (!runState.lastPos || runState.lastPos.lat === 0)) {
              updateMapLocation(data.latitude, data.longitude);
            }
          }).catch(e => console.error('IP Geolocation failed:', e));
      };

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          p => {
            updateMapLocation(p.coords.latitude, p.coords.longitude);
          },
          err => {
            console.warn('Native GPS failed, falling back to IP:', err);
            fallbackToIP();
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      } else {
        fallbackToIP();
      }
    }

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 20
    }).addTo(mapInstance);

    if (centerLat !== 0) {
      drawTerritories(centerLat, centerLon);
      const markerHtml = `<div style="width:16px;height:16px;background:var(--orange);border-radius:50%;border:2px solid #fff;box-shadow:0 0 15px var(--orange);animation:pulse 2s infinite"></div>`;
      const userIcon = L.divIcon({ html: markerHtml, className: '', iconSize: [16, 16], iconAnchor: [8, 8] });
      userMarker = L.marker([centerLat, centerLon], { icon: userIcon }).addTo(mapInstance);
    }
  }
}

function startRun() {
  runState.running = true; runState.paused = false; runState.elapsed = 0; runState.distance = 0;
  runState.captureProgress = 0; runState.lastPos = null;
  runState.gpsActive = false; runState.gpsError = false;
  runState.capturedCells = new Set(); runState.totalCaptured = 0;
  runState.pace = '--:--'; runState.calories = 0;
  navigateTo('map');

  // Start GPS tracking
  if ('geolocation' in navigator) {
    runState.gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (runState.paused) return; // ignore tracking if paused
        runState.gpsActive = true; runState.gpsError = false;
        const { latitude, longitude } = pos.coords;
        if (runState.lastPos) {
          const d = haversine(runState.lastPos.lat, runState.lastPos.lon, latitude, longitude);
          if (d > 0.001 && d < 0.5) { // filter GPS noise, ignore jumps > 500m
            runState.distance = +(runState.distance + d).toFixed(3);
            runState.captureProgress = Math.min(runState.captureProgress + d * 50, 100); // 2km to capture
            runState.calories = Math.round(runState.distance * 60);
            // Territory capture logic — every 0.2km run captures a territory cell
            const newCells = Math.floor(runState.distance / 0.2);
            if (newCells > runState.totalCaptured) {
              const diff = newCells - runState.totalCaptured;
              runState.totalCaptured = newCells;
              for (let i = 0; i < diff; i++) {
                const cellId = `cap-${runState.totalCaptured - diff + i}`;
                runState.capturedCells.add(cellId);
              }
              // Update territory strengths
              territories.forEach((t, idx) => { t.strength = Math.min(t.strength + diff * 3, 100); });
              showToast('🏴', 'Territory Strengthened!', `+${diff*3}% strength · ${runState.distance.toFixed(1)} km run`);
              // Capture a territory cell on real map
              if (mapInstance && userMarker) {
                const pLat = runState.lastPos.lat + (Math.random()-0.5)*0.004;
                const pLon = runState.lastPos.lon + (Math.random()-0.5)*0.004;
                const cOff = 0.0008;
                const newPoly = L.polygon([
                  [pLat-cOff, pLon-cOff], [pLat+cOff, pLon-cOff],
                  [pLat+cOff, pLon+cOff], [pLat-cOff, pLon+cOff]
                ], { color: '#ff8a33', weight: 2, fillColor: '#ff6b00', fillOpacity: 0.4 }).addTo(mapInstance);
                mapPolygons.push(newPoly);
              }
            }
          }
        }
        runState.lastPos = { lat: latitude, lon: longitude };
        if (mapInstance && userMarker) {
          userMarker.setLatLng([latitude, longitude]);
          mapInstance.panTo([latitude, longitude]);
        }
        // Update GPS status indicator
        const gpsEl = document.getElementById('gps-indicator');
        if (gpsEl) gpsEl.innerHTML = `<div class="gps-dot"></div>GPS Active · ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        if (gpsEl) { gpsEl.className = 'gps-status'; }
      },
      (err) => {
        runState.gpsError = true; runState.gpsActive = false;
        const gpsEl = document.getElementById('gps-indicator');
        if (gpsEl) { 
          gpsEl.className = 'gps-status gps-error'; 
          gpsEl.innerHTML = `<div class="gps-dot"></div>GPS Error / HTTPS Required (Simulation active)`; 
        }
        if (err.code === err.PERMISSION_DENIED) {
           showToast('⚠️', 'GPS Permission Denied', 'If on mobile, enable GPS and ensure site uses HTTPS.');
        }
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  } else {
    runState.gpsError = true;
    showToast('⚠️', 'GPS Unsupported', 'Geolocation API not supported in this browser (or requires HTTPS).');
  }

  // Timer for elapsed time + fallback simulation when GPS is unavailable
  runState.timerId = setInterval(() => {
    if (runState.paused) return; // stop all logic if paused
    runState.elapsed++;
    runState.pace = calcPace(runState.distance, runState.elapsed);
    // Fallback: if no GPS after 5s, simulate movement
    if (!runState.gpsActive && runState.elapsed > 5) {
      runState.distance = +(runState.distance + 0.002 + Math.random()*0.002).toFixed(3);
      runState.captureProgress = Math.min(runState.captureProgress + 0.3, 100);
      runState.calories = Math.round(runState.distance * 60);
      
      if(!runState.lastPos) runState.lastPos = {lat: 0, lon: 0};
      runState.lastPos.lat += 0.00005;
      runState.lastPos.lon += 0.00008;
      if (mapInstance && userMarker) {
        userMarker.setLatLng([runState.lastPos.lat, runState.lastPos.lon]);
        mapInstance.panTo([runState.lastPos.lat, runState.lastPos.lon]);
      }

      const newCells = Math.floor(runState.distance / 0.2);
      if (newCells > runState.totalCaptured) {
        const diff = newCells - runState.totalCaptured;
        runState.totalCaptured = newCells;
        territories.forEach(t => { t.strength = Math.min(t.strength + diff * 3, 100); });
        showToast('🏴', 'Territory Strengthened!', `+${diff*3}% strength · ${runState.distance.toFixed(1)} km run`);
        if (mapInstance && userMarker) {
          const pLat = runState.lastPos.lat + (Math.random()-0.5)*0.004;
          const pLon = runState.lastPos.lon + (Math.random()-0.5)*0.004;
          const cOff = 0.0008;
          const newPoly = L.polygon([
            [pLat-cOff, pLon-cOff], [pLat+cOff, pLon-cOff],
            [pLat+cOff, pLon+cOff], [pLat-cOff, pLon+cOff]
          ], { color: '#ff8a33', weight: 2, fillColor: '#ff6b00', fillOpacity: 0.4 }).addTo(mapInstance);
          mapPolygons.push(newPoly);
        }
      }
    }
    // Update UI elements
    const t = document.getElementById('run-timer'), d = document.getElementById('run-dist');
    const p = document.getElementById('capture-pct'), b = document.getElementById('capture-bar');
    const r = document.getElementById('capture-remaining'), pc = document.getElementById('run-pace');
    const cal = document.getElementById('run-cal');
    if (t) t.textContent = fmtTime(runState.elapsed);
    if (d) d.textContent = `${runState.distance.toFixed(2)} km`;
    if (p) p.textContent = `${runState.captureProgress.toFixed(0)}%`;
    if (b) b.style.width = `${runState.captureProgress}%`;
    if (r) r.textContent = `${(100-runState.captureProgress).toFixed(0)}% remaining to capture`;
    if (pc) pc.textContent = runState.pace;
    if (cal) cal.textContent = runState.calories;
    // Check if sector fully captured
    if (runState.captureProgress >= 100 && !runState._sectorCaptured) {
      runState._sectorCaptured = true;
      showToast('🏰', 'SECTOR CAPTURED!', 'Zone 4 is now yours! +500 XP');
    }
  }, 1000);
}

function stopRun() {
  runState.running = false;
  clearInterval(runState.timerId); runState.timerId = null;
  if (runState.gpsWatchId !== null) {
    navigator.geolocation.clearWatch(runState.gpsWatchId);
    runState.gpsWatchId = null;
  }
  if (runState.distance > 0) {
    const xp = Math.round(runState.distance * 25);
    const durationArr = fmtTime(runState.elapsed).split(':');
    const displayDuration = durationArr.length > 2 ? fmtTime(runState.elapsed) : `00:${fmtTime(runState.elapsed)}`;
    
    // Persist to today's stats
    todayStats.distance = +(todayStats.distance + runState.distance).toFixed(2);
    todayStats.calories += runState.calories;
    todayStats.xp += xp; // Update player XP too
    player.xp += xp;
    
    // Add to history
    recentRuns.unshift({
      id: Date.now(),
      date: 'Just Now',
      distance: runState.distance.toFixed(2),
      zones: runState.totalCaptured || 0,
      xp: xp,
      duration: fmtTime(runState.elapsed)
    });

    showToast('🏃', 'Run Complete!', `${runState.distance.toFixed(2)} km · ${fmtTime(runState.elapsed)} · +${xp} XP`);
  }
}

// ══════════════════════════════════════════════════════════
// RANK SCREEN
// ══════════════════════════════════════════════════════════
function renderRank() {
  return `
    <div class="text-2xl font-bold mb-1">Leaderboard</div>
    <div class="text-dim text-sm mb-4">Updated every 6 hours</div>
    <div class="tab-switcher" id="rank-tabs">
      ${['Global','City','Clans'].map(t => `<button class="tab-btn ${rankTab===t?'active':''}" data-rank-tab="${t}">${t}</button>`).join('')}
    </div>
    <div id="rank-content">${renderRankContent()}</div>
  `;
}

function renderRankContent() {
  if (rankTab === 'Clans') return renderClanTab();
  const top = leaderboard.filter(e => !e.isUser);
  const user = leaderboard.find(e => e.isUser);
  const top3 = [top[1], top[0], top[2]];
  return `
    <div class="podium">
      ${top3.map((e, i) => {
        const me = ['🥈','🥇','🥉'][i], rk = [2,1,3][i];
        return `<div class="podium-item" style="animation:popIn ${0.3+i*0.15}s ease-out">
          <div class="podium-avatar">${e.badge}</div>
          <div class="${i===1?'text-orange':'text-white'} text-xs font-bold">${e.name}</div>
          <div class="text-xs text-dim">Lv.${e.level}</div>
          <div class="podium-bar"><span class="emoji">${me}</span><span class="text-xs ${i===1?'text-orange':'text-dim'} font-bold">#${rk}</span></div>
        </div>`;
      }).join('')}
    </div>
    ${top.slice(3).map(e => `
      <div class="card rank-item">
        <span class="rank-number">#${e.rank}</span>
        <div class="rank-badge">${e.badge}</div>
        <div class="flex-1"><div class="font-semibold text-sm">${e.name}</div><div class="text-xs text-dim">${e.city} · Lv.${e.level}</div></div>
        <span class="font-bold text-sm">${fmt(e.score)}</span>
      </div>
    `).join('')}
    ${user ? `
      <div class="separator"><div class="separator-line"></div><span class="separator-text">Your position</span><div class="separator-line"></div></div>
      <div class="rank-item rank-item-user">
        <span class="rank-number">#${user.rank}</span><div class="rank-badge">${user.badge}</div>
        <div class="flex-1"><div class="text-orange font-semibold text-sm">${user.name}</div><div class="text-xs text-dim">${user.city} · Lv.${user.level}</div></div>
        <span class="text-orange font-bold text-sm">${fmt(user.score)}</span>
      </div>
      <div class="text-center text-xs text-dim mt-2">Run 23.4 km more to reach Rank #144 🔥</div>
    ` : ''}
  `;
}

function renderClanTab() {
  return `
    <div class="clan-hero-card">
      <div class="flex flex-row justify-between items-center mb-3">
        <div><div class="text-orange text-xs uppercase tracking-widest">Your Clan</div><div class="text-xl font-bold mt-1">${clanData.name}</div></div>
        <div class="badge-chip badge-orange" style="font-size:0.8rem;padding:6px 14px">Rank #${clanData.rank}</div>
      </div>
      <div class="flex flex-row gap-4">
        <div><div class="font-bold">${clanData.members}</div><div class="text-xs text-muted">Members</div></div>
        <div><div class="font-bold">${fmt(clanData.weeklyScore)}</div><div class="text-xs text-muted">Weekly XP</div></div>
        <div><div class="font-bold">${clanData.territory}</div><div class="text-xs text-muted">Territory</div></div>
      </div>
    </div>
    ${clanLeaderboard.map(c => `
      <div class="card rank-item ${c.isUser?'rank-item-user':''}">
        <span class="rank-number" ${c.isUser?'style="color:var(--orange)"':''}>#${c.rank}</span>
        <div class="rank-badge">${c.badge}</div>
        <div class="flex-1"><div class="font-semibold text-sm ${c.isUser?'text-orange':''}">${c.name}</div><div class="text-xs text-dim">${c.members} members</div></div>
        <span class="font-bold text-sm ${c.isUser?'text-orange':''}">${fmt(c.score)} XP</span>
      </div>
    `).join('')}
  `;
}

function initRankTabs() {
  document.querySelectorAll('[data-rank-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      rankTab = btn.dataset.rankTab;
      document.querySelectorAll('[data-rank-tab]').forEach(b => b.classList.toggle('active', b.dataset.rankTab === rankTab));
      document.getElementById('rank-content').innerHTML = renderRankContent();
    });
  });
}

// ══════════════════════════════════════════════════════════
// PLUS SCREEN
// ══════════════════════════════════════════════════════════
function renderPlus() {
  return `
    <div class="hero-banner">
      <div class="hero-tag">RunRealm Plus</div>
      <div class="text-2xl font-bold mb-1">Unlock Your<br>Full Potential</div>
      <div class="text-sm mb-4" style="color:rgba(255,255,255,0.8)">Advanced tools for serious runners.<br>Same fair gameplay for everyone.</div>
      ${subscribed ? `<div class="hero-subscribed"><div class="font-bold">✓ Active Subscription</div><div class="text-xs mt-1" style="opacity:0.8">Renews on Apr 15, 2026</div></div>` : `<button class="hero-cta" id="btn-subscribe"><div>Start Monthly Plan · ₹199/mo</div><div class="hero-cta-sub">Cancel anytime · 7-day free trial</div></button>`}
    </div>

    <div class="font-bold text-base mb-3">Exclusive Benefits</div>
    ${battlePassFeatures.map(f => `
      <div class="card feature-item">
        <div class="feature-icon">${f.icon}</div>
        <div class="flex-1"><div class="font-semibold text-sm">${f.title}</div><div class="text-xs text-muted mt-1">${f.desc}</div></div>
        ${subscribed ? '<span class="text-green text-base">✓</span>' : '<div class="feature-tag">PLUS</div>'}
      </div>
    `).join('')}

    <div class="font-bold text-base mt-4 mb-3">Map Themes & Skins</div>
    <div class="theme-grid" id="theme-grid">
      ${mapThemes.map(t => `
        <div class="theme-card ${selectedTheme===t.id&&!t.locked?'active':''} ${t.locked&&!subscribed?'locked':''}" data-theme-id="${t.id}" data-locked="${t.locked&&!subscribed}">
          <div class="theme-emoji">${t.emoji}</div>
          <div class="text-xs font-semibold">${t.name}</div>
          ${t.locked&&!subscribed ? '<div class="text-xs text-dim mt-1">🔒 Plus</div>' : ''}
          ${(!t.locked||subscribed)&&selectedTheme===t.id ? '<div class="theme-dot"></div>' : ''}
        </div>
      `).join('')}
    </div>

    <div class="font-bold text-base mb-3">Free vs Plus</div>
    <div class="comparison-table mb-3">
      <div class="comparison-row" style="border-bottom:1px solid var(--border)">
        <div class="comparison-label comparison-header font-semibold">Feature</div>
        <div class="comparison-cell comparison-header">Free</div>
        <div class="comparison-cell comparison-plus-header comparison-plus-col">Plus</div>
      </div>
      ${comparisonTable.map(r => `
        <div class="comparison-row">
          <div class="comparison-label text-sm">${r.label}</div>
          <div class="comparison-cell ${r.free?'text-green':'text-dim'}">${r.free?'✓':'✗'}</div>
          <div class="comparison-cell comparison-plus-col ${r.plus?'text-green':'text-dim'}">${r.plus?'✓':'✗'}</div>
        </div>
      `).join('')}
    </div>

    <div class="corporate-card">
      <div class="flex flex-row items-center gap-2 mb-2">
        <span class="emoji">🏢</span><span class="font-bold">Corporate Wellness</span><span class="badge-chip badge-blue">Phase 2</span>
      </div>
      <div class="text-sm text-muted mb-3">Private company clans, team fitness competitions and leaderboards. Built for enterprises scaling health culture.</div>
      <button class="corporate-btn">Join Waitlist →</button>
    </div>

    ${!subscribed ? `<div class="sticky-cta"><button class="cta-btn" id="btn-subscribe-sticky"><span>Unlock RunRealm Plus · ₹199/mo</span><span class="cta-sub">7-day free trial · Cancel anytime</span></button></div>` : ''}
  `;
}

function initPlusInteractions() {
  document.querySelectorAll('#btn-subscribe, #btn-subscribe-sticky').forEach(btn => {
    if (btn) btn.addEventListener('click', () => showPaymentModal());
  });
  document.querySelectorAll('#theme-grid .theme-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.dataset.locked === 'true') return;
      selectedTheme = parseInt(card.dataset.themeId);
      navigateTo('plus');
    });
  });
}

// ══════════════════════════════════════════════════════════
// PAYMENT MODAL (no API — simulated flow)
// ══════════════════════════════════════════════════════════
function showPaymentModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'payment-modal';
  overlay.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" id="modal-close-btn">✕</button>
      <div class="modal-header">
        <div class="emoji-lg mb-2">🏰</div>
        <div class="text-lg font-bold">RunRealm Plus</div>
        <div class="text-xs text-muted mt-1">₹199/mo · 7-day free trial</div>
      </div>
      <div id="payment-form-content">
        <div class="form-group">
          <label class="form-label">Card Number</label>
          <input class="form-input" id="card-number" type="text" placeholder="4242 4242 4242 4242" maxlength="19" autocomplete="off">
        </div>
        <div class="form-group">
          <label class="form-label">Cardholder Name</label>
          <input class="form-input" id="card-name" type="text" placeholder="Your Name" autocomplete="off">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Expiry</label>
            <input class="form-input" id="card-expiry" type="text" placeholder="MM/YY" maxlength="5" autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label">CVV</label>
            <input class="form-input" id="card-cvv" type="text" placeholder="123" maxlength="3" autocomplete="off">
          </div>
        </div>
        <button class="pay-btn" id="pay-now-btn">Pay ₹199 — Start Trial</button>
        <div class="pay-secure">🔒 Payments are secure and encrypted</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Card number formatting
  const cardInput = document.getElementById('card-number');
  cardInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    e.target.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
  });

  // Expiry formatting
  const expiryInput = document.getElementById('card-expiry');
  expiryInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2);
    e.target.value = v;
  });

  // CVV - numbers only
  document.getElementById('card-cvv').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
  });

  // Close modal
  document.getElementById('modal-close-btn').addEventListener('click', closePaymentModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePaymentModal(); });

  // Pay button
  document.getElementById('pay-now-btn').addEventListener('click', processPayment);
}

function processPayment() {
  const btn = document.getElementById('pay-now-btn');
  const name = document.getElementById('card-name').value.trim();
  const card = document.getElementById('card-number').value.replace(/\s/g, '');
  const expiry = document.getElementById('card-expiry').value;
  const cvv = document.getElementById('card-cvv').value;

  // Basic validation
  if (!name || card.length < 16 || expiry.length < 5 || cvv.length < 3) {
    btn.textContent = 'Please fill all fields';
    btn.style.background = 'var(--red-bg)';
    btn.style.color = 'var(--red)';
    setTimeout(() => {
      btn.textContent = 'Pay ₹199 — Start Trial';
      btn.style.background = ''; btn.style.color = '';
    }, 2000);
    return;
  }

  // Simulate processing
  btn.disabled = true;
  btn.textContent = 'Processing...';

  setTimeout(() => {
    // Show success
    const formContent = document.getElementById('payment-form-content');
    const confetti = ['🎉','⭐','🏰','🎊','✨','🔥'].map((e, i) =>
      `<div class="confetti-particle" style="left:${20+i*12}%;top:${30+Math.random()*20}%;animation-delay:${i*0.1}s">${e}</div>`
    ).join('');
    formContent.innerHTML = `
      ${confetti}
      <div class="payment-success">
        <div class="success-check">✓</div>
        <div class="text-xl font-bold mb-1">Welcome to RunRealm Plus!</div>
        <div class="text-sm text-muted mb-3">Your 7-day free trial has started</div>
        <div class="card" style="text-align:left">
          <div class="flex flex-row justify-between mb-1"><span class="text-xs text-muted">Plan</span><span class="text-xs font-semibold">Monthly · ₹199/mo</span></div>
          <div class="flex flex-row justify-between mb-1"><span class="text-xs text-muted">Trial ends</span><span class="text-xs font-semibold">Mar 22, 2026</span></div>
          <div class="flex flex-row justify-between"><span class="text-xs text-muted">Card</span><span class="text-xs font-semibold">•••• ${card.slice(-4)}</span></div>
        </div>
        <button class="cta-btn mt-3" id="start-plus-btn"><span>Start Exploring Plus</span></button>
      </div>
    `;
    subscribed = true;
    document.getElementById('start-plus-btn').addEventListener('click', () => {
      closePaymentModal();
      navigateTo('plus');
    });
  }, 2000);
}

function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) modal.remove();
}

// ══════════════════════════════════════════════════════════
// PROFILE SCREEN
// ══════════════════════════════════════════════════════════
function renderProfile() {
  const totalKm = recentRuns.reduce((s, r) => s + r.distance, 0).toFixed(1);
  const totalXP = recentRuns.reduce((s, r) => s + r.xp, 0);
  return `
    <div class="card" style="border-radius:20px;padding:20px">
      <div class="flex flex-row items-center gap-3 mb-3">
        <div class="avatar avatar-lg">${player.name.charAt(0)}</div>
        <div class="flex-1">
          <div class="text-xl font-bold">${player.name}</div>
          <div class="flex flex-row gap-2 mt-1"><span class="badge-chip badge-orange">Level ${player.level}</span><span class="badge-chip badge-orange">${player.title}</span></div>
        </div>
        <button class="notif-btn">✏️</button>
      </div>
      <div class="flex flex-row justify-between mb-1">
        <span class="text-xs text-muted">Progress to Level ${player.level+1}</span>
        <span class="text-xs text-orange">${fmt(player.xp)} / ${fmt(player.xpToNext)} XP</span>
      </div>
      ${progressBar(player.xp, player.xpToNext)}
      <div class="flex flex-row gap-3 mt-2">
        <div class="flex flex-row items-center gap-1"><span class="text-orange">🔥</span><span class="text-sm font-semibold">${player.streak} day streak</span></div>
        <div class="flex flex-row items-center gap-1"><span class="text-orange">🌍</span><span class="text-sm font-semibold">Global #${player.globalRank}</span></div>
      </div>
    </div>

    <div class="flex flex-row gap-2 mb-3">
      ${[{icon:'🏃',value:totalKm,label:'km this week'},{icon:'⚡',value:totalXP,label:'XP earned'},{icon:'🏴',value:player.territories,label:'Zones owned'}].map(s => `
        <div class="mini-stat"><div class="emoji mb-1">${s.icon}</div><div class="font-bold text-lg">${s.value}</div><div class="text-xs text-dim">${s.label}</div></div>
      `).join('')}
    </div>

    <div class="card">
      <div class="flex flex-row justify-between items-center mb-3">
        <span class="font-bold">My Clan</span>
        <button style="background:none;border:none;color:var(--orange);font-size:0.8rem;font-weight:600;cursor:pointer" onclick="window._nav('rank')">View →</button>
      </div>
      <div class="flex flex-row items-center gap-3">
        <div style="width:46px;height:46px;border-radius:var(--radius-sm);background:var(--orange-bg);border:1px solid rgba(249,115,22,0.25);display:flex;align-items:center;justify-content:center;font-size:1.5rem">🏃</div>
        <div class="flex-1"><div class="font-semibold">${clanData.name}</div><div class="text-xs text-muted">${clanData.members} members · Rank #${clanData.rank}</div></div>
        <div class="text-right"><div class="text-orange font-bold text-sm">${fmt(clanData.weeklyScore)}</div><div class="text-xs text-dim">Weekly XP</div></div>
      </div>
    </div>

    <div class="font-bold text-base mb-3">Achievements</div>
    ${achievements.map(a => `
      <div class="card achievement-item">
        <div class="achievement-icon ${a.earned?'achievement-icon-earned':'achievement-icon-locked'}">${a.icon}</div>
        <div class="flex-1">
          <div class="flex flex-row items-center gap-2">
            <span class="font-semibold text-sm ${a.earned?'achievement-title-earned':'achievement-title-locked'}">${a.title}</span>
            ${a.earned ? '<span class="text-xs">✅</span>' : ''}
          </div>
          <div class="text-xs text-dim mt-1">${a.desc}</div>
          ${!a.earned && a.progress !== undefined ? `<div class="mt-2">${progressBar(Math.min(a.progress,a.max), a.max)}<div class="text-xs text-dim mt-1">${a.progress}/${a.max}</div></div>` : ''}
        </div>
      </div>
    `).join('')}

    <div class="font-bold text-base mt-4 mb-3">Run History</div>
    ${recentRuns.map(r => `
      <div class="card">
        <div class="flex flex-row justify-between items-center mb-2">
          <div><div class="font-bold">${r.distance} km</div><div class="text-xs text-dim">${r.date} · ${r.duration}</div></div>
          <span class="text-orange font-bold">+${r.xp} XP</span>
        </div>
        <div class="flex flex-row gap-3"><span class="text-xs text-muted">🏴 ${r.zones} zone${r.zones>1?'s':''} captured</span><span class="text-xs text-muted">⏱️ ${r.duration}</span></div>
      </div>
    `).join('')}

    <div class="font-bold text-base mt-4 mb-3">Account</div>
    ${['Notification Settings','Privacy Controls','Connected Devices','Help & Support'].map(item => `<div class="settings-link"><span>${item}</span><span class="chevron">›</span></div>`).join('')}
    <div class="settings-link settings-link-danger"><span>Log Out</span><span class="chevron">›</span></div>
  `;
}

// ── Global Nav Helper ──
window._nav = (screen) => navigateTo(screen);
