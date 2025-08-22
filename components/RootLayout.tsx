import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { SimpleHeader } from "@/components/SimpleHeader";
import { UpdateHeader } from "@/components/UpdateHeader";
import { useCallback, useEffect, useRef, useState } from "react";
import { View, StatusBar, ActivityIndicator } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import * as SplashScreen from "expo-splash-screen";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setPushToken } from "@/redux/slices/authSlice";
import {
  UseSetupPushNotifications,
  registerNotificationListeners,
} from "@/utils/notificationHandler";
import * as Notifications from "expo-notifications";
import { useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

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
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const splashHiddenRef = useRef(false);
  const isMountedRef = useRef(true);

  const isAuthenticated = useAppSelector(
    (state) => state.auth?.isAuthenticated ?? false
  );
  const userId = useAppSelector((state) => state.auth?.user?.id ?? null);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const tokenSavedRef = useRef(false);
  const initializeNotifications = UseSetupPushNotifications();

  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 1️⃣ Prepare app (fonts, splash)
  useEffect(() => {
    console.log('Font loading status:', { fontsLoaded, fontError });
    if (!fontsLoaded && !fontError) return;

    async function prepareApp() {
      try {
        console.log('Preparing app...');
        if (fontError) {
          console.warn('❌ Font loading failed:', fontError);
        }
        if (!splashHiddenRef.current) {
          console.log('Hiding splash screen early...');
          await SplashScreen.hideAsync();
          console.log('✅ Splash screen hidden early');
          splashHiddenRef.current = true;
        }
      } catch (error) {
        console.warn('❌ App preparation failed:', error);
      } finally {
        if (isMountedRef.current) {
          console.log('Setting appIsReady to true');
          setAppIsReady(true);
        }
      }
    }

    prepareApp();
  }, [fontsLoaded, fontError]);

  // 2️⃣ Initialize push notifications when user logs in
  useEffect(() => {
    if (!isAuthenticated || !userId || tokenSavedRef.current) {
      console.log('Skipping permissions setup:', { isAuthenticated, userId });
      return;
    }

    async function setupPermissions() {
      try {
        const token = await initializeNotifications(true);
        if (token && isMountedRef.current) {
          dispatch(setPushToken(token));
        }

        if (!cameraPermission?.granted && isMountedRef.current) {
          await requestCameraPermission();
        }

        if (isMountedRef.current) {
          await MediaLibrary.requestPermissionsAsync();
          tokenSavedRef.current = true;
        }
      } catch (error) {
        console.warn('❌ Permission setup failed:', error);
      }
    }

    if (isMountedRef.current) {
      setupPermissions();
    }
  }, [isAuthenticated, userId, dispatch, initializeNotifications, requestCameraPermission, cameraPermission]);

  // 3️⃣ Register notification listeners after app is ready
  useEffect(() => {
    if (!appIsReady) return;

    const unsubscribe = registerNotificationListeners(
      (notification) => {
        console.log("📥 Notification received:", notification);
      },
      (response) => {
        const taskId = response.notification.request.content.data?.taskId;
        if (taskId) {
          router.push(`/task-detail?id=${taskId}`);
        }
      }
    );

    return () => unsubscribe();
  }, [appIsReady, router]);

  // Splash screen handler
  const onLayoutRootView = useCallback(() => {
    if (appIsReady) SplashScreen.hideAsync();
  }, [appIsReady]);

  if (!appIsReady) {
    console.log('Rendering loader:', { appIsReady });
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors[colorScheme].background,
          }}
        >
          <ActivityIndicator size='large' color={Colors[colorScheme].tint} />
        </View>
      </ThemeProvider>
    );
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
          <Stack.Screen name="(director)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(managers)"
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
            name="update-chore"
            options={{ header: () => <SimpleHeader title="Update Chore" /> }}
          />
          <Stack.Screen
            name="assign-chore"
            options={{ header: () => <SimpleHeader title="Assign Chore" /> }}
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
              header: () => <SimpleHeader title="Chore Details" />,
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
