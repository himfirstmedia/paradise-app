import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedPassword } from "@/components/ThemedPassword";
import { Button } from "@/components/ui/Button";

export default function SignUpScreen() {
  const handlePasswordChange = (): void => {
    console.log("Updating Password.....");
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ThemedText type="title" style={{ marginBottom: 20 }}>
            Create New Password
          </ThemedText>

          <ThemedView style={styles.innerContainer}>
            <View style={styles.inputField}>
              <ThemedText type="default">New Password</ThemedText>
              <ThemedPassword placeholder="Enter new password" />
            </View>

            <View style={styles.inputField}>
              <ThemedText type="default">Confirm Password</ThemedText>
              <ThemedPassword placeholder="Confirm new password" />
            </View>

            <View style={{ marginTop: 20 }}>
              <Button
                type="default"
                title="Create Password"
                onPress={handlePasswordChange}
              />
            </View>
          </ThemedView>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 15,
  },
  innerContainer: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 10,
  },
  inputField: {
    width: "100%",
  },
  keyboardAvoid: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
});
