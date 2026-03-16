export const player = {
  name: 'RunRealm',
  level: 12,
  title: 'Conqueror',
  streak: 12,
  xp: 2450,
  xpToNext: 3000,
  globalRank: 145,
  totalUsers: 3000,
  influence: 0,
  territories: 3,
  avatar: null,
};

export const todayStats = {
  distance: 0,
  goal: 8,
  pace: '--:--',
  calories: 0,
  duration: '00:00:00',
  xp: 0,
  influence: 0,
};

export const territories = [
  {
    id: 1,
    name: 'Sector 7 - Urban District',
    shortName: 'Urban District',
    strength: 87,
    capturedDaysAgo: 3,
    decayRate: 5,
    color: '#FF6B35',
  },
  {
    id: 2,
    name: 'Sector 4 - Green Zone',
    shortName: 'Green Zone',
    strength: 62,
    capturedDaysAgo: 7,
    decayRate: 8,
    color: '#4CAF50',
  },
  {
    id: 3,
    name: 'Sector 1 - Industrial Park',
    shortName: 'Industrial Park',
    strength: 44,
    capturedDaysAgo: 12,
    decayRate: 10,
    color: '#2196F3',
  },
];

export const leaderboard = [
  { rank: 1, name: 'RunnerQueen', level: 14, score: 4210, city: 'Local Area', badge: '👑' },
  { rank: 2, name: 'JetSprinter', level: 13, score: 3980, city: 'Local Area', badge: '🔥' },
  { rank: 3, name: 'Ravi24', level: 11, score: 3640, city: 'Local Area', badge: '⚡' },
  { rank: 4, name: 'SpeedDemon', level: 10, score: 3420, city: 'Local Area', badge: '🏃' },
  { rank: 5, name: 'CityRaider', level: 10, score: 3190, city: 'Local Area', badge: '🗺️' },
  { rank: 6, name: 'NightRunner', level: 9, score: 2980, city: 'Local Area', badge: '🌙' },
  { rank: 7, name: 'ZoneMaster', level: 9, score: 2810, city: 'Local Area', badge: '🎯' },
  { rank: 8, name: 'TrailBlazer', level: 8, score: 2760, city: 'Local Area', badge: '🌟' },
  { rank: 145, name: 'RunRealm (You)', level: 12, score: 2450, city: 'Your Location', badge: '🏰', isUser: true },
];

export const clanData = {
  name: 'TCS Runners',
  members: 24,
  rank: 3,
  weeklyScore: 18420,
  territory: 'Local Zone',
};

export const recentRuns = [];

export const battlePassFeatures = [
  { id: 1, icon: '🗺️', title: 'Advanced Map Layers', desc: 'Heatmaps, terrain analysis & route planning' },
  { id: 2, icon: '🏰', title: 'Private Clan Realms', desc: 'Create private leaderboards for friends' },
  { id: 3, icon: '⏪', title: 'Historical Replay', desc: 'Animated replays of past runs' },
  { id: 4, icon: '🚀', title: 'Clan Progression Boosts', desc: 'Accelerate your clan rank growth' },
  { id: 5, icon: '🎨', title: 'Exclusive Territory Skins', desc: 'Seasonal themes & rare designs' },
];
