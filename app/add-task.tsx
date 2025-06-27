import {
  ThemedDatePicker,
  ThemedTextArea,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

export default function AddTaskScreen() {
  const [taskName, setTaskName] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const {reload} = useReduxTasks();

  const navigation = useRouter();

  const handleTaskCreation = async () => {
    setLoading(true);
    try {
      await api.post("/tasks", {
        name: taskName,
        startDate,
        endDate,
        description,
        progress: "PENDING", 
      });
      Alert.alert("Success", "Task created successfully!");
      setTaskName("");
      setStartDate(undefined);
      setEndDate(undefined);
      setDescription("");
      await reload();
      navigation.back();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ThemedText type="title" style={{ marginBottom: "10%" }}>
          Add New Task
        </ThemedText>

        <ThemedView style={styles.inputField}>
          <ThemedText type="default">Task Name</ThemedText>
          <ThemedTextInput
            placeholder="Enter task name"
            value={taskName}
            onChangeText={setTaskName}
          />
        </ThemedView>
        <View style={styles.row}>
          <View style={{ width: "48%" }}>
            <ThemedView style={styles.inputField}>
              <ThemedText type="default">Start Date</ThemedText>
              <ThemedDatePicker
                value={startDate}
                onChangeText={setStartDate}
              />
            </ThemedView>
          </View>

          <View style={{ width: "48%" }}>
            <ThemedView style={styles.inputField}>
              <ThemedText type="default">End Date</ThemedText>
              <ThemedDatePicker
                value={endDate}
                onChangeText={setEndDate}
              />
            </ThemedView>
          </View>
        </View>
        <ThemedView style={styles.inputField}>
          <ThemedText type="default">Description</ThemedText>
          <ThemedTextArea
            placeholder="Enter task description"
            value={description}
            onChangeText={setDescription}
          />
        </ThemedView>

        <ThemedView style={{ marginTop: "5%", width: "100%" }}>
          <Button
            type="default"
            title="Add Task"
            onPress={handleTaskCreation}
            loading={loading}
          />
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: "5%",
    paddingHorizontal: 15,
  },
  inputField: {
    width: "100%",
    gap: 2,
  },
  keyboardAvoid: {
    width: "100%",
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});