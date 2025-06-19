import { Tabs } from "expo-router";
import React from "react";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StatusBar } from "react-native";
import CustomNavBar from "@/components/CustomNavBar";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const bgColor = useThemeColor({}, "selection");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar barStyle="light-content" backgroundColor={bgColor} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          headerShown: false,
          headerShadowVisible: false,
          headerTintColor: Colors[colorScheme].text,
          
        }}
        tabBar={(props) => <CustomNavBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="teams"
          options={{
            title: "Members",
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: "Tasks",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
