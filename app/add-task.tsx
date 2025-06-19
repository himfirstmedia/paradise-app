import {
  ThemedDatePicker,
  ThemedTextArea,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

export default function AddTaskScreen() {
  const handlePasswordChange = (): void => {};

  return (
    <>
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
            <ThemedTextInput placeholder="Enter task name" />
          </ThemedView>
          <View style={styles.row}>
            <View style={{ width: "48%" }}>
              <ThemedView style={styles.inputField}>
                <ThemedText type="default">Start Date</ThemedText>
                <ThemedDatePicker />
              </ThemedView>
            </View>

            <View style={{ width: "48%" }}>
              <ThemedView style={styles.inputField}>
                <ThemedText type="default">End Date</ThemedText>
                <ThemedDatePicker />
              </ThemedView>
            </View>
          </View>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Description</ThemedText>
            <ThemedTextArea placeholder="Enter task description" />
          </ThemedView>

          <ThemedView style={{ marginTop: "5%", width: "100%" }}>
            <Button
              type="default"
              title="Add Task"
              onPress={handlePasswordChange}
            />
          </ThemedView>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
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
