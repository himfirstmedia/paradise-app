/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { ScriptureCard } from "@/components/ScriptureCard";
import { TaskCard } from "@/components/TaskCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/ui/Avatar";
import { useReduxScripture } from "@/hooks/useReduxScripture";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import { UserSessionUtils } from "@/utils/UserSessionUtils";
import { useRouter } from "expo-router";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 18) return "Good Afternoon,";
  return "Good Evening,";
}

export default function HomeScreen() {
   const primaryColor = useThemeColor({}, "selection");
  const navigation = useRouter();
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userHouse, setUserHouse] = useState<string | null>(null);
  const { tasks, loading } = useReduxTasks({ onlyCurrentUser: true });
  const { scriptures, loading: scriptureLoading } = useReduxScripture();

  const latestScripture = scriptures.length > 0 ? scriptures[0] : null;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await UserSessionUtils.getUserDetails();
        if (userData) {
          const fullName = userData.name || userData.fullName || "";
          const firstName = fullName.split(" ")[0] || "";
          setUserName(firstName);
          setUserRole(userData.role || null);
          setUserHouse(userData.house || null);
        }
      } catch {
        setUserName("User");
        setUserRole(null);
        setUserHouse(null);
      }
    };
    fetchUser();
  }, []);

  // Helper to format house enum to readable string
  const formatHouse = (house: string | null) => {
    if (!house) return "";
    if (house === "LILLIE_LOUISE_WOERMER_HOUSE") return "Lillie Louise Woermer House";
    if (house === "CAROLYN_ECKMAN_HOUSE") return "Carolyn Eckman House";
    return house;
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            width: "100%",
            flex: 1,
          }}
          style={styles.innerContainer}
        >
          <ThemedView
            style={[styles.headerCard, { backgroundColor: primaryColor }]}
          >
            <ThemedView style={[styles.row, { backgroundColor: primaryColor }]}>
              <ThemedView style={[{ backgroundColor: primaryColor }]}>
                <ThemedText
                  type="subtitle"
                  style={{ fontWeight: 600, color: "#FFFFFF" }}
                >
                  {getGreeting()}
                </ThemedText>
                <ThemedText
                  type="subtitle"
                  style={{ fontWeight: 600, color: "#FFFFFF" }}
                >
                  {userName}
                </ThemedText>
              </ThemedView>
              <Avatar />
            </ThemedView>

            <View style={{ marginTop: "8%", gap: 12 }}>
              {userRole === "RESIDENT" && userHouse ? (
                <ThemedText
                  type="title"
                  style={{ width: "60%", color: "#FFFFFF" }}
                >
                  {formatHouse(userHouse)}
                </ThemedText>
              ) : userRole === "INDIVIDUAL" ? (
                <ThemedText
                  type="title"
                  style={{ width: "80%", color: "#FFFFFF" }}
                >
                  Welcome To Paradise Home App.
                </ThemedText>
              ) : null}
            </View>
          </ThemedView>

          <ThemedView style={styles.subContainer}>
            <View style={{ marginBottom: "5%", marginTop: "5%" }}>
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
              {loading ? (
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
    </>
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
    flex: 1,
    width: "100%",
  },
  subContainer: {
    width: "100%",
    paddingHorizontal: 15,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerCard: {
    minHeight: 200,
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
