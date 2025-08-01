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
  useWindowDimensions,
} from "react-native";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function ChangePasswordScreen() {
  const errorColor = useThemeColor({}, "overdue");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const navigation = useRouter();
  const { user } = useReduxAuth(); 
  const { width } = useWindowDimensions();
      
        const isLargeScreen = Platform.OS === "web" && width >= 1024;
        const isMediumScreen = Platform.OS === "web" && width >= 768;

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
    if (!user || !user.id) {
      Alert.alert("Error", "User not found.");
      setLoading(false);
      return;
    }

    // Send password data at root level
    await api.put(`/users/${user.id}`, {
      oldPassword: currentPassword,
      password: newPassword
    });
    
    Alert.alert("Success", "Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    navigation.back();
  } catch (error: any) {
    let errorMessage = "Failed to update password. Please try again.";
    
    if (error.response) {
      // Handle backend error messages
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    Alert.alert("Error", errorMessage);
  } finally {
    setLoading(false);
  }
};

const Dot = () => {
    return (
      <ThemedText style={{ color: errorColor }}>*</ThemedText>
    );
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
    <>
          <ThemedView style={[styles.container, responsiveStyles.containerPadding]}>
      
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 40}
        >
          <ThemedText
            type="title"
            style={{ marginBottom: 30, marginTop: 15 }}
          >
            Change Password
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Current Password <Dot /></ThemedText>
            <ThemedPassword
              placeholder="Enter your current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              errorMessage={currentPasswordError}
            />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">New Password <Dot /></ThemedText>
            <ThemedPassword
              placeholder="Enter your new password"
              value={newPassword}
              onChangeText={setNewPassword}
              errorMessage={newPasswordError}
            />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Confirm Password <Dot /></ThemedText>
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
