import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { ThemedCheckbox, ThemedEmailInput } from "@/components/ThemedInput";
import { ThemedPassword } from "@/components/ThemedPassword";

import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

export default function LoginScreen() {
  const [checked, setChecked] = useState(false);
  const navigation = useRouter();

  const handleSignin = (): void => {
    navigation.replace("/(resident-manager)");
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
            <Image source={require("../../assets/images/logo-new.png")} style={{height: 150, width: 150}}/>
          </ThemedView>

          <ThemedText type="subtitle" style={{ marginBottom: "5%" }}>
            Sign into your account
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Email</ThemedText>
            <ThemedEmailInput placeholder="Enter your email address" />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Password</ThemedText>
            <ThemedPassword placeholder="Enter your password" />
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
            <Button type="default" title="Signin" onPress={handleSignin} />
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
            <ThemedText type="link">Create Account</ThemedText>
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
    justifyContent: 'center',
    alignItems: 'center'
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
