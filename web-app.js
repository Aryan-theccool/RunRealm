import {
  player, todayStats, territories, leaderboard, clanData, clanLeaderboard,
  recentRuns, battlePassFeatures, achievements, mapThemes, comparisonTable
} from './data.js';

// ── State ──────────────────────────────────────────────────
let currentScreen = 'home';
let runState = { running: false, elapsed: 0, distance: 0, captureProgress: 12, timerId: null };
let rankTab = 'Global';
let subscribed = false;
let selectedTheme = 1;

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
        <div class="kingdom-label">YOUR KINGDOM</div>
        <button class="kingdom-cta" onclick="window._nav('map')">View Map →</button>
      </div>
      <div class="kingdom-info">
        <div class="font-semibold text-sm">Sector 7 - Downtown District</div>
        <div class="text-muted text-xs mt-1">${player.territories} zones captured</div>
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
function generateGrid() {
  const grid = [];
  for (let r = 0; r < 7; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      const isOwned = (r===3&&c===3)||(r===3&&c===4)||(r===4&&c===3);
      const isNearby = Math.random() > 0.6;
      row.push({ id: `${r}-${c}`, row: r, col: c, owned: isOwned, partial: !isOwned && isNearby && Math.random() > 0.5, enemy: !isOwned && Math.random() > 0.8 });
    }
    grid.push(row);
  }
  return grid;
}

function renderMap() {
  const grid = generateGrid();
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

    <div class="card" style="padding:0;overflow:hidden">
      <div class="map-legend">
        <div class="legend-item"><div class="legend-dot" style="background:var(--orange)"></div>Your Zone</div>
        <div class="legend-item"><div class="legend-dot" style="background:rgba(59,130,246,0.6)"></div>Nearby</div>
        <div class="legend-item"><div class="legend-dot" style="background:rgba(239,68,68,0.6)"></div>Enemy</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--card)"></div>Neutral</div>
      </div>
      <div class="map-grid">
        ${grid.map(row => `<div class="map-row">${row.map(cell => {
          let cls = 'map-cell map-cell-neutral';
          let content = '';
          if (cell.owned) cls = 'map-cell map-cell-owned';
          else if (cell.enemy) { cls = 'map-cell map-cell-enemy'; content = '⚔️'; }
          else if (cell.partial) cls = 'map-cell map-cell-partial';
          if (cell.row===3 && cell.col===3) { cls += ' map-cell-center' + (isR ? ' pulsing' : ''); content = isR ? '📍' : '🏰'; }
          return `<div class="${cls}">${content}</div>`;
        }).join('')}</div>`).join('')}
      </div>
    </div>

    ${isR ? `
      <div class="card live-stats">
        <div class="flex flex-row mb-3">
          <div class="live-stat-item"><div class="live-stat-value" id="run-dist">${runState.distance.toFixed(1)} km</div><div class="live-stat-label">Distance</div></div>
          <div class="live-stat-item"><div class="live-stat-value">5:12</div><div class="live-stat-label">Pace /km</div></div>
          <div class="live-stat-item"><div class="live-stat-value text-orange">CP North</div><div class="live-stat-label">Sector</div></div>
        </div>
        <div class="capture-box">
          <div class="flex flex-row justify-between mb-1">
            <span class="font-semibold text-sm">🏴 Sector Capture</span>
            <span class="text-orange font-bold" id="capture-pct">${runState.captureProgress.toFixed(0)}%</span>
          </div>
          <div class="text-xs text-muted mb-2">Central Park North · Zone 4</div>
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
          <button class="run-btn run-btn-pause">⏸ Pause</button>
          <button class="run-btn run-btn-end" id="btn-end-run">⏹ End Run</button>
        </div>
      ` : `
        <button class="cta-btn" id="btn-start-run"><span>▶  START CAPTURING</span><span class="cta-sub">GPS tracking will begin</span></button>
      `}
    </div>
  `;
}

function initMapInteractions() {
  const s = document.getElementById('btn-start-run');
  const e = document.getElementById('btn-end-run');
  if (s) s.addEventListener('click', startRun);
  if (e) e.addEventListener('click', () => { stopRun(); navigateTo('map'); });
}

function startRun() {
  runState.running = true; runState.elapsed = 0; runState.distance = 0; runState.captureProgress = 12;
  navigateTo('map');
  runState.timerId = setInterval(() => {
    runState.elapsed++; runState.distance = +(runState.distance + 0.003).toFixed(3); runState.captureProgress = Math.min(runState.captureProgress + 0.4, 100);
    const t = document.getElementById('run-timer'), d = document.getElementById('run-dist'), p = document.getElementById('capture-pct'), b = document.getElementById('capture-bar'), r = document.getElementById('capture-remaining');
    if (t) t.textContent = fmtTime(runState.elapsed);
    if (d) d.textContent = `${runState.distance.toFixed(1)} km`;
    if (p) p.textContent = `${runState.captureProgress.toFixed(0)}%`;
    if (b) b.style.width = `${runState.captureProgress}%`;
    if (r) r.textContent = `${(100-runState.captureProgress).toFixed(0)}% remaining to capture`;
  }, 1000);
}

function stopRun() { runState.running = false; clearInterval(runState.timerId); runState.timerId = null; }

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
    if (btn) btn.addEventListener('click', () => { subscribed = true; navigateTo('plus'); });
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
