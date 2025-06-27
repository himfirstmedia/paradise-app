import { TaskCard } from "@/components/TaskCard";
import { ThemedView } from "@/components/ThemedView";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function TaskManagerScreen() {
  const bgColor = useThemeColor({}, "background");
  const { tasks, loading, reload } = useReduxTasks();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    
      <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <ScrollView
            contentContainerStyle={{
              alignItems: "flex-start",
              width: "100%",
              paddingBottom: "30%",
            }}
            style={styles.innerContainer}
          >
            <TaskCard tasks={tasks} />
          </ScrollView>
        )}
      </ThemedView>
   
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
  },
});