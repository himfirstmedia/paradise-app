import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  ImageSourcePropType,
  StyleProp,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "../ThemedText";

export type FloatingChildButton = {
  icon: ImageSourcePropType;
  onPress: () => void;
  label?: string;
  style?: ViewStyle;
};

export type ThemedButtonProps = {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "icon" | "rounded" | "icon-rounded";
  icon?: ImageSourcePropType;
  onPress?: (data?: any) => void;
  childrenButtons?: FloatingChildButton[];
  style?: StyleProp<ViewStyle>
};

export function FloatingButton({
  lightColor,
  darkColor,
  type = "default",
  icon,
  onPress,
  childrenButtons = [],
  style,
  ...rest
}: ThemedButtonProps) {
  const bgColor = useThemeColor({ light: lightColor, dark: darkColor }, "button");
  const [expanded, setExpanded] = useState(false);

  // Per-button animation values
  const animatedValues = useRef(
    childrenButtons.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((anim) =>
      Animated.timing(anim, {
        toValue: expanded ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      })
    );

    Animated.stagger(30, expanded ? animations : animations.reverse()).start();
  }, [animatedValues, expanded]);

  const handleMainPress = () => {
    if (childrenButtons.length > 0) setExpanded((prev) => !prev);
    onPress?.();
  };

  return (
    <View style={[styles.container, style]}>
      {childrenButtons.map((btn, idx) => {
            const opacity = animatedValues[idx];
            const translateY = animatedValues[idx].interpolate({
              inputRange: [0, 2],
              outputRange: [20, 0],
            });

            return (
              <Animated.View
                key={idx}
                style={{
                  opacity,
                  transform: [{ translateY }],
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                  // borderWidth: 1,
                  marginRight: 8,
                  
                }}
              >
                {/* Render label if present */}
                {btn.label && (
                  <ThemedText style={[styles.childLabel]}>{btn.label}</ThemedText>
                )}
                <Pressable
                  style={[
                    styles.childButton,
                    { backgroundColor: bgColor },
                    btn.style,
                  ]}
                  onPress={() => {
                    setExpanded(false);
                    btn.onPress();
                  }}
                >
                  <Image source={btn.icon} style={styles.icon} />
                </Pressable>
              </Animated.View>
            );
          })}

      <Pressable
        style={[
          styles.button,
          { backgroundColor: bgColor },
          typeStyles[type],
        ]}
        onPress={handleMainPress}
        android_ripple={{ color: "#00000010", borderless: false }}
        {...rest}
      >
        <Image
          source={
            expanded
              ? icon || require("@/assets/icons/briefcase.png")
              : icon || require("@/assets/icons/briefcase.png")
          }
          style={[styles.icon, { height: 32, width: 32 }]}
        />
      </Pressable>
    </View>
  );
}

const typeStyles: Record<string, ViewStyle> = {
  default: {
    borderRadius: 12,
  },
  icon: {
    borderRadius: 12,
  },
  rounded: {
    borderRadius: 999,
  },
  "icon-rounded": {
    borderRadius: 999,
  },
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: "5%",
    right: "5%",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    flexDirection: "column",
    width: "100%",
    gap: 20,
  },
  childrenContainer: {
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 15,
    width: "100%",
    marginRight: 20,
    borderWidth: 1,
  },
  childLabel: {
    marginRight: 6,
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: "hidden",
    width: 160,
    textAlign: "right"
  },
  button: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  childButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
  },
  icon: {
    height: 28,
    width: 28,
    tintColor: "#FFF",
  },
});
