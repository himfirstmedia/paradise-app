import React, { useState } from "react";
import { ThemedPassword } from "@/components/ThemedPassword";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import { UserSessionUtils } from "@/utils/UserSessionUtils";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState<
    string | null
  >(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const navigation = useRouter();

  const validate = () => {
    let valid = true;
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);

    if (!currentPassword) {
      setCurrentPasswordError("Current password is required.");
      valid = false;
    }
    if (!newPassword) {
      setNewPasswordError("New password is required.");
      valid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError("Password must be at least 6 characters.");
      valid = false;
    }
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    }
    return valid;
  };

  const handlePasswordChange = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await UserSessionUtils.getUserDetails();
      if (!user) {
        Alert.alert("Error", "User not found.");
        setLoading(false);
        return;
      }
      await api.put(`/users/${user.id}`, {
        password: newPassword,
        oldPassword: currentPassword,
      });
      Alert.alert("Success", "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigation.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ThemedText
            type="title"
            style={{ marginBottom: "8%", marginTop: "5%" }}
          >
            Change Password
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Current Password</ThemedText>
            <ThemedPassword
              placeholder="Enter your current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              errorMessage={currentPasswordError}
            />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">New Password</ThemedText>
            <ThemedPassword
              placeholder="Enter your new password"
              value={newPassword}
              onChangeText={setNewPassword}
              errorMessage={newPasswordError}
            />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Confirm Password</ThemedText>
            <ThemedPassword
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              errorMessage={confirmPasswordError}
            />
          </ThemedView>

          <ThemedView style={{ marginTop: "5%", width: "100%" }}>
            <Button
              type="default"
              title="Update Password"
              onPress={handlePasswordChange}
              loading={loading}
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
    marginBottom: 10,
  },
  keyboardAvoid: {
    width: "100%",
    flexGrow: 1,
  },
});
