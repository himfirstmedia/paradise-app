import { ThemedDropdown, ThemedTextArea } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import api from "@/utils/api";
import { UserSessionUtils } from "@/utils/UserSessionUtils";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";

export default function CommentsScreen() {
  const [type, setType] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmit] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);

  const { tasks } = useReduxTasks({ onlyCurrentUser: true });
  const taskOptions = tasks.map((task) => ({
    label: task.name,
    value: task.id,
  }));

  const typeOptions = ["Comment", "Suggestion"];
  const navigation = useRouter();

  // Get userId on mount
  useEffect(() => {
    (async () => {
      const user = await UserSessionUtils.getUserDetails();
      if (user && user.id) setUserId(Number(user.id));
    })();
  }, []);

  const handleSubmit = async () => {
    setSubmit(true);

    const payload: any = {
      message,
      userId,
      type,
    };
    if (type === "Comment" && selectedTaskId) {
      payload.taskId = selectedTaskId;
    }

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
        contentContainerStyle={{
          alignItems: "center",
          width: "100%",
          paddingBottom: "30%",
        }}
        showsVerticalScrollIndicator={false}
        style={styles.innerContainer}
      >
        <ThemedText type="default" style={{ marginBottom: "5%" }}>
          We value your feedback! Please share your comments or suggestions.
        </ThemedText>

        {/* Dropdown for type */}
        <ThemedDropdown
          placeholder="Select feedback"
          items={typeOptions}
          value={type}
          onSelect={setType}
        />

        {/* Dropdown for tasks, only if type is Comment */}
        {type === "Comment" && (
          <ThemedDropdown
            placeholder="Select related task"
            items={taskOptions.map((t) => t.label)}
            value={
              taskOptions.find((t) => t.value === selectedTaskId)?.label || ""
            }
            onSelect={(label) => {
              const found = taskOptions.find((t) => t.label === label);
              setSelectedTaskId(found ? found.value : null);
            }}
          />
        )}

        {/* Text area for message */}
        <ThemedTextArea
          placeholder={
            type === "Suggestion"
              ? "Enter your suggestion"
              : "Enter your comment"
          }
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
});