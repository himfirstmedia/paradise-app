// src/components/ui/Button.tsx
import { useThemeColor } from "@/hooks/useThemeColor";
import { type ButtonProps as RNButtonProps, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "../ThemedText";

export type ButtonProps = RNButtonProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "icon" | "rounded" | "icon-rounded";
  title?: string;
  loading?: boolean;
  style?: any;
  textStyle?: any; // Add textStyle prop
};

export function Button({
  lightColor,
  darkColor,
  type = "default",
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  ...rest
}: ButtonProps) {
  const bgColor = useThemeColor({}, "button");

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: bgColor },
        type === "default" && styles.default,
        type === "icon" && styles.icon,
        type === "rounded" && styles.rounded,
        type === "icon-rounded" && styles.iconRounded,
        loading && { opacity: 0.7 },
        style, // Apply custom style
      ]}
      onPress={loading ? undefined : onPress}
      disabled={loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <ThemedText type='default' style={[styles.text, textStyle]}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
  default: {},
  icon: {},
  rounded: {
    borderRadius: 24,
  },
  iconRounded: {
    borderRadius: 24,
    width: 48,
    height: 48,
  },
});