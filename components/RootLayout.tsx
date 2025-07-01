
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { SimpleHeader } from "@/components/SimpleHeader";
import { UpdateHeader } from "@/components/UpdateHeader";
import { useCallback, useEffect, useState, useRef } from "react";
import { View, StatusBar } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import * as SplashScreen from "expo-splash-screen";
import { useAppSelector } from "@/redux/hooks";

// Prevent auto-hiding splash until manually dismissed
SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const [appIsReady, setAppIsReady] = useState(false);
  const hasCheckedAuthRef = useRef(false);

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!fontsLoaded) return;

    // Only check auth status once
    if (!hasCheckedAuthRef.current) {
      hasCheckedAuthRef.current = true;
      setAppIsReady(true);
    }
  }, [fontsLoaded, isAuthenticated]);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
      onLayout={onLayoutRootView}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={Colors[colorScheme].selection}
      />
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Auth & Role Groups */}
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(individuals)" options={{ headerShown: false }} />
          <Stack.Screen name="(director)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(resident-manager)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(facility-manager)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(residents)" options={{ headerShown: false }} />

          {/* Other Routes */}
          <Stack.Screen
            name="task-detail"
            options={{ header: () => <UpdateHeader title="Task Details" /> }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{ header: () => <SimpleHeader title="Profile" /> }}
          />
          <Stack.Screen
            name="add-task"
            options={{ header: () => <SimpleHeader title="Create Task" /> }}
          />
          <Stack.Screen
            name="assign-task"
            options={{ header: () => <SimpleHeader title="Assign Task" /> }}
          />
          <Stack.Screen
            name="add-member"
            options={{ header: () => <SimpleHeader title="Add Member" /> }}
          />
          <Stack.Screen
            name="member-detail"
            options={{ header: () => <SimpleHeader title="Member Profile" /> }}
          />
          <Stack.Screen
            name="change-password"
            options={{ header: () => <SimpleHeader title="Password" /> }}
          />
          <Stack.Screen
            name="reports"
            options={{ header: () => <SimpleHeader title="Reports" /> }}
          />
          <Stack.Screen
            name="report-details"
            options={{ header: () => <SimpleHeader title="Report Details" /> }}
          />
          <Stack.Screen
            name="members"
            options={{ header: () => <SimpleHeader title="Members" /> }}
          />
          <Stack.Screen
            name="task-manager"
            options={{ header: () => <SimpleHeader title="Manage Tasks" /> }}
          />
          <Stack.Screen
            name="comments"
            options={{
              header: () => <SimpleHeader title="Comments & Suggestions" />,
            }}
          />
          <Stack.Screen
            name="comments-manager"
            options={{ header: () => <SimpleHeader title="Comments & Suggestions" /> }}
          />
          <Stack.Screen
            name="scriptures-manager"
            options={{
              header: () => <SimpleHeader title="Manage Scriptures" />,
            }}
          />
          <Stack.Screen
            name="post-scripture"
            options={{ header: () => <SimpleHeader title="Scripture" /> }}
          />
          <Stack.Screen
            name="add-house"
            options={{ header: () => <SimpleHeader title="Create New House" /> }}
          />
          <Stack.Screen
            name="edit-house"
            options={{ header: () => <SimpleHeader title="Update House" /> }}
          />
          <Stack.Screen
            name="house-manager"
            options={{ header: () => <SimpleHeader title="Manage Houses" /> }}
          />
          <Stack.Screen
            name="house-detail"
            options={{ header: () => <SimpleHeader title="House Detail" /> }}
          />
        </Stack>
      </ThemeProvider>
    </View>
  );
}
