import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "../ThemedView";
import { Image } from "expo-image";
import { ThemedText } from "../ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

import { useReduxAuth } from "@/hooks/useReduxAuth";

type User = {
  fullName?: string;
  name?: string;
  email?: string;
  image?: string;
};

type AvatarProps = {
  size?: number;
  user?: User;
};

export function UserAvatar({ size = 40, user: propUser }: AvatarProps) {
  const profileBorder = useThemeColor({}, "text");
  const { user: authUser } = useReduxAuth();

 const displayUser = propUser || authUser;

  const getInitial = () => {
    const displayName = displayUser?.name || displayUser?.name || "U";
    return displayName.trim().charAt(0).toUpperCase();
  };

  return (
    <TouchableOpacity activeOpacity={0.7}>
      <ThemedView
        style={[
          styles.container,
          {
            height: size,
            width: size,
            borderRadius: size / 2,
            backgroundColor: "#F2F2F2",
            borderColor: displayUser?.image ? "transparent" : profileBorder,
            borderWidth: displayUser?.image ? 0 : 3,
            overflow: "hidden",
          },
        ]}
      >
        {displayUser?.image ? (
          <Image
            source={{ uri: displayUser.image }}
            style={{
              height: size,
              width: size,
              borderRadius: size / 2,
            }}
          />
        ) : (
          <ThemedView
            style={[
              styles.initialContainer,
              { height: size, width: size, borderRadius: size / 2 },
            ]}
          >
            <ThemedText
              type="default"
              style={[styles.initial, { fontSize: size * 0.5 }]}
            >
              {getInitial()}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1
  },
  initialContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  initial: {
    textAlign: "center",
    textAlignVertical: "center",
  },
});