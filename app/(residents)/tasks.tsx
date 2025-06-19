import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TaskCard } from "@/components/TaskCard";
import { useRouter } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ThemedText";

const TASKS_DB = [
  {
    name: "Clearing the lawn",
    description: "Remove debris and tidy up the lawn area.",
  },
  {
    name: "Watering plants",
    description: "Ensure all plants are watered thoroughly.",
  },
  {
    name: "Trimming hedges",
    description: "Trim the hedges to maintain a neat appearance.",
  },
  {
    name: "Weeding flower beds",
    description: "Remove weeds from all flower beds.",
  },
];

export default function TabTwoScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const navigation = useRouter();

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
            flex: 1,
          }}
          style={styles.innerContainer}
        >
          <ThemedView
            style={[styles.headerCard, { backgroundColor: primaryColor }]}
          >
            <ThemedView style={[styles.row, { backgroundColor: primaryColor }]}>
              <View>
                <ThemedText
                  type="title"
                  style={{ width: "100%", color: "#FFFFFF" }}
                >
                  My Tasks
                </ThemedText>
              </View>

              <Avatar />
            </ThemedView>

            <ThemedView
              style={[styles.chartContainer, { backgroundColor: primaryColor }]}
            ></ThemedView>
            <ThemedView
              style={[styles.chartKey, { backgroundColor: primaryColor }]}
            >
              <View style={styles.row}></View>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.subContainer}>
            <TaskCard label="Pending Tasks" tasks={tasks} />
            <TaskCard label="Completed Tasks" tasks={tasks} />
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
  },
  headerCard: {
    height: "50%",
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartContainer: {
    borderWidth: 1,
    height: "60%",
    width: "100%",
    marginTop: "5%",
  },
  chartKey: {
    borderWidth: 1,
    height: "10%",
    width: "100%",
    marginTop: "5%",
  },
});
