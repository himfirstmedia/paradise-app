import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { SimpleHeader } from "@/components/SimpleHeader";
import { UpdateHeader } from "@/components/UpdateHeader";
import { useCallback, useEffect, useState } from "react";
import { View, StatusBar } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import * as SplashScreen from "expo-splash-screen";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { validateToken } from "@/redux/slices/authSlice";
import {
  registerNotificationListeners,
  SetupPushNotifications,
} from "@/utils/notificationHandler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const [appIsReady, setAppIsReady] = useState(false);
  const { user, isAuthenticated, expoPushToken } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const initializeNotifications = SetupPushNotifications();

  useEffect(() => {
    async function prepareApp() {
      if (!fontsLoaded) return;

      if (isAuthenticated && expoPushToken) {
        try {
          await dispatch(validateToken()).unwrap();
        } catch (error) {
          console.warn("Token validation failed:", error);
          router.replace("/auth/login");
        }
      }

      setAppIsReady(true);
    }

    prepareApp();
  }, [fontsLoaded, isAuthenticated, expoPushToken, dispatch, router]);

  useEffect(() => {
    async function setupNotifications() {
      const token = await initializeNotifications(false);
      if (token) {
        console.log("Notifications initialized with token:", token);
      }
    }
    setupNotifications();
  }, [initializeNotifications]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      async function saveToken() {
        const token = await initializeNotifications(true);
        if (token) {
          console.log("Push token saved for authenticated user:", token);
        }
      }
      saveToken();

      const unsubscribe = registerNotificationListeners(
        (notification) => {
          console.log("Notification received:", notification);
        },
        (response) => {
          console.log("Notification response:", response);
          const taskId = response.notification.request.content.data?.taskId;
          if (taskId) {
            router.push(`/task-detail?id=${taskId}`);
          }
        }
      );

      return () => unsubscribe();
    }
  }, [isAuthenticated, user?.id, router, initializeNotifications]);

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
            name="add-chore"
            options={{ header: () => <SimpleHeader title="Create Chore" /> }}
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
            name="chore-detail"
            options={{
              header: () => <SimpleHeader title="Primary Chore Details" />,
            }}
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
            name="chore-manager"
            options={{ header: () => <SimpleHeader title="Manage Chores" /> }}
          />
          <Stack.Screen
            name="comments"
            options={{
              header: () => <SimpleHeader title="Comments & Suggestions" />,
            }}
          />
          <Stack.Screen
            name="comments-manager"
            options={{
              header: () => <SimpleHeader title="Comments & Suggestions" />,
            }}
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
            options={{
              header: () => <SimpleHeader title="Create New House" />,
            }}
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
          <Stack.Screen
            name="chore-tasks"
            options={{ header: () => <SimpleHeader title="Chore Tasks" /> }}
          />
          <Stack.Screen
            name="conversations"
            options={{ header: () => <SimpleHeader title="Messages" /> }}
          />
          <Stack.Screen
            name="new-message"
            options={{ header: () => <SimpleHeader title="New Message" /> }}
          />
          <Stack.Screen name="chat-room" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </View>
  );
}
