import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { SimpleHeader } from "@/components/SimpleHeader";
import { UpdateHeader } from "@/components/UpdateHeader";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View, StatusBar } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import * as SplashScreen from "expo-splash-screen";
import { cacheOnStart } from "@/hooks/useCacheOnStart";
import api from "@/utils/api";
import StorageParams from "@/constants/StorageParams";
import { UserSessionUtils } from "@/utils/UserSessionUtils";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

// Keep splash visible until we finish setup
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);
  const [preloadLoading, setPreloadLoading] = useState(true);
  const [preloadError, setPreloadError] = useState<Error | null>(null);

  // Load your fonts here, e.g.:
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const cacheItems = useMemo(
    () => [
      {
        key: StorageParams.CACHED_USERS,
        fetcher: () => api.get("/users").then((res) => res.data),
      },
      {
        key: StorageParams.CACHED_HOUSES,
        fetcher: () => api.get("/houses").then((res) => res.data),
      },
      {
        key: StorageParams.CACHED_TASKS,
        fetcher: () => api.get("/tasks").then((res) => res.data),
      },
      {
        key: StorageParams.CACHED_FEEDBACKS,
        fetcher: () => api.get("/feedback").then((res) => res.data),
      },
      {
        key: StorageParams.CACHED_SCRIPTURES,
        fetcher: () => api.get("/scriptures").then((res) => res.data),
      },
    ],
    []
  );

  // Preload cache on mount
  useEffect(() => {
    let isMounted = true;
    const preload = async () => {
      setPreloadLoading(true);
      const result = await cacheOnStart(cacheItems);
      if (isMounted) {
        setPreloadLoading(false);
        setPreloadError(result.error);
      }
    };
    preload();
    return () => {
      isMounted = false;
    };
  }, [cacheItems]);

  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      try {
        const isLoggedIn = await UserSessionUtils.isLoggedIn();
        const user = await UserSessionUtils.getUserDetails();

        const roleRoutes = {
          SUPER_ADMIN: "/(director)",
          DIRECTOR: "/(director)",
          RESIDENT_MANAGER: "/(resident-manager)",
          FACILITY_MANAGER: "/(facility-manager)",
          RESIDENT: "/(residents)",
          INDIVIDUAL: "/(individuals)",
        };

        type RoleKey = keyof typeof roleRoutes;

        const route:
          | "/(director)"
          | "/(resident-manager)"
          | "/(facility-manager)"
          | "/(residents)"
          | "/(individuals)"
          | "/auth/login" =
          isLoggedIn && user?.role && (user.role as RoleKey) in roleRoutes
            ? (roleRoutes[user.role as RoleKey] as
                | "/(director)"
                | "/(resident-manager)"
                | "/(facility-manager)"
                | "/(residents)"
                | "/(individuals)")
            : "/auth/login";

        router.replace(route);
      } catch {
        router.replace("/auth/login");
      } finally {
        if (isMounted) setAppIsReady(true);
      }
    };

    if (fontsLoaded && !preloadLoading && !preloadError) {
      initialize();
    }

    return () => {
      isMounted = false;
    };
  }, [fontsLoaded, preloadLoading, preloadError, router]);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      const timeout = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 300);
      return () => clearTimeout(timeout);
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
      <Provider store={store}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            {/* Auth & Role Groups */}
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen
              name="(individuals)"
              options={{ headerShown: false }}
            />
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
              options={{
                header: () => <SimpleHeader title="Member Profile" />,
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
              options={{
                header: () => <SimpleHeader title="Report Details" />,
              }}
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
              options={{ header: () => <SimpleHeader title="Feedback" /> }}
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
              options={{ header: () => <SimpleHeader title="Manage House" /> }}
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
      </Provider>
    </View>
  );
}