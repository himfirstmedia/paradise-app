import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSegments } from "expo-router";

export type ProgressType = "PENDING" | "COMPLETED" | "OVERDUE";

type Task = {
  name: string;
  description: string;
  progress: ProgressType;
  onPress: () => void;
};

interface TaskCardProps {
  tasks: Task[];
}

function useDynamicProgressLabels(): Record<ProgressType, string> {
  const segments = useSegments(); // returns an array like ['(individuals)', 'home']

  const userType = segments[0]; // Get the first segment

  let pendingLabel = "Today's Pending Tasks";

  if (
    userType === "(resident-manager)" ||
    userType === "(facility-manager)" ||
    userType === "(director)"
  ) {
    pendingLabel = "Today's Tasks";
  } else if (userType === "(individuals)" || userType === "(residents)") {
    pendingLabel = "My Tasks";
  }

  return {
    PENDING: pendingLabel,
    COMPLETED: "Completed Tasks",
    OVERDUE: "Overdue Tasks",
  };
}

export function TaskCard({ tasks }: TaskCardProps) {
  const bgColor = useThemeColor({}, "input");
  // Use dynamic progress labels
  const PROGRESS_LABELS = useDynamicProgressLabels();
  // Track expanded state per category
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Use dynamic progress labels
  // Group tasks by progress
  const groupedTasks: Record<ProgressType, Task[]> = {
    PENDING: [],
    COMPLETED: [],
    OVERDUE: [],
  };
  tasks.forEach((task) => {
    if (!groupedTasks[task.progress]) groupedTasks[task.progress] = [];
    groupedTasks[task.progress].push(task);
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
            <ThemedView style={[styles.row, { marginBottom: "5%" }]}>
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
              {displayedTasks.map((task, idx) => (
                <Pressable
                  key={idx}
                  style={[
                    styles.row,
                    styles.button,
                    { backgroundColor: bgColor },
                  ]}
                  onPress={task.onPress}
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
    minHeight: "20%",
    width: "100%",
    marginBottom: 15,
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
