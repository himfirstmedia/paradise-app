import { useThemeColor } from "@/hooks/useThemeColor";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";

export type ThemedInputProps = {
  type?: "default" | "floating" | "rounded";
  placeholder?: string;
  errorMessage?: string | null;
} & TextInputProps;

export function ThemedPassword({
  type = "default",
  placeholder,
  errorMessage, 
  ...rest
}: ThemedInputProps) {
  const bgColor = useThemeColor({}, "input");
  const errorColor = useThemeColor({}, "overdue");
  const iconColor = useThemeColor({}, "placeholder");
  const [value, setValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChangeText = (text: string) => {
    setValue(text);
    if (rest.onChangeText) rest.onChangeText(text);
  };

  return (
    <>
      <View style={{ position: "relative", width: "100%" }}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: bgColor },
            type === "default" ? styles.default : undefined,
            type === "floating" ? styles.floating : undefined,
            type === "rounded" ? styles.rounded : undefined,
            { paddingRight: 40 }, // space for the toggle button
          ]}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={useThemeColor({}, "selection")}
          placeholder={placeholder}
          placeholderTextColor={useThemeColor({}, "placeholder")}
          value={value}
          onChangeText={handleChangeText}
          {...rest}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          style={{
            position: "absolute",
            right: 10,
            top: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <Image
              source={require("../assets/icons/show.png")}
              style={{ height: 20, width: 20, tintColor: iconColor }}
            />
          ) : (
            <Image
              source={require("../assets/icons/hide.png")}
              style={{ height: 20, width: 20, tintColor: iconColor }}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={{ height: 20, justifyContent: "center" }}>
        {errorMessage && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[styles.dot, { backgroundColor: errorColor }]} />
            <Text style={[styles.error, { color: errorColor }]}>{errorMessage}</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  text: {
    color: "#fff",
  },
  dot: {
    height: 5,
    width: 5,
    borderRadius: 10,
  },
  default: {
    minWidth: "100%",
    borderRadius: 10,
  },
  floating: {},
  rounded: {},
  error: {},
});