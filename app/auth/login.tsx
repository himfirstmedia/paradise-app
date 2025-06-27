import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
   Pressable,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { ThemedCheckbox, ThemedEmailInput } from "@/components/ThemedInput";
import { ThemedPassword } from "@/components/ThemedPassword";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

import { useReduxAuth } from "@/hooks/useReduxAuth";

export default function LoginScreen() {

  const navigation = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);

  const { signin, loading, error } = useReduxAuth();


  const handleSignin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    const resultAction = await signin(email, password);

    // If using createAsyncThunk, check for fulfilled/rejected
    if (resultAction.type && resultAction.type.endsWith("/fulfilled")) {
      const role = resultAction.payload.role;
      if (role === "SUPER_ADMIN" || role === "DIRECTOR") {
        navigation.replace("/(director)");
      } else if (role === "RESIDENT_MANAGER") {
        navigation.replace("/(resident-manager)");
      } else if (role === "FACILITY_MANAGER") {
        navigation.replace("/(facility-manager)");
      } else if (role === "RESIDENT") {
        navigation.replace("/(residents)");
      } else if (role === "INDIVIDUAL") {
        navigation.replace("/(individuals)");
      } else {
        Alert.alert("Login Failed", "Unknown user role.");
      }
    } else {
      Alert.alert("Login Failed", error || "Invalid login credentials.");
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
              onPress={() => navigation.push("/auth/forgot_password")}
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

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: "10%",
            }}
          >
            <ThemedText type="default">Don&apos;t have an account?</ThemedText>
            <Pressable onPress={() => navigation.push("/auth/signup")}>
            <ThemedText type="link">Create Account</ThemedText>
            </Pressable>
          </View>
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
