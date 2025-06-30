import React, { useState } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import type { ProgressType } from "@/redux/slices/taskSlice";
import { Task } from "@/redux/slices/taskSlice";
import { useSegments } from "expo-router";

interface TaskCardProps {
  tasks?: Task[];
  style?: ViewStyle;
  onPress?: (task: Task) => void;
}

export function TaskCard({ onPress, tasks }: TaskCardProps) {
  const bgColor = useThemeColor({}, "input");
  const segments = useSegments();
  const userType = segments[0];

  const PROGRESS_LABELS = {
    PENDING:
      userType === "(individuals)" || userType === "(residents)"
        ? "Pending Tasks"
        : "Pending Tasks",
    COMPLETED: "Completed Tasks",
    OVERDUE: "Overdue Tasks",
  };

  // Only call redux if props.tasks isn't given
  const { tasks: reduxTasks, loading, error } = useReduxTasks();
  const tasksToUse = tasks ?? reduxTasks;
  const showLoading = tasks ? false : loading;
  const showError = tasks ? null : error;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (showLoading) return <ThemedText>Loading tasks...</ThemedText>;
  if (showError) return <ThemedText>Error: {showError}</ThemedText>;

  const groupedTasks: Record<ProgressType, Task[]> = {
    PENDING: [],
    COMPLETED: [],
    OVERDUE: [],
  };

  tasksToUse.forEach((task) => {
    const progress = (task.progress ?? "PENDING").toUpperCase() as ProgressType;
    if (groupedTasks[progress]) groupedTasks[progress].push(task);
  });

  return (
    <>
      {(Object.keys(groupedTasks) as ProgressType[]).map((progress) => {
        const groupTasks = groupedTasks[progress];
        if (!groupTasks || groupTasks.length === 0) return null;

        const showViewAll = groupTasks.length > 4;
        const isExpanded = expanded[progress] || false;
        const displayedTasks = isExpanded ? groupTasks : groupTasks.slice(0, 4);

        return (
          <ThemedView style={styles.container} key={progress}>
            <ThemedView style={[styles.row, { marginBottom: 12 }]}>
              <ThemedText type="subtitle">
                {PROGRESS_LABELS[progress]}
              </ThemedText>
              {showViewAll && (
                <Pressable
                  onPress={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [progress]: !prev[progress],
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
                  onPress={() => onPress?.(task)}
                >
                  <ThemedText type="default">{task.name}</ThemedText>
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

const styles = StyleSheet.create({
  container: {
    minHeight: "10%",
    width: "100%",
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
