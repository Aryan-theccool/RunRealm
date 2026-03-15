import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { leaderboard, clanData } from '../data/gameData';

const tabs = ['Global', 'City', 'Clans'];

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
const medalEmoji = ['🥇', '🥈', '🥉'];

export default function RankScreen() {
  const [activeTab, setActiveTab] = useState('Global');

  const userEntry = leaderboard.find(e => e.isUser);
  const topEntries = leaderboard.filter(e => !e.isUser).slice(0, 8);

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <StatusBar barStyle="light-content" backgroundColor="#18181b" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-24">

          {/* ── Header ── */}
          <Text className="text-white text-2xl font-bold mb-1">Leaderboard</Text>
          <Text className="text-zinc-500 text-sm mb-5">Updated every 6 hours</Text>

          {/* ── Tabs ── */}
          <View className="flex-row bg-zinc-800 rounded-2xl p-1 mb-5">
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab}
                className={`flex-1 py-2 rounded-xl items-center ${activeTab === tab ? 'bg-orange-500' : ''}`}
                onPress={() => setActiveTab(tab)}
              >
                <Text className={`text-sm font-semibold ${activeTab === tab ? 'text-white' : 'text-zinc-400'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Podium Top 3 ── */}
          {activeTab !== 'Clans' && (
            <View className="mb-5">
              <View className="flex-row justify-center items-end gap-3 mb-2">
                {/* 2nd */}
                <View className="items-center flex-1">
                  <View className="w-14 h-14 rounded-full bg-zinc-700 border-2 border-zinc-500 items-center justify-center mb-1">
                    <Text className="text-2xl">{topEntries[1]?.badge}</Text>
                  </View>
                  <Text className="text-white text-xs font-bold">{topEntries[1]?.name}</Text>
                  <Text className="text-zinc-400 text-xs">Lv.{topEntries[1]?.level}</Text>
                  <View className="bg-zinc-700 w-full h-16 rounded-t-xl mt-2 items-center justify-center border-t-2 border-zinc-500">
                    <Text className="text-2xl">🥈</Text>
                    <Text className="text-zinc-400 text-xs font-bold">#2</Text>
                  </View>
                </View>

                {/* 1st */}
                <View className="items-center flex-1">
                  <View className="w-16 h-16 rounded-full bg-orange-500/30 border-2 border-orange-400 items-center justify-center mb-1">
                    <Text className="text-2xl">{topEntries[0]?.badge}</Text>
                  </View>
                  <Text className="text-orange-400 text-xs font-bold">{topEntries[0]?.name}</Text>
                  <Text className="text-zinc-400 text-xs">Lv.{topEntries[0]?.level}</Text>
                  <View className="bg-orange-500/20 border border-orange-500/30 w-full h-24 rounded-t-xl mt-2 items-center justify-center">
                    <Text className="text-2xl">🥇</Text>
                    <Text className="text-orange-400 text-xs font-bold">#1</Text>
                  </View>
                </View>

                {/* 3rd */}
                <View className="items-center flex-1">
                  <View className="w-14 h-14 rounded-full bg-zinc-700 border-2 border-zinc-600 items-center justify-center mb-1">
                    <Text className="text-2xl">{topEntries[2]?.badge}</Text>
                  </View>
                  <Text className="text-white text-xs font-bold">{topEntries[2]?.name}</Text>
                  <Text className="text-zinc-400 text-xs">Lv.{topEntries[2]?.level}</Text>
                  <View className="bg-zinc-700 w-full h-12 rounded-t-xl mt-2 items-center justify-center border-t-2 border-zinc-600">
                    <Text className="text-2xl">🥉</Text>
                    <Text className="text-zinc-400 text-xs font-bold">#3</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ── Clan Card ── */}
          {activeTab === 'Clans' && (
            <View className="bg-gradient-to-r from-orange-900/40 to-zinc-800 border border-orange-500/30 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-orange-400 text-xs uppercase tracking-widest">Your Clan</Text>
                  <Text className="text-white text-xl font-bold">{clanData.name}</Text>
                </View>
                <View className="bg-orange-500/20 border border-orange-500/40 rounded-xl px-3 py-1.5">
                  <Text className="text-orange-400 text-sm font-bold">Rank #{clanData.rank}</Text>
                </View>
              </View>
              <View className="flex-row gap-4">
                <View>
                  <Text className="text-white font-bold">{clanData.members}</Text>
                  <Text className="text-zinc-400 text-xs">Members</Text>
                </View>
                <View>
                  <Text className="text-white font-bold">{clanData.weeklyScore.toLocaleString()}</Text>
                  <Text className="text-zinc-400 text-xs">Weekly XP</Text>
                </View>
                <View>
                  <Text className="text-white font-bold">{clanData.territory}</Text>
                  <Text className="text-zinc-400 text-xs">Territory</Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Rank List ── */}
          {activeTab !== 'Clans' && (
            <>
              {topEntries.slice(3).map((entry, i) => (
                <View key={entry.rank} className="bg-zinc-800 rounded-2xl px-4 py-3 mb-2 flex-row items-center gap-3">
                  <Text className="text-zinc-400 font-bold text-sm w-6">#{entry.rank}</Text>
                  <View className="w-9 h-9 rounded-full bg-zinc-700 items-center justify-center">
                    <Text className="text-base">{entry.badge}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-sm">{entry.name}</Text>
                    <Text className="text-zinc-500 text-xs">{entry.city} · Lv.{entry.level}</Text>
                  </View>
                  <Text className="text-white font-bold text-sm">{entry.score.toLocaleString()}</Text>
                </View>
              ))}

              {/* Your rank separator */}
              {userEntry && (
                <>
                  <View className="flex-row items-center my-2 gap-3">
                    <View className="flex-1 h-px bg-zinc-700" />
                    <Text className="text-zinc-500 text-xs">Your position</Text>
                    <View className="flex-1 h-px bg-zinc-700" />
                  </View>
                  <View className="bg-orange-500/15 border border-orange-500/40 rounded-2xl px-4 py-3 flex-row items-center gap-3">
                    <Text className="text-orange-400 font-bold text-sm w-10">#{userEntry.rank}</Text>
                    <View className="w-9 h-9 rounded-full bg-orange-500/30 border border-orange-400 items-center justify-center">
                      <Text className="text-base">{userEntry.badge}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-orange-300 font-semibold text-sm">{userEntry.name}</Text>
                      <Text className="text-orange-400/60 text-xs">{userEntry.city} · Lv.{userEntry.level}</Text>
                    </View>
                    <Text className="text-orange-400 font-bold text-sm">{userEntry.score.toLocaleString()}</Text>
                  </View>
                  <Text className="text-center text-zinc-500 text-xs mt-2">
                    Run 23.4 km more to reach Rank #144 🔥
                  </Text>
                </>
              )}
            </>
          )}

          {/* ── Clan List ── */}
          {activeTab === 'Clans' && (
            [
              { rank: 1, name: 'Mumbai Dominators', members: 32, score: 42100, badge: '🦁' },
              { rank: 2, name: 'Delhi Conquerors', members: 28, score: 38900, badge: '⚔️' },
              { rank: 3, name: 'TCS Runners', members: 24, score: 18420, badge: '🏃', isUser: true },
              { rank: 4, name: 'Bangalore Blazers', members: 19, score: 16200, badge: '🔥' },
              { rank: 5, name: 'Pune Pacers', members: 15, score: 13800, badge: '⚡' },
            ].map((clan) => (
              <View
                key={clan.rank}
                className={`rounded-2xl px-4 py-3 mb-2 flex-row items-center gap-3 ${
                  clan.isUser
                    ? 'bg-orange-500/15 border border-orange-500/40'
                    : 'bg-zinc-800'
                }`}
              >
                <Text className={`font-bold text-sm w-6 ${clan.isUser ? 'text-orange-400' : 'text-zinc-400'}`}>
                  #{clan.rank}
                </Text>
                <View className="w-9 h-9 rounded-full bg-zinc-700 items-center justify-center">
                  <Text className="text-base">{clan.badge}</Text>
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold text-sm ${clan.isUser ? 'text-orange-300' : 'text-white'}`}>
                    {clan.name}
                  </Text>
                  <Text className="text-zinc-500 text-xs">{clan.members} members</Text>
                </View>
                <Text className={`font-bold text-sm ${clan.isUser ? 'text-orange-400' : 'text-white'}`}>
                  {clan.score.toLocaleString()} XP
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
