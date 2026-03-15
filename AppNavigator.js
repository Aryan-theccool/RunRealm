import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import RankScreen from '../screens/RankScreen';
import BattlePassScreen from '../screens/BattlePassScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom tab bar
function CustomTabBar({ state, descriptors, navigation }) {
  const tabs = [
    { key: 'Home', icon: '🏠', label: 'Home' },
    { key: 'Map', icon: '🗺️', label: 'Map' },
    { key: 'Rank', icon: '🏆', label: 'Rank' },
    { key: 'BattlePass', icon: '⚡', label: 'Plus' },
    { key: 'Profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#18181b',
        borderTopWidth: 1,
        borderTopColor: '#27272a',
        paddingBottom: 20,
        paddingTop: 10,
        paddingHorizontal: 8,
      }}
    >
      {state.routes.map((route, index) => {
        const tab = tabs.find(t => t.key === route.name);
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            style={{ flex: 1, alignItems: 'center', gap: 2 }}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            {isFocused && (
              <View
                style={{
                  position: 'absolute',
                  top: -10,
                  width: 32,
                  height: 3,
                  backgroundColor: '#f97316',
                  borderRadius: 2,
                }}
              />
            )}
            <Text style={{ fontSize: 20 }}>{tab?.icon}</Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: isFocused ? '700' : '400',
                color: isFocused ? '#f97316' : '#71717a',
              }}
            >
              {tab?.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Rank" component={RankScreen} />
      <Tab.Screen name="BattlePass" component={BattlePassScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root Stack (allows full-screen modals if needed)
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  );
}
