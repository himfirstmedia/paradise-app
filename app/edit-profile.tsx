import { ThemedDropdown, ThemedEmailInput, ThemedTextInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

export default function EditProfileScreen() {
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
            Edit Profile
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Name</ThemedText>
            <ThemedTextInput placeholder="Enter your full name" />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Email Address</ThemedText>
            <ThemedEmailInput placeholder="Enter your email address" />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Gender</ThemedText>
            <ThemedDropdown placeholder="Select your gender" />
          </ThemedView>

          <ThemedView style={styles.row}>
            <ThemedView style={{width: "45%"}}>
              <ThemedText type="default">City</ThemedText>
              <ThemedTextInput placeholder="Enter city" />
            </ThemedView>
            <ThemedView style={{width: "45%"}}>
              <ThemedText type="default">State</ThemedText>
              <ThemedTextInput placeholder="Enter state" />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Zip Code</ThemedText>
            <ThemedTextInput placeholder="Enter zip code" />
          </ThemedView>

          <ThemedView style={{ marginTop: "5%", width: "100%" }}>
            <Button
              type="default"
              title="Update Profile"
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
  },
  keyboardAvoid: {
    width: "100%",
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
