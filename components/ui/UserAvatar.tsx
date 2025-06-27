import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "../ThemedView";
import { Image } from "expo-image";
import { ThemedText } from "../ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { UserSessionUtils } from "@/utils/UserSessionUtils";

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
  const [user, setUser] = useState<User | null>(propUser ?? null);
  const profileBorder = useThemeColor({}, "text");

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
      return;
    }
    const fetchUser = async () => {
      const userData = await UserSessionUtils.getUserDetails();
      setUser(userData);
    };
    fetchUser();
  }, [propUser]);

  const getInitial = () => {
    const displayName = user?.fullName || user?.name || "";
    if (!displayName) return "U";
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
            borderColor: user?.image ? "transparent" : profileBorder,
            borderWidth: user?.image ? 0 : 3,
            overflow: "hidden",
          },
        ]}
      >
        {user?.image ? (
          <Image
            source={{ uri: user.image }}
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
  },
  initialContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    textAlign: "center",
    height: "100%",
    width: "100%",
    textAlignVertical: "center",
  },
});