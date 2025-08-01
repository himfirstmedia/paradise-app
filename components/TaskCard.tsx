import React, { useState } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import type { Task } from "@/redux/slices/taskSlice";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRouter, useSegments } from "expo-router";

interface TaskCardProps {
  tasks?: Task[];
  style?: ViewStyle;
  onPress?: (task: Task) => void;
}

type TaskCategory = "MAINTENANCE" | "HOUSEHOLD" | "SUPPORT" | "REVIEW";
type TaskStatus = "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED";

export function TaskCard({ onPress, tasks }: TaskCardProps) {
  const router = useRouter();
  const bgColor = useThemeColor({}, "input");
  // const segments = useSegments();
  // const userType = segments[0];

  const CATEGORY_LABELS = {
    MAINTENANCE: "Maintenance Tasks",
    HOUSEHOLD: "Household Tasks",
    SUPPORT: "Support Tasks",
    REVIEW: "Tasks Under Review",
  };

  const { tasks: reduxTasks, loading, error } = useReduxTasks();
  const tasksToUse = tasks ?? reduxTasks;
  const showLoading = tasks ? false : loading;
  const showError = tasks ? null : error;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (showLoading) return <ThemedText>Loading tasks...</ThemedText>;
  if (showError) return <ThemedText>Error: {showError}</ThemedText>;

  // Group tasks by category and review status
  const groupedTasks: Record<TaskCategory, Task[]> = {
    MAINTENANCE: [],
    HOUSEHOLD: [],
    SUPPORT: [],
    REVIEW: [],
  };

  tasksToUse.forEach((task) => {
    const category =
      (task.category?.toUpperCase() as TaskCategory) || "SUPPORT";
    const status = (task.status?.toUpperCase() as TaskStatus) || "PENDING";

    if (status === "REVIEWING") {
      groupedTasks.REVIEW.push(task);
    } else if (groupedTasks[category]) {
      groupedTasks[category].push(task);
    }
  });

  return (
    <>
      {(Object.keys(groupedTasks) as TaskCategory[]).map((category) => {
        const groupTasks = groupedTasks[category];
        if (!groupTasks || groupTasks.length === 0) return null;

        const showViewAll = groupTasks.length > 4;
        const isExpanded = expanded[category] || false;
        const displayedTasks = isExpanded ? groupTasks : groupTasks.slice(0, 4);

        return (
          <ThemedView style={styles.container} key={category}>
            <ThemedView style={[styles.row, { marginBottom: 12 }]}>
              <ThemedText type="subtitle">
                {CATEGORY_LABELS[category]}
              </ThemedText>
              {showViewAll && (
                <Pressable
                  onPress={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [category]: !prev[category],
                    }))
                  }
                >
                  <ThemedText type="default">
                    {isExpanded ? "View Less" : "View All"}
                  </ThemedText>
                </Pressable>
              )}
            </ThemedView>
            <ThemedView style={styles.taskButtons}>
              {displayedTasks.map((task) => (
                <Pressable
                  key={task.id}
                  style={[
                    styles.row,
                    styles.button,
                    { backgroundColor: bgColor },
                  ]}
                  onPress={() => {
                    router.push({
                      pathname: "/task-detail",
                      params: { id: task.id },
                    });
                    onPress?.(task);
                  }}
                >
                  <ThemedText type="default" numberOfLines={1}>
                    {task.name.length > 30
                      ? `${task.name.slice(0, 30)}...`
                      : task.name}
                  </ThemedText>
                  <Image
                    source={require("../assets/icons/chevron-right.png")}
                    style={{ height: 20, width: 20 }}
                  />
                </Pressable>
              ))}
            </ThemedView>
          </ThemedView>
        );
      })}
    </>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    minHeight: "10%",
    width: "100%",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskButtons: {
    gap: 8,
  },
  button: {
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
});
