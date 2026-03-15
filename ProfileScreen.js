import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { player, territories, recentRuns, clanData } from '../data/gameData';
import { XPBar, BadgeChip } from '../components/UIComponents';

const achievements = [
  { id: 1, icon: '🏃', title: 'First Conquest', desc: 'Captured your first zone', earned: true },
  { id: 2, icon: '🔥', title: '7-Day Blaze', desc: 'Ran 7 days in a row', earned: true },
  { id: 3, icon: '🗺️', title: 'Territory Lord', desc: 'Own 5 zones simultaneously', earned: false, progress: 3, max: 5 },
  { id: 4, icon: '⚔️', title: 'Clan Warrior', desc: 'Win 3 city wars', earned: false, progress: 1, max: 3 },
  { id: 5, icon: '👑', title: 'City Dominator', desc: 'Reach Top 10 in city', earned: false, progress: 145, max: 10 },
];

export default function ProfileScreen({ navigation }) {
  const totalKm = recentRuns.reduce((sum, r) => sum + r.distance, 0).toFixed(1);
  const totalXP = recentRuns.reduce((sum, r) => sum + r.xp, 0);

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <StatusBar barStyle="light-content" backgroundColor="#18181b" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-24">

          {/* ── Profile Hero ── */}
          <View className="bg-zinc-800 rounded-3xl p-5 mb-4">
            <View className="flex-row items-center gap-4 mb-4">
              <View className="w-16 h-16 rounded-full bg-orange-500 items-center justify-center border-2 border-orange-400">
                <Text className="text-white text-2xl font-bold">
                  {player.name.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold">{player.name}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <BadgeChip text={`Level ${player.level}`} color="orange" />
                  <BadgeChip text={player.title} color="orange" />
                </View>
              </View>
              <TouchableOpacity className="w-9 h-9 rounded-xl bg-zinc-700 items-center justify-center">
                <Text>✏️</Text>
              </TouchableOpacity>
            </View>

            <XPBar current={player.xp} max={player.xpToNext} label={`Progress to Level ${player.level + 1}`} />

            <View className="flex-row mt-2">
              <View className="flex-row items-center gap-1.5 mr-4">
                <Text className="text-orange-400">🔥</Text>
                <Text className="text-white text-sm font-semibold">{player.streak} day streak</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-orange-400">🌍</Text>
                <Text className="text-white text-sm font-semibold">Global #{player.globalRank}</Text>
              </View>
            </View>
          </View>

          {/* ── All-Time Stats ── */}
          <View className="flex-row gap-2 mb-4">
            {[
              { icon: '🏃', value: `${totalKm}`, label: 'km this week' },
              { icon: '⚡', value: `${totalXP}`, label: 'XP earned' },
              { icon: '🏴', value: `${player.territories}`, label: 'Zones owned' },
            ].map((s, i) => (
              <View key={i} className="flex-1 bg-zinc-800 rounded-2xl p-3 items-center">
                <Text className="text-xl mb-1">{s.icon}</Text>
                <Text className="text-white font-bold text-lg">{s.value}</Text>
                <Text className="text-zinc-500 text-xs text-center">{s.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Clan Card ── */}
          <View className="bg-zinc-800 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white font-bold">My Clan</Text>
              <TouchableOpacity>
                <Text className="text-orange-400 text-sm">View →</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 items-center justify-center">
                <Text className="text-2xl">🏃</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">{clanData.name}</Text>
                <Text className="text-zinc-400 text-xs">{clanData.members} members · Rank #{clanData.rank}</Text>
              </View>
              <View className="items-end">
                <Text className="text-orange-400 font-bold text-sm">{clanData.weeklyScore.toLocaleString()}</Text>
                <Text className="text-zinc-500 text-xs">Weekly XP</Text>
              </View>
            </View>
          </View>

          {/* ── Achievements ── */}
          <Text className="text-white font-bold text-base mb-3">Achievements</Text>

          {achievements.map((a) => (
            <View
              key={a.id}
              className={`rounded-2xl px-4 py-3.5 mb-2 flex-row items-center gap-3 ${
                a.earned ? 'bg-zinc-800' : 'bg-zinc-800/60'
              }`}
            >
              <View className={`w-11 h-11 rounded-xl items-center justify-center ${
                a.earned ? 'bg-orange-500/20' : 'bg-zinc-700'
              }`}>
                <Text className={`text-xl ${!a.earned ? 'opacity-40' : ''}`}>{a.icon}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className={`font-semibold text-sm ${a.earned ? 'text-white' : 'text-zinc-500'}`}>
                    {a.title}
                  </Text>
                  {a.earned && <Text className="text-xs">✅</Text>}
                </View>
                <Text className="text-zinc-500 text-xs mt-0.5">{a.desc}</Text>
                {!a.earned && a.progress !== undefined && (
                  <View className="mt-1.5">
                    <View className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-orange-500/60 rounded-full"
                        style={{ width: `${Math.min((a.progress / a.max) * 100, 100)}%` }}
                      />
                    </View>
                    <Text className="text-zinc-600 text-xs mt-0.5">{a.progress}/{a.max}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* ── Run History ── */}
          <Text className="text-white font-bold text-base mt-4 mb-3">Run History</Text>

          {recentRuns.map((run) => (
            <View key={run.id} className="bg-zinc-800 rounded-2xl px-4 py-3.5 mb-2">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-white font-bold">{run.distance} km</Text>
                  <Text className="text-zinc-500 text-xs">{run.date} · {run.duration}</Text>
                </View>
                <Text className="text-orange-400 font-bold">+{run.xp} XP</Text>
              </View>
              <View className="flex-row gap-3">
                <Text className="text-zinc-400 text-xs">🏴 {run.zones} zone{run.zones > 1 ? 's' : ''} captured</Text>
                <Text className="text-zinc-400 text-xs">⏱️ {run.duration}</Text>
              </View>
            </View>
          ))}

          {/* ── Settings Links ── */}
          <Text className="text-white font-bold text-base mt-4 mb-3">Account</Text>

          {['Notification Settings', 'Privacy Controls', 'Connected Devices', 'Help & Support', 'Log Out'].map((item, i) => (
            <TouchableOpacity
              key={i}
              className={`bg-zinc-800 rounded-2xl px-4 py-4 mb-2 flex-row justify-between items-center ${
                item === 'Log Out' ? 'border border-red-500/20' : ''
              }`}
            >
              <Text className={`text-sm ${item === 'Log Out' ? 'text-red-400' : 'text-white'}`}>
                {item}
              </Text>
              <Text className="text-zinc-600">›</Text>
            </TouchableOpacity>
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
