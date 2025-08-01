import React from "react";
import {
  ActivityIndicator,
  Button,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { ScriptureCard } from "@/components/ScriptureCard";
import { TaskCard } from "@/components/TaskCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeColor } from "@/hooks/useThemeColor";

import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxScripture } from "@/hooks/useReduxScripture";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { SetupPushNotifications } from "@/utils/notificationHandler";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning, ";
  if (hour < 18) return "Good Afternoon, ";
  return "Good Evening, ";
}

export default function HomeScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const { user } = useReduxAuth();
  const userName = user?.name?.split(" ")[0] || "User";
const [refreshing, setRefreshing] = React.useState(false);
  const { tasks, loading: tasksLoading, reload: ReloadTasks } = useReduxTasks({
    onlyCurrentUser: true,
  });
  const { scriptures, loading: scriptureLoading, reload: ReloadScripture } = useReduxScripture();

  const latestScripture = scriptures.length > 0 ? scriptures[0] : null;

  const handleRefresh = async () => {
      setRefreshing(true);
      await ReloadTasks();
      await ReloadScripture();
      setRefreshing(false);
    };

  const fontSizes = {
    title: isLargeScreen ? 36 : isMediumScreen ? 28 : 22,
    subtitle: isLargeScreen ? 22 : isMediumScreen ? 18 : 16,
  };

  const responsiveStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isLargeScreen ? 40 : 20,
    },
    containerPadding: {
      paddingHorizontal: isLargeScreen ? 150 : isMediumScreen ? 40 : 15,
    },
    scriptureSection: {
      marginBottom: isLargeScreen ? 15 : 20,
      marginTop: isLargeScreen ? 10 : 5,
      maxHeight: isLargeScreen ? 200 : 140,
    },
    taskSection: {
      marginTop: isLargeScreen ? 10 : 5,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const TestNotificationPermission = () => {
  const initializeNotifications = SetupPushNotifications();
  const requestPermission = async () => {
    const token = await initializeNotifications(false);
    console.log('Notification setup result:', token);
  };

  return <Button title="Request Notification Permission" onPress={requestPermission} />;
};

  return (
    <ThemedView style={styles.container}>
      <ScrollView
      refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={primaryColor} // iOS
                    colors={[primaryColor]} // Android
                  />
                }
        contentContainerStyle={{
          alignItems: "center",
          width: "100%",
          paddingBottom: "30%",
        }}
        style={styles.innerContainer}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView
          style={[
            styles.headerCard,
            { backgroundColor: primaryColor },
            responsiveStyles.containerPadding,
          ]}
        >
          <ThemedView style={[styles.row, { backgroundColor: primaryColor }]}>
            <ThemedView style={{ backgroundColor: primaryColor }}>
              <ThemedText
                type="subtitle"
                style={{
                  fontWeight: "600",
                  color: "#FFFFFF",
                  fontSize: fontSizes.subtitle,
                }}
              >
                {getGreeting()}
                {userName}
              </ThemedText>
            </ThemedView>
            <Avatar />
          </ThemedView>

          <View style={{ marginTop: 10, gap: 12 }}>
            <ThemedText
              type="title"
              style={{
                width: "100%",
                color: "#FFFFFF",
                fontSize: fontSizes.title,
              }}
            >
              Welcome to Paradise App.
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView
          style={[styles.subContainer, responsiveStyles.containerPadding]}
        >
          <View style={responsiveStyles.scriptureSection}>
            {!scriptureLoading ? (
              latestScripture ? (
                <ScriptureCard
                  verse={latestScripture.verse}
                  book={latestScripture.book}
                  version={latestScripture.version}
                  scripture={latestScripture.scripture}
                />
              ) : (
                <ThemedText
                  type="default"
                  style={{
                    textAlign: "center",
                    color: "#888",
                  }}
                >
                  No scriptures to display at the moment.
                </ThemedText>
              )
            ) : null}
          </View>

          {/* <TestNotificationPermission /> */}

          <View style={{ marginTop: "1%" }}>
            {tasksLoading ? (
              <ActivityIndicator
                size="large"
                color={primaryColor}
                style={{ marginTop: "5%" }}
              />
            ) : tasks.length === 0 ? (
              <ThemedText
                type="default"
                style={{
                  textAlign: "center",
                  marginTop: 24,
                  color: "#888",
                }}
              >
                You have no tasks assigned yet.
              </ThemedText>
            ) : (
              <TaskCard tasks={tasks} />
            )}
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
  },
  innerContainer: {
    flexGrow: 1,
    width: "100%",
  },
  subContainer: {
    width: "100%",
    paddingHorizontal: 15,
  },
  headerCard: {
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
