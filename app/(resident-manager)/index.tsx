import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ScriptureCardBoard } from "@/components/ScriptureCard";
import { TaskCard } from "@/components/TaskCard";
import { useRouter } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ThemedText";

import type { ProgressType } from "@/components/TaskCard";

const TASKS_DB = [
  {
    name: "Clearing the lawn",
    description: "Remove debris and tidy up the lawn area.",
    progress: "PENDING" as ProgressType,
  },
  {
    name: "Watering plants",
    description: "Ensure all plants are watered thoroughly.",
    progress: "PENDING" as ProgressType,
  },
  {
    name: "Trimming hedges",
    description: "Trim the hedges to maintain a neat appearance.",
    progress: "PENDING" as ProgressType,
  },
  {
    name: "Weeding flower beds",
    description: "Remove weeds from all flower beds.",
    progress: "PENDING" as ProgressType,
  },
  {
    name: "Clearing the lawn",
    description: "Remove debris and tidy up the lawn area.",
    progress: "PENDING" as ProgressType,
  },
  {
    name: "Watering plants",
    description: "Ensure all plants are watered thoroughly.",
    progress: "PENDING" as ProgressType,
  },
];

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user?.name || "User");
        }
      } catch {
        setUserName("User");
      }
    };
    fetchUser();
  }, []);

  const tasks = TASKS_DB.map((task) => ({
    ...task,
    onPress: () =>
      navigation.navigate({
        pathname: "/task-detail",
        params: { name: task.name, description: task.description },
      }),
  }));

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            width: "100%",
            paddingBottom: "30%",
          }}
          style={[styles.innerContainer]}
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
              <ThemedText
                type="title"
                style={{ width: "80%", color: "#FFFFFF" }}
              >
                Lillie Louise Woermer House
              </ThemedText>
            </View>
          </ThemedView>

          <ThemedView style={styles.subContainer}>
            <View style={{ marginBottom: "5%",  marginTop: "2%" }}>
              <ScriptureCardBoard
                verse="Proverbs 29:25"
                version="NLT"
                content="Fearing people is a dangerous trap, but trusting the LORD means safety."
              />
            </View>

            <View style={{ marginTop: "1%" }}>
              <TaskCard tasks={tasks} />
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
    flexGrow: 1,
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
    // height: "60%",
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
    marginBottom: "5%",
    paddingTop: "5%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
