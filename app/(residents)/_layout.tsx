import { Tabs } from "expo-router";
import React from "react";

// import { Colors } from "@/constants/Colors";
// import { useColorScheme } from "@/hooks/useColorScheme";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StatusBar } from "react-native";
import CustomNavBar from "@/components/CustomNavBar";

export default function TabLayout() {
  // const colorScheme = useColorScheme() ?? "light";
  const bgColor = useThemeColor({}, "selection");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar barStyle="light-content" backgroundColor={bgColor} />
      {/* <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          headerShown: false,
          headerShadowVisible: false,
          headerTintColor: Colors[colorScheme].text,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme].background,
            borderColor: Colors[colorScheme].background,
            height: 60,
            paddingTop: 5,
          },
        }}
      > */}
          <Tabs tabBar={(props) => <CustomNavBar {...props} />}>
        <Tabs.Screen
          name="index"
          options={{
            title: "",
            tabBarIcon: ({ color }) => (
              <Image
                source={require("@/assets/icons/home.png")}
                style={{ width: 30, height: 30, tintColor: color }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: "",
            tabBarIcon: ({ color }) => (
              <Image
                source={require("@/assets/icons/task.png")}
                style={{ width: 30, height: 30, tintColor: color }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Image
                source={require("@/assets/icons/profile.png")}
                style={{ width: 30, height: 30, tintColor: color }}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
