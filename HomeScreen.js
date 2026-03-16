import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, SafeAreaView,
} from 'react-native';
import { player, todayStats, territories, recentRuns } from '../data/gameData';
import { StatCard, XPBar, SectionHeader, TerritoryBar, RunStatPill } from '../components/UIComponents';

export default function HomeScreen({ navigation }) {
  const [streakAnim] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <StatusBar barStyle="light-content" backgroundColor="#18181b" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-24">

          {/* ── Header ── */}
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-orange-500 items-center justify-center border-2 border-orange-400">
                <Text className="text-white text-lg font-bold">
                  {player.name.charAt(0)}
                </Text>
              </View>
              <View>
                <Text className="text-white text-base font-bold">{player.name}</Text>
                <Text className="text-orange-400 text-xs">
                  Level {player.level} {player.title}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="bg-orange-500/20 border border-orange-500/40 rounded-full px-3 py-1 flex-row items-center gap-1">
                <Text className="text-orange-400 text-xs">🔥</Text>
                <Text className="text-orange-400 text-xs font-bold">{player.streak} day streak</Text>
              </View>
              <TouchableOpacity className="w-9 h-9 rounded-full bg-zinc-800 items-center justify-center">
                <Text className="text-lg">🔔</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── XP Bar ── */}
          <View className="bg-zinc-800 rounded-2xl p-4 mb-4">
            <XPBar current={player.xp} max={player.xpToNext} label="Progress to Level 13" />
          </View>

          {/* ── Top Stats ── */}
          <View className="flex-row mb-4">
            <StatCard label="Territory Strength" value={player.xp.toLocaleString()} sub="↑+12% this week" accent />
            <StatCard label="Global Rank" value={`#${player.globalRank}`} sub={`Top ${Math.round((player.globalRank / player.totalUsers) * 100)}%`} />
          </View>

          {/* ── Kingdom Map Preview ── */}
          <View className="bg-zinc-800 rounded-2xl overflow-hidden mb-4">
            <View className="bg-zinc-700 h-40 items-center justify-center relative">
              {/* Fake map grid */}
              <View className="absolute inset-0 opacity-20">
                {[...Array(8)].map((_, i) => (
                  <View key={i} className="border-b border-zinc-500" style={{ height: '12.5%' }} />
                ))}
              </View>
              {/* Territory block */}
              <View className="w-20 h-20 bg-orange-500/30 border-2 border-orange-500 rounded-xl items-center justify-center rotate-45">
                <Text className="text-2xl -rotate-45">🏰</Text>
              </View>
              <View className="absolute top-3 left-3 bg-zinc-900/80 rounded-lg px-2 py-1">
                <Text className="text-orange-400 text-xs font-bold">YOUR TERRITORY</Text>
              </View>
              <TouchableOpacity
                className="absolute bottom-3 right-3 bg-orange-500 rounded-xl px-3 py-1.5"
                onPress={() => navigation.navigate('Map')}
              >
                <Text className="text-white text-xs font-bold">View Map →</Text>
              </TouchableOpacity>
            </View>
            <View className="px-4 py-3">
              <Text className="text-white font-semibold text-sm">Zone 1 - Local District</Text>
              <Text className="text-zinc-400 text-xs mt-0.5">{player.territories} sectors captured</Text>
            </View>
          </View>

          {/* ── Today's Progress ── */}
          <View className="bg-zinc-800 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white font-bold text-base">Today's Progress</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <Text className="text-orange-400 text-sm">History</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between mb-4">
              <RunStatPill icon="🏃" value={`${todayStats.distance} km`} label="Distance" />
              <RunStatPill icon="⚡" value={`${todayStats.influence} pts`} label="Influence" />
              <RunStatPill icon="⏱️" value={todayStats.pace} label="Pace /km" />
              <RunStatPill icon="🔥" value={`${todayStats.calories}`} label="Calories" />
            </View>

            {/* Distance goal bar */}
            <View className="mb-1">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-zinc-400">Daily Goal</Text>
                <Text className="text-xs text-orange-400">{todayStats.distance} / {todayStats.goal} km</Text>
              </View>
              <View className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(todayStats.distance / todayStats.goal) * 100}%` }}
                />
              </View>
            </View>
          </View>

          {/* ── Start Run CTA ── */}
          <TouchableOpacity
            className="bg-orange-500 rounded-2xl py-4 items-center mb-4 shadow-lg"
            onPress={() => navigation.navigate('Map')}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">▶</Text>
              <Text className="text-white text-lg font-bold tracking-wide">START RUN</Text>
            </View>
            <Text className="text-orange-100 text-xs mt-1">Capture territory · Earn XP · Dominate your city</Text>
          </TouchableOpacity>

          {/* ── My Territories ── */}
          <SectionHeader title="My Territories" action="See all" onAction={() => navigation.navigate('Map')} />
          {territories.map((t) => (
            <View key={t.id} className="bg-zinc-800 rounded-2xl p-4 mb-2 flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: t.color + '33' }}
              >
                <Text className="text-xl">🏴</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-sm">{t.shortName}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <TerritoryBar strength={t.strength} color={t.color} />
                  <Text className="text-xs text-zinc-400 w-8">{t.strength}%</Text>
                </View>
              </View>
              <View>
                <Text className="text-zinc-500 text-xs text-right">{t.capturedDaysAgo}d ago</Text>
                <Text className={`text-xs text-right mt-0.5 ${t.strength < 50 ? 'text-red-400' : 'text-green-400'}`}>
                  {t.strength < 50 ? '⚠ Decaying' : '✓ Strong'}
                </Text>
              </View>
            </View>
          ))}

          {/* ── Recent Runs ── */}
          <SectionHeader title="Recent Runs" />
          {recentRuns.map((run) => (
            <View key={run.id} className="bg-zinc-800 rounded-2xl px-4 py-3 mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full bg-orange-500/20 items-center justify-center">
                  <Text className="text-base">🏃</Text>
                </View>
                <View>
                  <Text className="text-white text-sm font-semibold">{run.distance} km</Text>
                  <Text className="text-zinc-500 text-xs">{run.date} · {run.duration}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-orange-400 text-sm font-bold">+{run.xp} XP</Text>
                <Text className="text-zinc-500 text-xs">{run.zones} zone{run.zones > 1 ? 's' : ''}</Text>
              </View>
            </View>
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
