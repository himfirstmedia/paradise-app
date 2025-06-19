import { useThemeColor } from "@/hooks/useThemeColor";
import { type ButtonProps, Pressable, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";

export type ThemedButtonProps = ButtonProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "icon" | "rounded" | "icon-rounded";
  title?: string;
};

export function Button({
  lightColor,
  darkColor,
  type = "default",
  title,
  onPress,
  ...rest
}: ThemedButtonProps) {

  const bgColor = useThemeColor({}, "button");

  return (
    <>
      <Pressable
        style={[
          styles.button,
          { backgroundColor: bgColor },
          type === "default" ? styles.default : undefined,
          type === "icon" ? styles.icon : undefined,
          type === "rounded" ? styles.rounded : undefined,
          type === "icon-rounded" ? styles.iconRounded : undefined,
        ]}
        onPress={onPress}
      >
        <ThemedText type='default' style={styles.text}>{title}</ThemedText>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10
  },
  text: {
    color: "#fff"
  },
  default: {
    minWidth: "100%",
    borderRadius: 10,
  },
  icon: {},
  rounded: {},
  iconRounded: {},
});
