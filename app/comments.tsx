import { ThemedDropdown, ThemedTextArea } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxTasks } from "@/hooks/useReduxChores";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export default function CommentsScreen() {
  const [type, setType] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmit] = useState<boolean>(false);
  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const { user } = useReduxAuth();
  const userId = user?.id || null;

  const { tasks } = useReduxTasks();

  const currentUserTasks = tasks.filter((task) => task.userId === userId);

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
      ...(type === "Comment" && selectedTaskId && { taskId: selectedTaskId }),
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
            items={taskOptions.map((t) => t.label)}
            value={
              taskOptions.find((t) => t.value === selectedTaskId)?.label || ""
            }
            onSelect={(label) => {
              const task = taskOptions.find((t) => t.label === label);
              setSelectedTaskId(task?.value || null);
            }}
          />
        )}

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
            !message || !userId || (type === "Comment" && !selectedTaskId)
          }
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    width: "100%",
    paddingBottom: 120,
  },
  introText: {
    marginBottom: 20,
    textAlign: "center",
  },
});
