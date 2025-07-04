import {
  ThemedDatePicker,
  ThemedDropdown,
  ThemedTextArea,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

type CategoryOption = {
  label: string;
  value: "PRIMARY" | "MAINTENANCE" | "SPECIAL";
};

const CATEGORY_OPTIONS: Record<string, CategoryOption[]> = {
  DIRECTOR: [
    { label: "Primary Task", value: "PRIMARY" },
    { label: "Maintenance Task", value: "MAINTENANCE" },
    { label: "Special Task", value: "SPECIAL" },
  ],
  RESIDENT_MANAGER: [
    { label: "Primary Task", value: "PRIMARY" },
    { label: "Maintenance Task", value: "MAINTENANCE" },
  ],
  FACILITY_MANAGER: [{ label: "Maintenance Task", value: "MAINTENANCE" }],
};

export default function AddTaskScreen() {
  const errorColor = useThemeColor({}, "overdue");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [taskName, setTaskName] = useState("");
  const [taskCategory, setCategory] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { reload } = useReduxTasks();

  const { user } = useReduxAuth();

  const categoryOptions: CategoryOption[] =
    CATEGORY_OPTIONS[user?.role as keyof typeof CATEGORY_OPTIONS] || [];

  const navigation = useRouter();

  const handleTaskCreation = async () => {
    const newErrors: Record<string, string> = {};

    if (!taskName) newErrors.taskName = "Task name is required.";
    if (!startDate) newErrors.startDate = "Start date is required.";
    if (!endDate) newErrors.endDate = "End date is required.";
    if (!description) newErrors.description = "Description is required.";
    if (!taskCategory) newErrors.category = "Category is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/tasks", {
        name: taskName,
        category: taskCategory,
        startDate,
        endDate,
        description,
        progress: "PENDING",
        status: "PENDING"
      });
      Alert.alert("Success", "Task created successfully!");
      setTaskName("");
      setStartDate(undefined);
      setEndDate(undefined);
      setDescription("");
      setErrors({});
      await reload();
      navigation.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create task."
      );
    } finally {
      setLoading(false);
    }
  };

  const Dot = () => {
  return (
    <ThemedText style={{ color: errorColor }}>*</ThemedText>
  );
};

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="title" style={{ marginBottom: "10%" }}>
            Add New Task
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Task Name <Dot /></ThemedText>
            <ThemedTextInput
              placeholder="Enter task name"
              value={taskName}
              onChangeText={(text) => {
                setTaskName(text);
                if (errors.taskName) setErrors((e) => ({ ...e, taskName: "" }));
              }}
              errorMessage={errors.taskName}
            />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Task Category <Dot /></ThemedText>
            <ThemedDropdown
              placeholder="Select Task Category"
              items={categoryOptions.map((opt) => opt.label)}
              value={
                categoryOptions.find((opt) => opt.value === taskCategory)
                  ?.label || ""
              }
              onSelect={(label) => {
                const selected = categoryOptions.find(
                  (opt) => opt.label === label
                );
                setCategory(selected?.value || "");
                if (errors.category) setErrors((e) => ({ ...e, category: "" }));
              }}
              errorMessage={errors.category}
            />
          </ThemedView>

          <View style={styles.row}>
            <View style={{ width: "48%" }}>
              <ThemedView style={styles.inputField}>
                <ThemedText type="default">Start Date <Dot /></ThemedText>
                <ThemedDatePicker
                  value={startDate}
                  onChangeText={(date) => {
                    setStartDate(date);
                    if (errors.startDate)
                      setErrors((e) => ({ ...e, startDate: "" }));
                  }}
                  errorMessage={errors.startDate}
                />
              </ThemedView>
            </View>

            <View style={{ width: "48%" }}>
              <ThemedView style={styles.inputField}>
                <ThemedText type="default">End Date <Dot /></ThemedText>
                <ThemedDatePicker
                  value={endDate}
                  onChangeText={(date) => {
                    setEndDate(date);
                    if (errors.endDate)
                      setErrors((e) => ({ ...e, endDate: "" }));
                  }}
                  errorMessage={errors.endDate}
                />
              </ThemedView>
            </View>
          </View>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Description <Dot /></ThemedText>
            <ThemedTextArea
              placeholder="Enter task description"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description)
                  setErrors((e) => ({ ...e, description: "" }));
              }}
              errorMessage={errors.description}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: "100%",
    paddingVertical: "5%",
    paddingHorizontal: 15,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
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
