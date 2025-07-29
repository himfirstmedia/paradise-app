import {
  ThemedCheckbox,
  ThemedDatePicker,
  ThemedDropdown,
  ThemedTextArea,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxChores } from "@/hooks/useReduxChores";
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
  useWindowDimensions,
  View,
} from "react-native";

type CategoryOption = {
  label: string;
  value: "HOUSEHOLD" | "MAINTENANCE" | "SUPPORT";
};

const CATEGORY_OPTIONS: Record<string, CategoryOption[]> = {
  // DIRECTOR: [
  //   { label: "Maintenance", value: "MAINTENANCE" },
  //   { label: "Household", value: "HOUSEHOLD" },
  //   { label: "Support", value: "SUPPORT" },
  // ],
  // RESIDENT_MANAGER: [
  //   { label: "Maintenance", value: "MAINTENANCE" },
  //   { label: "Household", value: "HOUSEHOLD" },
  //   { label: "Support", value: "SUPPORT" },
  // ],
  FACILITY_MANAGER: [
    { label: "Household", value: "HOUSEHOLD" },
    { label: "Maintenance", value: "MAINTENANCE" },
    { label: "Support", value: "SUPPORT" },
  ],
};

export default function AddTaskScreen() {
  const errorColor = useThemeColor({}, "overdue");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [taskName, setTaskName] = useState("");
  const [taskCategory, setCategory] = useState("");
  const [taskChore, setChore] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [primary, setPrimary] = useState(false);
  const { reload: taskReload } = useReduxTasks();

  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const { user } = useReduxAuth();
  const { chores, reload: choreReload } = useReduxChores();

  const categoryOptions: CategoryOption[] =
    CATEGORY_OPTIONS[user?.role as keyof typeof CATEGORY_OPTIONS] || [];

  const primaryChoreOptions = chores
    .filter((chore) => chore.houseId === user?.houseId)
    .map((chore) => ({
      label: chore.name,
      value: chore.id.toString(),
    }));


  const navigation = useRouter();

  const handleTaskCreation = async () => {
    const newErrors: Record<string, string> = {};

    if (!taskName) newErrors.taskName = "Task name is required.";
    if (!startDate) newErrors.startDate = "Start date is required.";
    if (!endDate) newErrors.endDate = "End date is required.";
    if (!description) newErrors.description = "Description is required.";
    if (!taskCategory) newErrors.category = "Category is required.";
    if (primary && !taskChore) {
      newErrors.chore = "Primary chore is required.";
    }

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
        choreId: taskChore,
        startDate,
        endDate,
        description,
        progress: "PENDING",
        status: "PENDING",
      });
      Alert.alert("Success", "Task created successfully!");
      setTaskName("");
      setStartDate(undefined);
      setEndDate(undefined);
      setDescription("");
      setChore("");
      setErrors({});
      await taskReload();
      await choreReload();
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
    return <ThemedText style={{ color: errorColor }}>*</ThemedText>;
  };

  const responsiveStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isLargeScreen ? 40 : 20,
    },
    containerPadding: {
      paddingHorizontal: isLargeScreen ? 150 : isMediumScreen ? 40 : 5,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.keyboardAvoid, {flex: 1}]}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS === "web" && { minHeight: "100%" },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="title" style={{ marginBottom: 15 }}>
            Add New Task
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">
              Task Name <Dot />
            </ThemedText>
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
            <ThemedText type="default">
              Task Category <Dot />
            </ThemedText>
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
                <ThemedText type="default">
                  Start Date <Dot />
                </ThemedText>
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
                <ThemedText type="default">
                  End Date <Dot />
                </ThemedText>
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
            <ThemedText type="default">
              Description <Dot />
            </ThemedText>
            <ThemedTextArea
              placeholder="Enter task description"
              height={200}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description)
                  setErrors((e) => ({ ...e, description: "" }));
              }}
              errorMessage={errors.description}
            />
          </ThemedView>

          <ThemedView style={[styles.inputField, { marginBottom: 15 }]}>
            <ThemedCheckbox
              label="Select if task is under a Primary Chore."
              checked={primary}
              onChange={setPrimary}
            />
          </ThemedView>

          {primary && (
            <ThemedView style={styles.inputField}>
              <ThemedText type="default">
                Primary Chore <Dot />
              </ThemedText>
              <ThemedDropdown
                placeholder="Select Primary Chore"
                items={primaryChoreOptions.map((opt) => opt.label)}
                value={
                  primaryChoreOptions.find((opt) => opt.value === taskChore)
                    ?.label || ""
                }
                onSelect={(label) => {
                  const selected = primaryChoreOptions.find(
                    (opt) => opt.label === label
                  );
                  setChore(selected?.value || "");
                  if (errors.category)
                    setErrors((e) => ({ ...e, category: "" }));
                }}
                errorMessage={errors.category}
                multiSelect={false}
                numColumns={1}
              />
            </ThemedView>
          )}

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
    width: "100%",
    paddingVertical: "5%",
    paddingHorizontal: 15,
    ...(Platform.OS === "web" && { overflow: "scroll" }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
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
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
