import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { battlePassFeatures } from '../data/gameData';

const mapThemes = [
  { id: 1, name: 'Urban', emoji: '🌆', locked: false, active: true },
  { id: 2, name: 'Terrain', emoji: '🏔️', locked: true },
  { id: 3, name: 'Satellite', emoji: '🛸', locked: true },
  { id: 4, name: 'Neon', emoji: '🌃', locked: true },
];

const freeFeatures = [
  '✓ Core Gameplay',
  '✓ GPS Territory Tracking',
  '✓ Global Leaderboard',
  '✓ Basic Clan System',
  '✗ Advanced Maps',
  '✗ Historical Replay',
  '✗ Private Clan Realms',
];

export default function BattlePassScreen() {
  const [subscribed, setSubscribed] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(1);

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <StatusBar barStyle="light-content" backgroundColor="#18181b" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-24">

          {/* ── Hero Banner ── */}
          <View className="bg-orange-500 rounded-3xl p-5 mb-5 overflow-hidden">
            {/* Background decoration */}
            <View className="absolute right-4 top-4 opacity-20">
              <Text className="text-8xl">🏰</Text>
            </View>

            <View className="bg-white/20 self-start rounded-full px-3 py-1 mb-3">
              <Text className="text-white text-xs font-bold uppercase tracking-widest">
                RunRealm Plus
              </Text>
            </View>

            <Text className="text-white text-2xl font-bold mb-1">
              Unlock Your{'\n'}Full Potential
            </Text>
            <Text className="text-orange-100 text-sm mb-4">
              Advanced tools for serious runners.{'\n'}Same fair gameplay for everyone.
            </Text>

            {subscribed ? (
              <View className="bg-white/20 rounded-2xl py-3 items-center">
                <Text className="text-white font-bold">✓ Active Subscription</Text>
                <Text className="text-orange-100 text-xs mt-0.5">Renews on Apr 15, 2026</Text>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-white rounded-2xl py-3.5 items-center"
                onPress={() => setSubscribed(true)}
                activeOpacity={0.9}
              >
                <Text className="text-orange-500 font-bold text-base">
                  Start Monthly Plan · ₹199/mo
                </Text>
                <Text className="text-orange-400 text-xs mt-0.5">
                  Cancel anytime · 7-day free trial
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Plus Features ── */}
          <Text className="text-white font-bold text-base mb-3">Exclusive Benefits</Text>

          {battlePassFeatures.map((f) => (
            <View key={f.id} className="bg-zinc-800 rounded-2xl px-4 py-3.5 mb-2 flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-xl bg-orange-500/20 items-center justify-center">
                <Text className="text-xl">{f.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-sm">{f.title}</Text>
                <Text className="text-zinc-400 text-xs mt-0.5">{f.desc}</Text>
              </View>
              {!subscribed && (
                <View className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-2 py-1">
                  <Text className="text-orange-400 text-xs font-bold">PLUS</Text>
                </View>
              )}
              {subscribed && (
                <Text className="text-green-400 text-base">✓</Text>
              )}
            </View>
          ))}

          {/* ── Map Themes ── */}
          <Text className="text-white font-bold text-base mt-5 mb-3">Map Themes & Skins</Text>

          <View className="flex-row gap-2 mb-5">
            {mapThemes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                className={`flex-1 rounded-2xl py-4 items-center border-2 ${
                  selectedTheme === theme.id && !theme.locked
                    ? 'border-orange-500 bg-orange-500/15'
                    : 'border-zinc-700 bg-zinc-800'
                } ${theme.locked ? 'opacity-50' : ''}`}
                onPress={() => !theme.locked && setSelectedTheme(theme.id)}
                disabled={theme.locked && !subscribed}
              >
                <Text className="text-2xl mb-1">{theme.emoji}</Text>
                <Text className="text-white text-xs font-semibold">{theme.name}</Text>
                {theme.locked && !subscribed && (
                  <Text className="text-zinc-500 text-xs mt-0.5">🔒 Plus</Text>
                )}
                {(!theme.locked || subscribed) && selectedTheme === theme.id && (
                  <View className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Free vs Plus Comparison ── */}
          <Text className="text-white font-bold text-base mb-3">Free vs Plus</Text>

          <View className="bg-zinc-800 rounded-2xl overflow-hidden mb-4">
            {/* Header */}
            <View className="flex-row border-b border-zinc-700">
              <View className="flex-1 py-3 px-4">
                <Text className="text-zinc-400 text-sm font-semibold">Feature</Text>
              </View>
              <View className="w-16 py-3 items-center border-l border-zinc-700">
                <Text className="text-zinc-400 text-sm font-semibold">Free</Text>
              </View>
              <View className="w-16 py-3 items-center border-l border-zinc-700 bg-orange-500/10">
                <Text className="text-orange-400 text-sm font-bold">Plus</Text>
              </View>
            </View>

            {[
              { label: 'Core Gameplay', free: true, plus: true },
              { label: 'Global Leaderboard', free: true, plus: true },
              { label: 'Basic Clans', free: true, plus: true },
              { label: 'Advanced Maps', free: false, plus: true },
              { label: 'Historical Replay', free: false, plus: true },
              { label: 'Private Clans', free: false, plus: true },
              { label: 'All Themes', free: false, plus: true },
            ].map((row, i) => (
              <View key={i} className={`flex-row ${i > 0 ? 'border-t border-zinc-700/50' : ''}`}>
                <View className="flex-1 py-3 px-4">
                  <Text className="text-zinc-300 text-sm">{row.label}</Text>
                </View>
                <View className="w-16 py-3 items-center border-l border-zinc-700">
                  <Text className={`text-base ${row.free ? 'text-green-400' : 'text-zinc-600'}`}>
                    {row.free ? '✓' : '✗'}
                  </Text>
                </View>
                <View className="w-16 py-3 items-center border-l border-zinc-700 bg-orange-500/5">
                  <Text className={`text-base ${row.plus ? 'text-green-400' : 'text-zinc-600'}`}>
                    {row.plus ? '✓' : '✗'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Corporate Wellness Promo ── */}
          <View className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-xl">🏢</Text>
              <Text className="text-white font-bold">Corporate Wellness</Text>
              <View className="bg-blue-500/20 border border-blue-500/30 rounded-full px-2 py-0.5">
                <Text className="text-blue-400 text-xs font-bold">Phase 2</Text>
              </View>
            </View>
            <Text className="text-zinc-400 text-sm mb-3">
              Private company clans, team fitness competitions and leaderboards. Built for enterprises scaling health culture.
            </Text>
            <TouchableOpacity className="border border-zinc-600 rounded-xl py-2.5 items-center">
              <Text className="text-zinc-300 text-sm font-semibold">Join Waitlist →</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* Sticky CTA */}
      {!subscribed && (
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-3 bg-zinc-900/95 border-t border-zinc-800">
          <TouchableOpacity
            className="bg-orange-500 rounded-2xl py-4 items-center"
            onPress={() => setSubscribed(true)}
            activeOpacity={0.85}
          >
            <Text className="text-white text-base font-bold">Unlock RunRealm Plus · ₹199/mo</Text>
            <Text className="text-orange-100 text-xs mt-0.5">7-day free trial · Cancel anytime</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
