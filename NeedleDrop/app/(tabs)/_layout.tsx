import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#74B4AD",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Music",
          tabBarIcon: ({ color }) => (
            <Ionicons name="disc-outline" size={25} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="likedsongs"
        options={{
          title: "Liked Songs",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={25} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
