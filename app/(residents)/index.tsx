import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { ScriptureCard } from "@/components/ScriptureCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeColor } from "@/hooks/useThemeColor";

import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxScripture } from "@/hooks/useReduxScripture";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { StatusSummaryCard } from "@/components/StatusSummaryCard";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useTaskSummary } from "@/hooks/useTaskSummary";
import { ChoreCard } from "@/components/ChoreCard";
import { useReduxChores } from "@/hooks/useReduxChores";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning, ";
  if (hour < 18) return "Good Afternoon, ";
  return "Good Evening, ";
}

export default function HomeScreen() {
  const navigation = useRouter();
  const primaryColor = useThemeColor({}, "selection");
  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const { user } = useReduxAuth();
  const userName = user?.name?.split(" ")[0] || "User";
  const userHouse = user?.house?.name;
  const [refreshing, setRefreshing] = React.useState(false);

  const { chores, reload: ReloadChores } = useReduxChores({ onlyCurrentUser: true });
  const { summary, summaryLoading } = useTaskSummary();
  const {
    tasks,
    loading: tasksLoading,
    reload: ReloadTasks,
  } = useReduxTasks({
    onlyCurrentUser: true,
  });
  const {
    scriptures,
    loading: scriptureLoading,
    reload: ReloadScripture,
  } = useReduxScripture();

  const latestScripture = scriptures.length > 0 ? scriptures[0] : null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await ReloadTasks();
    await ReloadChores();
    await ReloadScripture();
    setRefreshing(false);
  };

  // console.log("Status Summary Details: ", summary);

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fontSizes = {
    title: isLargeScreen ? 36 : isMediumScreen ? 28 : 24,
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
      maxHeight: isLargeScreen ? 240 : 180,
    },
    taskSection: {
      marginTop: isLargeScreen ? 10 : 5,
    },
  });

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
                {getFormattedDate()}
              </ThemedText>
            </ThemedView>
            <ThemedView
              style={[
                {
                  backgroundColor: primaryColor,
                  justifyContent: "flex-end",
                  alignItems: "center",
                  flexDirection: "row",
                  width: 100,
                },
              ]}
            >
              <Button
                type="icon-rounded"
                icon={require("@/assets/icons/chat.png")}
                iconStyle={{ height: 30, width: 30 }}
                onPress={() => {
                  navigation.push("/conversations");
                }}
                style={{ width: 50, marginRight: 10 }}
              />
              <Avatar />
            </ThemedView>
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
              {getGreeting()}
              {userName}
            </ThemedText>
            <ThemedText
              type="default"
              style={{
                width: "100%",
                color: "#FFFFFF",
                fontSize: fontSizes.subtitle,
              }}
            >
              {userHouse}
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
              <>
                <ChoreCard chore={chores[0]} />

                {summaryLoading || !summary ? (
                  <ActivityIndicator
                    size="large"
                    color={primaryColor}
                    style={{ marginTop: "5%" }}
                  />
                ) : (
                  <StatusSummaryCard summary={summary} />
                )}
              </>
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
