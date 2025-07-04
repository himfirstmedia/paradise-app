import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Pressable,
} from "react-native";

import { Alert } from "@/components/Alert";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { ThemedCheckbox, ThemedEmailInput } from "@/components/ThemedInput";
import { ThemedPassword } from "@/components/ThemedPassword";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useAppSelector } from "@/redux/hooks";

type AppRoutes =
  | "/(director)"
  | "/(resident-manager)"
  | "/(facility-manager)"
  | "/(residents)"
  | "/(individuals)"
  | "/auth/login";

export default function LoginScreen() {
  const router = useRouter();
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"default" | "error" | "success">(
    "default"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(true);
  const { signin, loading } = useReduxAuth();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (alertMessage) {
      const timeout = setTimeout(() => setAlertMessage(""), 6000);
      return () => clearTimeout(timeout);
    }
  }, [alertMessage]);

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      console.log("✅ Logged in User:", user);

      const roleRoutes: Record<string, AppRoutes> = {
        SUPER_ADMIN: "/(director)",
        DIRECTOR: "/(director)",
        RESIDENT_MANAGER: "/(resident-manager)",
        FACILITY_MANAGER: "/(facility-manager)",
        RESIDENT: "/(residents)",
        INDIVIDUAL: "/(individuals)",
      };

      console.log(`User role: ${user.role}`);
      const route = roleRoutes[user.role] || "/auth/login";
      console.log(`Redirecting to: ${route}`);

      router.replace(route);
    } else if (isAuthenticated) {
      console.warn("⚠️ Authenticated but missing role:", user);
    }
  }, [isAuthenticated, user, router]);

  const handleSignin = async (): Promise<void> => {
    if (!email || !password) {
      setAlertMessage("Please enter both email and password.");
      setAlertType("error");
      return;
    }

    try {
      await signin(email, password);
    } catch (error: unknown) {
      let errorMessage = "Invalid credentials. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setAlertMessage(errorMessage);
      setAlertType("error");
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
          <ThemedView style={styles.logo}>
            <Image
              source={require("../../assets/images/logo-new.png")}
              style={{ height: 150, width: 150 }}
            />
          </ThemedView>

          <ThemedText type="subtitle" style={{ marginBottom: "5%" }}>
            Sign into your account
          </ThemedText>

          {alertMessage ? (
            <Alert message={alertMessage} type={alertType} duration={6000} />
          ) : null}

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Email</ThemedText>
            <ThemedEmailInput
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Password</ThemedText>
            <ThemedPassword
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
            />
          </ThemedView>

          <View style={{ width: "100%", alignItems: "flex-end" }}>
            <ThemedText
              type="link"
              onPress={() => router.push("/auth/forgot_password")}
            >
              Forgot Password?
            </ThemedText>
          </View>

          <View style={{ width: "100%", alignItems: "flex-start" }}>
            <ThemedCheckbox
              label="By using this app, you agree to the terms and conditions."
              checked={checked}
              onChange={setChecked}
            />
          </View>

          <View style={{ marginTop: "5%", width: "100%" }}>
            <Button
              type="default"
              title="Signin"
              onPress={handleSignin}
              loading={loading}
            />
          </View>

          {/* <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: "10%",
            }}
          >
            <ThemedText type="default">Don&apos;t have an account?</ThemedText>
            <Pressable onPress={() => router.push("/auth/signup")}>
              <ThemedText type="link">Create Account</ThemedText>
            </Pressable>
          </View> */}
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  logo: {
    height: 160,
    width: 160,
    borderRadius: 200,
    justifyContent: "center",
    alignItems: "center",
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
