import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// ── Stat Card ──────────────────────────────────────────────
export const StatCard = ({ label, value, sub, accent = false }) => (
  <View className={`flex-1 rounded-2xl p-4 mx-1 ${accent ? 'bg-orange-500' : 'bg-zinc-800'}`}>
    <Text className="text-xs text-zinc-400 uppercase tracking-widest mb-1">{label}</Text>
    <Text className={`text-2xl font-bold ${accent ? 'text-white' : 'text-white'}`}>{value}</Text>
    {sub && <Text className={`text-xs mt-0.5 ${accent ? 'text-orange-100' : 'text-orange-400'}`}>{sub}</Text>}
  </View>
);

// ── XP Progress Bar ────────────────────────────────────────
export const XPBar = ({ current, max, label }) => {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <View className="mb-2">
      {label && (
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-zinc-400">{label}</Text>
          <Text className="text-xs text-orange-400">{current} / {max} XP</Text>
        </View>
      )}
      <View className="h-2 bg-zinc-700 rounded-full overflow-hidden">
        <View
          className="h-full bg-orange-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
};

// ── Badge Chip ─────────────────────────────────────────────
export const BadgeChip = ({ text, color = 'orange' }) => {
  const colorMap = {
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <View className={`px-3 py-1 rounded-full border ${colorMap[color]}`}>
      <Text className={`text-xs font-semibold ${colorMap[color].split(' ')[1]}`}>{text}</Text>
    </View>
  );
};

// ── Section Header ─────────────────────────────────────────
export const SectionHeader = ({ title, action, onAction }) => (
  <View className="flex-row justify-between items-center mb-3 mt-5">
    <Text className="text-white text-base font-bold">{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text className="text-orange-400 text-sm">{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Territory Strength Bar ─────────────────────────────────
export const TerritoryBar = ({ strength, color }) => {
  const getColor = () => {
    if (strength > 70) return 'bg-green-500';
    if (strength > 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  return (
    <View className="h-1.5 bg-zinc-700 rounded-full overflow-hidden flex-1">
      <View className={`h-full ${getColor()} rounded-full`} style={{ width: `${strength}%` }} />
    </View>
  );
};

// ── Run Stat Row ───────────────────────────────────────────
export const RunStatPill = ({ icon, value, label }) => (
  <View className="items-center">
    <Text className="text-lg">{icon}</Text>
    <Text className="text-white font-bold text-sm">{value}</Text>
    <Text className="text-zinc-500 text-xs">{label}</Text>
  </View>
);
