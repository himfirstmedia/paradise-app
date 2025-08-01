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
import { setPushToken, validatePushToken } from "@/redux/slices/authSlice";
import {
  UseSetupPushNotifications,
  registerNotificationListeners,
} from "@/utils/notificationHandler";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const [appIsReady, setAppIsReady] = useState(false);
  const isAuthenticated = useAppSelector(
    (state) => state.auth?.isAuthenticated ?? false
  );
  const user = useAppSelector((state) => state.auth?.user ?? null);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const initializeNotifications = UseSetupPushNotifications();
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // App initialization
  useEffect(() => {
    async function prepareApp() {
      if (!fontsLoaded) return;

      if (isAuthenticated && user?.id) {
        try {
          await dispatch(validatePushToken()).unwrap();
        } catch (error) {
          console.warn("Push token validation failed:", error);
        }
      }

      setAppIsReady(true);
    }

    prepareApp();
  }, [fontsLoaded, isAuthenticated, user, dispatch]);

  // Notification setup for authenticated users
  useEffect(() => {
    if (!appIsReady || !isAuthenticated || !user?.id) return;

    initializeNotifications(true).then((token) => {
      if (token) {
        dispatch(setPushToken(token));
        console.log("Push token initialized:", token);
      }
    });

    const unsubscribe = registerNotificationListeners(
      (notification) => {
        console.log("Notification received:", notification);
      },
      (response) => {
        const taskId = response.notification.request.content.data?.taskId;
        if (taskId) router.push(`/task-detail?id=${taskId}`);
      }
    );

    return () => unsubscribe();
  }, [
    appIsReady,
    isAuthenticated,
    user,
    router,
    initializeNotifications,
    dispatch,
  ]);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) SplashScreen.hideAsync();
  }, [appIsReady]);

  if (!appIsReady) return null;

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
