import {
  ThemedDropdown,
  ThemedTextArea,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import api from "@/utils/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export default function AssignTaskScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;
  const params = useLocalSearchParams();
  const preselectedMember =
    typeof params.memberName === "string" ? params.memberName : "";
  const { members, reload: reloadMembers } = useReduxMembers();
  const { tasks, loading: tasksLoading, reload: reloadTasks } = useReduxTasks();
  const [selectedMember, setSelectedMember] =
    useState<string>(preselectedMember);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [instruction, setInstruction] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigation = useRouter();
  const { user } = useReduxAuth();

  const isFacilityManager = user?.role === "FACILITY_MANAGER";

  const visibleTasks = isFacilityManager
    ? tasks.filter((task) => task.progress === "PENDING")
    : tasks;

  const handleTaskAssignment = async () => {
    if (!selectedMember || !selectedTask) {
      Alert.alert("Missing Fields", "Please select a member and a task.");
      return;
    }
    setLoading(true);
    try {
      const member = members.find((m) => m.name === selectedMember);
      if (!member) throw new Error("Selected member not found.");

      

      const task = tasks.find((t) => t.name === selectedTask);
      if (!task) throw new Error("Selected task not found.");

      const payload = {
        userId: member.id,
        instruction,
      };

      await api.put(`/tasks/${task.id}`, payload);

      setSelectedTask("");
      setSelectedMember("");
      setInstruction("");

      reloadMembers();
      reloadTasks();

      navigation.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to assign task."
      );
    } finally {
      setLoading(false);
    }
  };

  const responsiveStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isLargeScreen ? 40 : 20,
    },
    containerPadding: {
      paddingHorizontal: isLargeScreen ? 150 : isMediumScreen ? 40 : 15,
    },
    scriptureSection: {
      marginBottom: isLargeScreen ? 15 : 20,
      marginTop: isLargeScreen ? 10 : 5,
      maxHeight: isLargeScreen ? 200 : 100,
    },
    taskSection: {
      marginTop: isLargeScreen ? 10 : 5,
    },
  });

  return (
    <ThemedView style={[styles.container, responsiveStyles.containerPadding]}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          width: "100%",
          paddingBottom: "20%",
        }}
        showsVerticalScrollIndicator={false}
        style={styles.innerContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ThemedText type="title" style={{ marginBottom: 30, marginTop: 15 }}>
            Assign Task
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Assigning To</ThemedText>
            <ThemedTextInput
              type="default"
              value={selectedMember}
              editable={false}
              placeholder="No member selected"
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Task</ThemedText>
            {tasksLoading ? (
              <ActivityIndicator size="small" color={primaryColor} />
            ) : (
              <>
                <ThemedDropdown
                  placeholder={
                    visibleTasks.length === 0
                      ? "No tasks available"
                      : "Select Task"
                  }
                  value={selectedTask}
                  onSelect={setSelectedTask}
                  items={visibleTasks.map((task) => task.name)}
                  multiSelect={false}
                  // disabled={visibleTasks.length === 0}
                />
              </>
            )}
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Special Instructions</ThemedText>
            <ThemedTextArea
              placeholder="Enter special instructions(optional)"
              value={instruction}
              onChangeText={setInstruction}
              height={200}
            />
          </ThemedView>

          <Button
            onPress={handleTaskAssignment}
            title="Assign"
            loading={loading}
          />
        </KeyboardAvoidingView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 8,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
  },
  inputField: {
    width: "100%",
  },
  keyboardAvoid: {
    flex: 1,
    width: "100%",
  },
});
