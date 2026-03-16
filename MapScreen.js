import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView,
  StatusBar, Animated, ScrollView,
} from 'react-native';
import { territories } from '../data/gameData';

const GRID_SIZE = 7;

function generateGrid() {
  return Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => {
      const isOwned = (r === 3 && c === 3) || (r === 3 && c === 4) || (r === 4 && c === 3);
      const isNearby = Math.random() > 0.6;
      return {
        id: `${r}-${c}`,
        row: r, col: c,
        owned: isOwned,
        partial: !isOwned && isNearby && Math.random() > 0.5,
        strength: isOwned ? Math.floor(Math.random() * 40 + 55) : 0,
        enemy: !isOwned && Math.random() > 0.8,
      };
    })
  );
}

export default function MapScreen({ navigation }) {
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState(generateGrid());
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [captureProgress, setCaptureProgress] = useState(12);
  const [currentSector] = useState('Zone 1 · Sector 4');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      timerRef.current = setInterval(() => {
        setElapsed(e => e + 1);
        setDistance(d => +(d + 0.003).toFixed(3));
        setCaptureProgress(p => Math.min(p + 0.4, 100));
      }, 1000);
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleEndRun = () => {
    setRunning(false);
    setElapsed(0);
    setDistance(0);
    setCaptureProgress(12);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <StatusBar barStyle="light-content" backgroundColor="#18181b" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-zinc-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-zinc-400 text-base">← Back</Text>
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-white font-bold text-sm">
            {running ? '🟢 RUNNING' : 'TERRITORY MAP'}
          </Text>
          {running && (
            <Text className="text-orange-400 text-xs font-mono">{formatTime(elapsed)}</Text>
          )}
        </View>
        <TouchableOpacity className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center">
          <Text className="text-base">⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pb-24">

          {/* ── Territory Grid (fake map) ── */}
          <View className="bg-zinc-800 rounded-2xl overflow-hidden mt-4 mb-4">
            {/* Map legend */}
            <View className="flex-row gap-4 px-4 py-3 border-b border-zinc-700">
              <View className="flex-row items-center gap-1.5">
                <View className="w-3 h-3 rounded-sm bg-orange-500" />
                <Text className="text-zinc-400 text-xs">Your Zone</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-3 h-3 rounded-sm bg-blue-500/60" />
                <Text className="text-zinc-400 text-xs">Nearby</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-3 h-3 rounded-sm bg-red-500/60" />
                <Text className="text-zinc-400 text-xs">Enemy</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-3 h-3 rounded-sm bg-zinc-700" />
                <Text className="text-zinc-400 text-xs">Neutral</Text>
              </View>
            </View>

            {/* Grid */}
            <View className="p-3">
              {grid.map((row, ri) => (
                <View key={ri} className="flex-row justify-center gap-1 mb-1">
                  {row.map((cell) => {
                    let cellBg = 'bg-zinc-700';
                    if (cell.owned) cellBg = 'bg-orange-500';
                    else if (cell.enemy) cellBg = 'bg-red-500/60';
                    else if (cell.partial) cellBg = 'bg-blue-500/40';

                    const isCenter = cell.row === 3 && cell.col === 3;

                    return (
                      <Animated.View
                        key={cell.id}
                        style={isCenter && running ? [{ transform: [{ scale: pulseAnim }] }] : {}}
                      >
                        <View
                          className={`w-10 h-10 rounded-lg ${cellBg} items-center justify-center border ${
                            cell.owned ? 'border-orange-400' : 'border-zinc-600'
                          }`}
                        >
                          {isCenter && (
                            <Text className="text-base">{running ? '📍' : '🏰'}</Text>
                          )}
                          {cell.enemy && <Text className="text-xs">⚔️</Text>}
                        </View>
                      </Animated.View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {/* ── Live Run Stats (shown when running) ── */}
          {running && (
            <View className="bg-zinc-800 rounded-2xl p-4 mb-4 border border-orange-500/30">
              <View className="flex-row justify-between mb-4">
                <View className="items-center">
                  <Text className="text-white font-bold text-xl">{distance.toFixed(2)} km</Text>
                  <Text className="text-zinc-500 text-xs">DISTANCE</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white font-bold text-xl">{distance > 0 ? `${Math.floor(elapsed / distance / 60)}:${String(Math.floor((elapsed / distance) % 60)).padStart(2, '0')}` : '--:--'}</Text>
                  <Text className="text-zinc-500 text-xs">PACE /km</Text>
                </View>
                <View className="items-center">
                  <Text className="text-orange-400 font-bold text-xl">Zone 1</Text>
                  <Text className="text-zinc-500 text-xs">SECTOR</Text>
                </View>
              </View>

              {/* Capture progress */}
              <View className="bg-zinc-700/50 rounded-xl p-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white text-sm font-semibold">🏴 Sector Capture</Text>
                  <Text className="text-orange-400 font-bold">{captureProgress.toFixed(0)}%</Text>
                </View>
                <Text className="text-zinc-400 text-xs mb-2">{currentSector}</Text>
                <View className="h-2.5 bg-zinc-600 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${captureProgress}%` }}
                  />
                </View>
                <Text className="text-zinc-500 text-xs mt-1">{(100 - captureProgress).toFixed(0)}% remaining to capture</Text>
              </View>
            </View>
          )}

          {/* ── Nearby Territories ── */}
          <Text className="text-white font-bold text-base mb-3">
            {running ? 'Zones In Range' : 'Territory Overview'}
          </Text>

          {territories.map((t) => (
            <View key={t.id} className="bg-zinc-800 rounded-2xl p-4 mb-2">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-white font-semibold text-sm">{t.name}</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5">Captured {t.capturedDaysAgo} days ago</Text>
                </View>
                <View
                  className="px-2 py-1 rounded-lg"
                  style={{ backgroundColor: t.color + '33' }}
                >
                  <Text className="text-xs font-bold" style={{ color: t.color }}>
                    {t.strength}% strength
                  </Text>
                </View>
              </View>

              <View className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${t.strength}%`,
                    backgroundColor: t.strength > 70 ? '#4CAF50' : t.strength > 40 ? '#FF6B35' : '#ef4444',
                  }}
                />
              </View>

              {running && (
                <TouchableOpacity className="mt-3 bg-orange-500/20 border border-orange-500/40 rounded-xl py-2 items-center">
                  <Text className="text-orange-400 text-xs font-bold">🏃 Run Through Zone</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

        </View>
      </ScrollView>

      {/* ── Bottom Run Control ── */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-3 bg-zinc-900/95 border-t border-zinc-800">
        {running ? (
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-zinc-700 rounded-2xl py-4 items-center"
            >
              <Text className="text-white text-base">⏸ Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-500/20 border border-red-500/40 rounded-2xl py-4 items-center"
              onPress={handleEndRun}
            >
              <Text className="text-red-400 text-base font-bold">⏹ End Run</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            className="bg-orange-500 rounded-2xl py-4 items-center"
            onPress={() => setRunning(true)}
            activeOpacity={0.85}
          >
            <Text className="text-white text-lg font-bold">▶  START CAPTURING</Text>
            <Text className="text-orange-100 text-xs mt-0.5">GPS tracking will begin</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
