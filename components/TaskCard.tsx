import React, { useState } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSegments } from "expo-router";
import type { Task, ProgressType } from "@/redux/slices/taskSlice";

interface TaskCardProps {
  tasks: Task[];
  style?: ViewStyle;
  onPress?: (task: Task) => void;
}

function useDynamicProgressLabels(): Record<ProgressType, string> {
  const segments = useSegments();
  const userType = segments[0];

  let pendingLabel = "Pending Tasks";
  if (
    userType === "(resident-manager)" ||
    userType === "(facility-manager)" ||
    userType === "(director)"
  ) {
    pendingLabel = "Pending Tasks";
  } else if (userType === "(individuals)" || userType === "(residents)") {
    pendingLabel = "My Tasks";
  }

  return {
    PENDING: pendingLabel,
    COMPLETED: "Completed Tasks",
    OVERDUE: "Overdue Tasks",
  };
}

export function TaskCard({ tasks, onPress }: TaskCardProps) {
  const bgColor = useThemeColor({}, "input");
  const PROGRESS_LABELS = useDynamicProgressLabels();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Group tasks by progress, casting progress to ProgressType
  const groupedTasks: Record<ProgressType, Task[]> = {
    PENDING: [],
    COMPLETED: [],
    OVERDUE: [],
  };
  tasks.forEach((task) => {
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
        const displayedTasks =
          showViewAll && !isExpanded ? groupTasks.slice(0, 4) : groupTasks;

        return (
          <ThemedView style={styles.container} key={progress}>
            <ThemedView style={[styles.row, { marginBottom: "3%" }]}>
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