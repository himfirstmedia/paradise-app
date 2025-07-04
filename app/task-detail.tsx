import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxAuth } from "@/hooks/useReduxAuth";
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
  View,
} from "react-native";

const TASK_STATUS = {
  PENDING: "PENDING",
  REVIEWING: "REVIEWING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export default function TaskDetailScreen() {
  const bgColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "selection");
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, reload, loading } = useReduxTasks();
  const task = tasks.find((t) => t.id.toString() === id);

  const { user } = useReduxAuth();
  const role = user?.role;

  const canDeleteTask = task && role !== "RESIDENT" && role !== "INDIVIDUAL";

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

  const handleComplete = async () => {
    Alert.alert(
      "Completed Task",
      "Please ensure the task has been completed as per instructions given.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await api.put(`/tasks/${id}`, { status: TASK_STATUS.REVIEWING });
              await reload();
              Alert.alert(
                "Task Submitted",
                "Task marked as completed and is under review."
              );
              router.back();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.response?.data?.message ||
                  "Failed to update task status."
              );
            }
          },
        },
      ]
    );
  };

  const handleApprove = async () => {
    Alert.alert("Approve Task", "Are you sure you want to approve this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          try {
            await api.put(`/tasks/${id}`, {
              status: "APPROVED",
              progress: "COMPLETED",
            });
            await reload();
            Alert.alert("Success", "Task has been approved.");
            router.back();
          } catch (error: any) {
            Alert.alert(
              "Error",
              error?.response?.data?.message || "Failed to approve task."
            );
          }
        },
      },
    ]);
  };

  const handleReject = async () => {
    Alert.alert(
      "Reject Task",
      "Are you sure you want to reject this task? The assignee will be asked to fix it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              await api.put(`/tasks/${id}`, {
                status: TASK_STATUS.PENDING,
                progress: "PENDING",
              });
              await reload();
              Alert.alert(
                "Task Rejected",
                "Task has been sent back for corrections."
              );
              router.back();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.response?.data?.message || "Failed to reject task."
              );
            }
          },
        },
      ]
    );
  };

  if (loading || !task) {
    return (
      <ThemedView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText>Loading Task...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ width: "100%", paddingBottom: "30%" }}
        style={[styles.innerContainer, { backgroundColor: bgColor }]}
      >
        <ThemedText type="title" style={{ marginBottom: "4%" }}>
          {task.name}
        </ThemedText>

        {typeof task.description === "string" &&
          task.description.trim().toLowerCase() !== "null" &&
          task.description.trim().toLowerCase() !== "undefined" &&
          task.description.trim() !== "" && (
            <ThemedView style={styles.column}>
              <ThemedText type="subtitle">Task Description</ThemedText>
              <ThemedText type="default">{task.description}</ThemedText>
            </ThemedView>
          )}

        {typeof task.instruction === "string" &&
          task.instruction.trim().toLowerCase() !== "null" &&
          task.instruction.trim().toLowerCase() !== "undefined" &&
          task.instruction.trim() !== "" && (
            <ThemedView style={styles.column}>
              <ThemedText type="subtitle">Special Instruction</ThemedText>
              <ThemedText type="default">{task.instruction}</ThemedText>
            </ThemedView>
          )}
      </ScrollView>

      <ThemedView style={styles.taskCTAContainer}>
        {task?.status === TASK_STATUS.PENDING &&
          (role === "FACILITY_MANAGER" ||
            role === "RESIDENT_MANAGER" ||
            role === "RESIDENT" ||
            role === "INDIVIDUAL") && (
            <View style={styles.ctaButtonWrapper}>
              <Button
                type="default"
                title="Completed Task"
                onPress={handleComplete}
              />
            </View>
          )}

        {task?.status === TASK_STATUS.REVIEWING &&
          (role === "DIRECTOR" ||
            role === "RESIDENT_MANAGER" ||
            (role === "FACILITY_MANAGER" &&
              task.category === "MAINTENANCE")) && (
            <View style={styles.ctaRowCentered}>
              <View style={{ flex: 1 }}>
                <Button
                  type="default"
                  title="Reject Task"
                  onPress={handleReject}
                />
              </View>
              <View style={styles.ctaButtonWrapper}>
                <Button
                  type="default"
                  title="Approve Task"
                  onPress={handleApprove}
                />
              </View>
            </View>
          )}

        {canDeleteTask && (
          <Pressable
            style={[styles.deleteBtn, { backgroundColor: primaryColor }]}
            onPress={handleDelete}
          >
            <Image
              source={require("@/assets/icons/delete.png")}
              style={styles.icon}
            />
          </Pressable>
        )}
      </ThemedView>
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
    marginBottom: 20,
  },
  taskCTAbtn: {
    height: 60,
    width: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    height: 35,
    width: 35,
    tintColor: "#FFFFFF",
  },
  taskCTAContainer: {
    width: "100%",
    flexDirection: "column", // vertical stacking for mobile UX
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  ctaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  ctaButtonWrapper: {
    flex: 1,
  },
  deleteBtn: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaRowCentered: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 50,
    marginBottom: 5,
  },
  ctaButtonFlex: {
    flex: 1,
    alignItems: "center",
  },
  approveBtn: {
    width: "90%",
  },
  iconBtn: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
