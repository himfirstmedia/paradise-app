import { ThemedPassword } from "@/components/ThemedPassword";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

export default function ChangePasswordScreen() {
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
            Change Password
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Current Password</ThemedText>
            <ThemedPassword placeholder="Enter your current password" />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">New Password</ThemedText>
            <ThemedPassword placeholder="Enter our new password" />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">ConfirmPassword</ThemedText>
            <ThemedPassword placeholder="Confirm your new password" />
          </ThemedView>

          <ThemedView style={{ marginTop: "5%", width: "100%" }}>
            <Button
              type="default"
              title="Update Password"
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
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  inputField: {
    width: "100%",
  },
  keyboardAvoid: {
    width: "100%",
    flexGrow: 1,
  },
});
