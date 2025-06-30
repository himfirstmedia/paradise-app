import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { ScriptureCard } from "@/components/ScriptureCard";
import { TaskCard } from "@/components/TaskCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeColor } from "@/hooks/useThemeColor";

import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxScripture } from "@/hooks/useReduxScripture";
import { useReduxTasks } from "@/hooks/useReduxTasks";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 18) return "Good Afternoon,";
  return "Good Evening,";
}

export default function HomeScreen() {
  const primaryColor = useThemeColor({}, "selection");

  const { user } = useReduxAuth();
  const userName = user?.name?.split(" ")[0] || "User";

  const { tasks, loading: tasksLoading } = useReduxTasks();
  const { scriptures, loading: scriptureLoading } = useReduxScripture();

  const latestScripture = scriptures.length > 0 ? scriptures[0] : null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          width: "100%",
          paddingBottom: "30%",
        }}
        style={styles.innerContainer}
      >
        <ThemedView
          style={[styles.headerCard, { backgroundColor: primaryColor }]}
        >
          <ThemedView style={[styles.row, { backgroundColor: primaryColor }]}>
            <ThemedView style={{ backgroundColor: primaryColor }}>
              <ThemedText
                type="subtitle"
                style={{ fontWeight: "600", color: "#FFFFFF" }}
              >
                {getGreeting()}
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={{ fontWeight: "600", color: "#FFFFFF" }}
              >
                {userName}
              </ThemedText>
            </ThemedView>
            <Avatar />
          </ThemedView>

          <View style={{ marginTop: "8%", gap: 12 }}>
            <ThemedText type="title" style={{ width: "80%", color: "#FFFFFF" }}>
              Welcome To Paradise Management.
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.subContainer}>
          <View style={{ marginBottom: "5%", marginTop: "2%", height: 130 }}>
            {!scriptureLoading && latestScripture && (
              <ScriptureCard
                verse={latestScripture.verse}
                book={latestScripture.book}
                version={latestScripture.version}
                scripture={latestScripture.scripture}
              />
            )}
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
                There are no tasks assigned yet.
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
    minHeight: 200,
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
    marginBottom: "5%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
