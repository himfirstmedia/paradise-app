import { ThemedDropdown, ThemedTextArea } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import api from "@/utils/api";
import { useReduxAuth } from "@/hooks/useReduxAuth"; // Add this import
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";

export default function CommentsScreen() {
  const [type, setType] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmit] = useState<boolean>(false);

  // Get current user from Redux
  const { user } = useReduxAuth();
  const userId = user?.id || null;

  // Get tasks
  const { tasks } = useReduxTasks();
  
  // Filter tasks for current user
  const currentUserTasks = tasks.filter(task => 
    task.userId === userId
  );
  
  const taskOptions = currentUserTasks.map((task) => ({
    label: task.name,
    value: task.id,
  }));

  const typeOptions = ["Comment", "Suggestion"];
  const navigation = useRouter();

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    setSubmit(true);

    const payload = {
      message,
      userId,
      type,
      ...(type === "Comment" && selectedTaskId && { taskId: selectedTaskId })
    };

    try {
      await api.post("/feedback", payload);
      Alert.alert("Success", "Feedback submitted successfully!");
      setType("");
      setSelectedTaskId(null);
      setMessage("");
      navigation.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to submit feedback."
      );
    } finally {
      setSubmit(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.innerContainer}
      >
        <ThemedText type="default" style={styles.introText}>
          We value your feedback! Please share your comments or suggestions.
        </ThemedText>

        <ThemedDropdown
          placeholder="Select feedback"
          items={typeOptions}
          value={type}
          onSelect={setType}
        />

        {type === "Comment" && (
          <ThemedDropdown
            placeholder="Select related task"
            items={taskOptions.map(t => t.label)}
            value={taskOptions.find(t => t.value === selectedTaskId)?.label || ""}
            onSelect={(label) => {
              const task = taskOptions.find(t => t.label === label);
              setSelectedTaskId(task?.value || null);
            }}
          />
        )}

        <ThemedTextArea
          placeholder={type === "Suggestion" 
            ? "Enter your suggestion" 
            : "Enter your comment"}
          value={message}
          onChangeText={setMessage}
        />

        <Button
          title="Submit"
          onPress={handleSubmit}
          loading={submitting}
          disabled={
            !type ||
            (type === "Comment" && !selectedTaskId) ||
            !message ||
            !userId
          }
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    width: "100%",
    paddingBottom: 100, // Fixed value instead of percentage
  },
  introText: {
    marginBottom: 20,
    textAlign: "center",
  }
});