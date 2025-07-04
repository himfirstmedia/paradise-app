import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  GestureResponderEvent,
  ViewStyle,
  ImageSourcePropType,
  StyleProp,
  TextStyle,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

type ButtonProps = {
  title?: string;
  onPress: (event: GestureResponderEvent) => void;
  loading?: boolean;
  type?: "default" | "icon-rounded";
  disabled?: boolean;
  icon?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  type = "default",
  icon,
  style,
}) => {
  const bgColor = useThemeColor({}, "selection");
  const isIconRounded = type === "icon-rounded";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        isIconRounded ? styles.rounded : styles.default,
        { backgroundColor: disabled || loading ? bgColor : bgColor },
        style
      ]}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : isIconRounded && icon ? (
        <Image source={icon} style={styles.iconImage} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
  default: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    width: "100%",
  },
  rounded: {
    width: 60,
    height: 60,
    borderRadius: 999,
  },
  text: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  iconImage: {
    width: 28,
    height: 28,
    tintColor: "#FFF", // Optional, remove if you want original icon colors
    resizeMode: "contain",
  },
});
