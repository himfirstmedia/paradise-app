import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SimpleHeader } from "@/components/SimpleHeader";
import { UpdateHeader } from "@/components/UpdateHeader";
import "react-native-reanimated";

import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set optional animation
SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";

  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Prepare the app (wait for fonts and any other async tasks)
  useEffect(() => {
    async function prepare() {
      try {
        if (fontsLoaded) {
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn("Error during app preparation", e);
      }
    }

    prepare();
  }, [fontsLoaded]);

  // Hide splash when layout is ready
  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Don't render anything until ready
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
      onLayout={onLayoutRootView}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(individuals)" options={{ headerShown: false }} />
            <Stack.Screen name="(director)" options={{ headerShown: false }} />
            <Stack.Screen name="(resident-manager)" options={{ headerShown: false }} />
            <Stack.Screen name="(facility-manager)" options={{ headerShown: false }} />
            <Stack.Screen name="(residents)" options={{ headerShown: false }} />
            <Stack.Screen
              name="task-detail"
              options={{
                headerShown: true,
                header: () => <UpdateHeader title="Task Details" />,
              }}
            />
            <Stack.Screen
              name="edit-profile"
              options={{
                headerShown: true,
                header: () => <SimpleHeader title="Profile" />,
              }}
            />
            <Stack.Screen
              name="add-task"
              options={{
                headerShown: true,
                header: () => <SimpleHeader title="Create Task" />,
              }}
            />
            <Stack.Screen
              name="add-member"
              options={{
                headerShown: true,
                header: () => <SimpleHeader title="Add Member" />,
                headerStyle: {
                  backgroundColor: "red"
                }
              }}
            />
            <Stack.Screen
              name="member-detail"
              options={{
                headerShown: true,
                header: () => <SimpleHeader title="Member Profile" />,
              }}
            />
            <Stack.Screen
              name="change-password"
              options={{
                headerShown: true,
                header: () => <SimpleHeader title="Password" />,
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaView>
    </View>
  );
}
