/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { HalfDonutChart } from "@/components/HalfDonutChart";
import { TaskCard } from "@/components/TaskCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/ui/Avatar";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";

export default function TabTwoScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const completedColor = useThemeColor({}, "completed");
  const pendingColor = useThemeColor({}, "pending");
  const overdueColor = useThemeColor({}, "overdue");
  const navigation = useRouter();
  const { tasks, loading: tasksLoading } = useReduxTasks({ onlyCurrentUser: true });

  let pending = 0,
    completed = 0,
    overdue = 0,
    totalTasks = 0;
  tasks.forEach((task) => {
    totalTasks++;
    if (task.progress === "PENDING") pending++;
    else if (task.progress === "COMPLETED") completed++;
    else if (task.progress === "OVERDUE") overdue++;
  });

  const completionPercent =
    totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

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
              style={[
                styles.chartContainer,
                { backgroundColor: "transparent" },
              ]}
            >
              <HalfDonutChart
                data={[
                  {
                    value: completed,
                    color: completedColor,
                    text: "Completed",
                  },
                  { value: pending, color: pendingColor, text: "Pending" },
                  { value: overdue, color: overdueColor, text: "Overdue" },
                ]}
                height={220}
                radius={90}
                innerRadius={60}
                showGradient={false}
                strokeColor={primaryColor}
                strokeWidth={5}
                legendTitle="Tasks Progress"
                centerLabelComponent={() => (
                  <View>
                    <ThemedText
                      type="title"
                      style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#FFFFFF",
                      }}
                    >
                      {totalTasks === 0 ? "0%" : `${completionPercent}%`}
                    </ThemedText>
                  </View>
                )}
                legendContainerStyle={{ marginTop: 10 }}
                legendTitleStyle={{ color: "#fff", fontSize: 22 }}
                legendTextStyle={{ color: "#fff", fontSize: 14 }}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.subContainer}>
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
    height: 280,
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    paddingTop: 20,
    paddingBottom: 20
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartContainer: {
    height: "80%",
    width: "100%",
  },
  chartKey: {
    borderWidth: 1,
    height: "10%",
    width: "100%",
    marginTop: "5%",
  },
});
