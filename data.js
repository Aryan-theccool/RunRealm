// ── RunRealm Game Data ─────────────────────────────────────

export const player = {
  name: 'RunRealm',
  level: 12,
  title: 'Conqueror',
  streak: 12,
  xp: 2450,
  xpToNext: 3000,
  globalRank: 145,
  totalUsers: 3000,
  influence: 840,
  territories: 3,
};

export const todayStats = {
  distance: 5.2,
  goal: 8,
  pace: '5:12',
  calories: 312,
  duration: '00:24:18',
  influence: 840,
};

export const territories = [
  {
    id: 1,
    name: 'Sector 7 - Downtown District',
    shortName: 'Downtown',
    strength: 87,
    capturedDaysAgo: 3,
    decayRate: 5,
    color: '#FF6B35',
  },
  {
    id: 2,
    name: 'Central Park Sector',
    shortName: 'Central Park',
    strength: 62,
    capturedDaysAgo: 7,
    decayRate: 8,
    color: '#4CAF50',
  },
  {
    id: 3,
    name: 'Harbor Zone - East',
    shortName: 'Harbor',
    strength: 44,
    capturedDaysAgo: 12,
    decayRate: 10,
    color: '#2196F3',
  },
];

export const leaderboard = [
  { rank: 1, name: 'RunnerQueen', level: 14, score: 4210, city: 'Mumbai', badge: '👑' },
  { rank: 2, name: 'JetSprinter', level: 13, score: 3980, city: 'Delhi', badge: '🔥' },
  { rank: 3, name: 'Ravi24', level: 11, score: 3640, city: 'Bangalore', badge: '⚡' },
  { rank: 4, name: 'SpeedDemon', level: 10, score: 3420, city: 'Pune', badge: '🏃' },
  { rank: 5, name: 'CityRaider', level: 10, score: 3190, city: 'Chennai', badge: '🗺️' },
  { rank: 6, name: 'NightRunner', level: 9, score: 2980, city: 'Hyderabad', badge: '🌙' },
  { rank: 7, name: 'ZoneMaster', level: 9, score: 2810, city: 'Kolkata', badge: '🎯' },
  { rank: 8, name: 'TrailBlazer', level: 8, score: 2760, city: 'Indore', badge: '🌟' },
  { rank: 145, name: 'RunRealm (You)', level: 12, score: 2450, city: 'Indore', badge: '🏰', isUser: true },
];

export const clanData = {
  name: 'TCS Runners',
  members: 24,
  rank: 3,
  weeklyScore: 18420,
  territory: 'Mumbai Zone',
};

export const clanLeaderboard = [
  { rank: 1, name: 'Mumbai Dominators', members: 32, score: 42100, badge: '🦁' },
  { rank: 2, name: 'Delhi Conquerors', members: 28, score: 38900, badge: '⚔️' },
  { rank: 3, name: 'TCS Runners', members: 24, score: 18420, badge: '🏃', isUser: true },
  { rank: 4, name: 'Bangalore Blazers', members: 19, score: 16200, badge: '🔥' },
  { rank: 5, name: 'Pune Pacers', members: 15, score: 13800, badge: '⚡' },
];

export const recentRuns = [
  { id: 1, date: 'Today', distance: 5.2, zones: 1, xp: 120, duration: '28:14' },
  { id: 2, date: 'Yesterday', distance: 7.8, zones: 2, xp: 200, duration: '42:33' },
  { id: 3, date: 'Mar 13', distance: 4.1, zones: 1, xp: 90, duration: '22:10' },
  { id: 4, date: 'Mar 11', distance: 9.3, zones: 3, xp: 280, duration: '51:45' },
];

export const battlePassFeatures = [
  { id: 1, icon: '🗺️', title: 'Advanced Map Layers', desc: 'Heatmaps, terrain analysis & route planning' },
  { id: 2, icon: '🏰', title: 'Private Clan Realms', desc: 'Create private leaderboards for friends' },
  { id: 3, icon: '⏪', title: 'Historical Replay', desc: 'Animated replays of past runs' },
  { id: 4, icon: '🚀', title: 'Clan Progression Boosts', desc: 'Accelerate your clan rank growth' },
  { id: 5, icon: '🎨', title: 'Exclusive Territory Skins', desc: 'Seasonal themes & rare designs' },
];

export const achievements = [
  { id: 1, icon: '🏃', title: 'First Conquest', desc: 'Captured your first zone', earned: true },
  { id: 2, icon: '🔥', title: '7-Day Blaze', desc: 'Ran 7 days in a row', earned: true },
  { id: 3, icon: '🗺️', title: 'Territory Lord', desc: 'Own 5 zones simultaneously', earned: false, progress: 3, max: 5 },
  { id: 4, icon: '⚔️', title: 'Clan Warrior', desc: 'Win 3 city wars', earned: false, progress: 1, max: 3 },
  { id: 5, icon: '👑', title: 'City Dominator', desc: 'Reach Top 10 in city', earned: false, progress: 145, max: 10 },
];

export const mapThemes = [
  { id: 1, name: 'Urban', emoji: '🌆', locked: false, active: true },
  { id: 2, name: 'Terrain', emoji: '🏔️', locked: true },
  { id: 3, name: 'Satellite', emoji: '🛸', locked: true },
  { id: 4, name: 'Neon', emoji: '🌃', locked: true },
];

export const comparisonTable = [
  { label: 'Core Gameplay', free: true, plus: true },
  { label: 'Global Leaderboard', free: true, plus: true },
  { label: 'Basic Clans', free: true, plus: true },
  { label: 'Advanced Maps', free: false, plus: true },
  { label: 'Historical Replay', free: false, plus: true },
  { label: 'Private Clans', free: false, plus: true },
  { label: 'All Themes', free: false, plus: true },
];
