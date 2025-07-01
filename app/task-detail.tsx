import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import api from "@/utils/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

export default function TaskDetailScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, reload, loading } = useReduxTasks();

  const task = tasks.find((t) => t.id.toString() === id);

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this Task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/tasks/${id}`);
            await reload();
            Alert.alert("Deleted", "Task deleted successfully.");
            router.back();
          } catch (error: any) {
            Alert.alert(
              "Error",
              error?.response?.data?.message || "Failed to delete task."
            );
          }
        },
      },
    ]);
  };

  if (loading || !task) {
    return (
      <ThemedView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText>Loading Task...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ width: "100%", paddingBottom: "30%" }}
        style={styles.innerContainer}
      >
        <ThemedText type="title" style={{ marginBottom: "4%" }}>
          {task.name}
        </ThemedText>

        <ThemedView style={styles.column}>
          <ThemedText type="subtitle">Task Description</ThemedText>
          <ThemedText type="default">{task.description}</ThemedText>
        </ThemedView>

        {task.instruction?.trim() !== "" && (
          <ThemedView style={styles.column}>
            <ThemedText type="subtitle">Special Instruction</ThemedText>
            <ThemedText type="default">{task.instruction}</ThemedText>
          </ThemedView>
        )}
      </ScrollView>

      <Pressable
        style={[styles.taskCTAbtn, { backgroundColor: primaryColor }]}
        onPress={handleDelete}
      >
        <Image
          source={require("@/assets/icons/delete.png")}
          style={styles.icon}
        />
      </Pressable>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 16,
  },
  innerContainer: {
    flexGrow: 1,
    width: "100%",
    padding: 24,
  },
  column: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 20
  },
  taskCTAbtn: {
    height: 60,
    width: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: "5%",
    right: "5%",
  },
  icon: {
    height: 35,
    width: 35,
    tintColor: "#FFFFFF",
  },
});