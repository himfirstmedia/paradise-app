import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import api from "@/utils/api"; // <-- Make sure this import is present
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Image, Pressable, ScrollView, StyleSheet } from "react-native";

export default function TaskDetailScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const navigation = useRouter();
  const params = useLocalSearchParams();
  const name = params.name as string;
  const description = params.description as string;
  const instruction = params.instruction as string;
  const id = params.id as string; // <-- Make sure you pass id in params when navigating
  const { reload } = useReduxTasks();

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
            navigation.back();
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          width: "100%",
          paddingBottom: "30%",
        }}
        style={[styles.innerContainer]}
      >
        <ThemedText type="title" style={{ marginBottom: "4%" }}>
          {name}
        </ThemedText>

        <ThemedView style={styles.column}>
          <ThemedText type="subtitle">Task Description</ThemedText>
          <ThemedText type="default">{description}</ThemedText>
        </ThemedView>

        {instruction && instruction.trim() !== "" && (
          <ThemedView style={styles.column}>
            <ThemedText type="subtitle">Special Instruction</ThemedText>
            <ThemedText type="default">{instruction}</ThemedText>
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